// ==============================================================================
// SAFARIA Tours & Travels — Real Native PostgreSQL Server Integration Test
// Executes against real PostgreSQL 18 binary: RLS, Persistence Across Restarts,
// Concurrency with FOR UPDATE SKIP LOCKED, and Schema Migration Compatibility
// ==============================================================================

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";
import os from "os";
import { Client } from "pg";

describe("Real Native PostgreSQL 18 Server Engine (Directive 007)", () => {
  let pg: EmbeddedPostgres;
  let dbDir: string;
  const port = 54333; // Isolated test port

  beforeAll(async () => {
    dbDir = path.join(os.tmpdir(), `safaria_pg_real_${Date.now()}`);
    pg = new EmbeddedPostgres({
      databaseDir: dbDir,
      port,
      user: "postgres",
      password: "password",
      persistent: true, // Keep files on disk to test persistence across restarts
      authMethod: "password",
    });

    await pg.initialise();
    await pg.start();
  }, 120000);

  afterAll(async () => {
    try {
      await pg.stop();
    } catch (err) {
      // Ignore stop errors during cleanup
    }
    try {
      fs.rmSync(dbDir, { recursive: true, force: true });
    } catch {
      // Ignore directory removal failure on Windows locked files
    }
  }, 30000);

  it("boots real PostgreSQL 18 server and returns engine telemetry", async () => {
    const client = pg.getPgClient();
    await client.connect();
    const res = await client.query("SELECT version();");
    expect(res.rows[0].version).toContain("PostgreSQL 18");
    await client.end();
  }, 30000);

  it("applies 001_safaria_core_schema.sql DDL to real PostgreSQL engine without error", async () => {
    const migrationPath = path.resolve(__dirname, "../../supabase/migrations/001_safaria_core_schema.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    const client = pg.getPgClient();
    await client.connect();

    // Execute the complete real migration script
    await client.query(migrationSql);

    // Verify all 7 core tables exist in PostgreSQL information_schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map((r) => r.table_name);
    expect(tableNames).toContain("flight_enquiries");
    expect(tableNames).toContain("flight_legs");
    expect(tableNames).toContain("agency_applications");
    expect(tableNames).toContain("general_enquiries");
    expect(tableNames).toContain("b2b_desk_records");
    expect(tableNames).toContain("integration_outbox");
    expect(tableNames).toContain("revoked_sessions");

    await client.end();
  }, 30000);

  it("enforces real PostgreSQL Row Level Security (RLS) preventing anonymous PII extraction", async () => {
    const client = pg.getPgClient();
    await client.connect();

    // Insert a flight enquiry as service_role
    await client.query("SET ROLE service_role;");
    const insertRes = await client.query(`
      INSERT INTO flight_enquiries (
        reference_no, trip_type, cabin_class, lead_passenger_name, phone_country_code, phone_number, email
      ) VALUES (
        'SFR-20261108-RLSTEST', 'ONE_WAY', 'BUSINESS', 'Secret VIP Passenger', '+880', '1711223344', 'vip@secret.com'
      ) RETURNING id;
    `);
    const enquiryId = insertRes.rows[0].id;

    // Service role can read the customer record
    const serviceRead = await client.query(`
      SELECT lead_passenger_name FROM flight_enquiries WHERE id = $1;
    `, [enquiryId]);
    expect(serviceRead.rows.length).toBe(1);
    expect(serviceRead.rows[0].lead_passenger_name).toBe("Secret VIP Passenger");

    // Switch to anonymous role: RLS policy and permission guard MUST block reading customer PII
    await client.query("SET ROLE anon;");
    await expect(
      client.query("SELECT * FROM flight_enquiries WHERE id = $1;", [enquiryId])
    ).rejects.toThrow(/permission denied/i);

    // However, anonymous role CAN insert new quotation requests (write-only)
    const anonInsert = await client.query(`
      INSERT INTO flight_enquiries (
        reference_no, trip_type, cabin_class, lead_passenger_name, phone_country_code, phone_number
      ) VALUES (
        'SFR-20261108-ANONOK', 'ROUND_TRIP', 'ECONOMY', 'Public Submitter', '+880', '1800112233'
      );
    `);
    expect(anonInsert.rowCount).toBe(1);

    // Reset role to superuser
    await client.query("RESET ROLE;");
    await client.end();
  }, 30000);

  it("proves real database persistence and data durability across PostgreSQL server restart", async () => {
    const client1 = pg.getPgClient();
    await client1.connect();

    // Insert durable agency record
    await client1.query(`
      INSERT INTO agency_applications (
        reference_no, agency_name, contact_person, phone, email, city, status
      ) VALUES (
        'B2B-20261108-DURABLE', 'Durable Aviation Ltd', 'Tareq Ahmed', '+8801999111222', 'tareq@durable.com', 'Sylhet', 'ACTIVE_PARTNER'
      );
    `);
    await client1.end();

    // STOP the PostgreSQL server process completely
    await pg.stop();

    // RESTART the PostgreSQL server from the persistent cluster directory
    await pg.start();

    // Reconnect new client
    const client2 = pg.getPgClient();
    await client2.connect();

    const queryRes = await client2.query(`
      SELECT reference_no, agency_name, status 
      FROM agency_applications 
      WHERE reference_no = 'B2B-20261108-DURABLE';
    `);

    expect(queryRes.rows.length).toBe(1);
    expect(queryRes.rows[0].agency_name).toBe("Durable Aviation Ltd");
    expect(queryRes.rows[0].status).toBe("ACTIVE_PARTNER");

    await client2.end();
  }, 45000);

  it("executes atomic distributed job claiming with FOR UPDATE SKIP LOCKED across concurrent connections", async () => {
    const clientA = pg.getPgClient();
    const clientB = pg.getPgClient();
    await clientA.connect();
    await clientB.connect();

    // Seed 4 pending outbox entries
    for (let i = 1; i <= 4; i++) {
      await clientA.query(`
        INSERT INTO integration_outbox (
          channel, event_type, payload, idempotency_key, status
        ) VALUES (
          'GHL_CRM', 'CONTACT_UPSERT', '{"test": true}'::jsonb, 'pg-claim-test-${Date.now()}-${i}', 'PENDING'
        );
      `);
    }

    // Worker A claims 2 entries in transaction with SKIP LOCKED
    await clientA.query("BEGIN;");
    const claimA = await clientA.query(`
      UPDATE integration_outbox
      SET status = 'PROCESSING', locked_by = 'worker-node-1'
      WHERE id IN (
        SELECT id FROM integration_outbox
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 2
        FOR UPDATE SKIP LOCKED
      ) RETURNING id;
    `);

    // Worker B claims 2 entries in transaction with SKIP LOCKED concurrently
    await clientB.query("BEGIN;");
    const claimB = await clientB.query(`
      UPDATE integration_outbox
      SET status = 'PROCESSING', locked_by = 'worker-node-2'
      WHERE id IN (
        SELECT id FROM integration_outbox
        WHERE status = 'PENDING'
        ORDER BY created_at ASC
        LIMIT 2
        FOR UPDATE SKIP LOCKED
      ) RETURNING id;
    `);

    await clientA.query("COMMIT;");
    await clientB.query("COMMIT;");

    expect(claimA.rows.length).toBe(2);
    expect(claimB.rows.length).toBe(2);

    // Verify completely disjoint sets of claimed IDs
    const idsA = claimA.rows.map((r) => r.id);
    const idsB = claimB.rows.map((r) => r.id);
    for (const id of idsA) {
      expect(idsB).not.toContain(id);
    }

    await clientA.end();
    await clientB.end();
  }, 30000);

  it("verifies PostgreSQL cascading foreign key deletion on flight_legs", async () => {
    const client = pg.getPgClient();
    await client.connect();

    const parent = await client.query(`
      INSERT INTO flight_enquiries (
        reference_no, trip_type, lead_passenger_name, phone_country_code, phone_number
      ) VALUES (
        'SFR-20261108-CASCADE', 'ROUND_TRIP', 'Rahim Uddin', '+880', '1911002233'
      ) RETURNING id;
    `);
    const parentId = parent.rows[0].id;

    await client.query(`
      INSERT INTO flight_legs (enquiry_id, leg_index, origin_iata, origin_city, destination_iata, destination_city, departure_date)
      VALUES 
        ($1, 0, 'DAC', 'Dhaka', 'JED', 'Jeddah', '2026-12-01'),
        ($1, 1, 'JED', 'Jeddah', 'DAC', 'Dhaka', '2026-12-15');
    `, [parentId]);

    // Verify legs exist
    const beforeLegs = await client.query("SELECT count(*) FROM flight_legs WHERE enquiry_id = $1;", [parentId]);
    expect(parseInt(beforeLegs.rows[0].count, 10)).toBe(2);

    // Delete parent
    await client.query("DELETE FROM flight_enquiries WHERE id = $1;", [parentId]);

    // Child legs MUST be automatically deleted by PostgreSQL cascade
    const afterLegs = await client.query("SELECT count(*) FROM flight_legs WHERE enquiry_id = $1;", [parentId]);
    expect(parseInt(afterLegs.rows[0].count, 10)).toBe(0);

    await client.end();
  }, 30000);
});
