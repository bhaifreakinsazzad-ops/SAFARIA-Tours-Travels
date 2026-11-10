// ==============================================================================
// SAFARIA Tours & Travels — Real Native PostgreSQL Server Integration Test
// Executes against real PostgreSQL 18 binary: RLS, Persistence Across Restarts,
// Concurrency with FOR UPDATE SKIP LOCKED, Dynamic Port Allocation, and Schema Compatibility
// ==============================================================================

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import EmbeddedPostgres from "embedded-postgres";
import fs from "fs";
import path from "path";
import os from "os";
import net from "net";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { _closeScopedPoolForTests } from "@server/db/scopedPgClient";

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const p = (srv.address() as net.AddressInfo).port;
      srv.close((err) => {
        if (err) reject(err);
        else resolve(p);
      });
    });
  });
}

describe("Real Native PostgreSQL 18 Server Engine (Directive 007 & 011)", () => {
  let pg: EmbeddedPostgres;
  let dbDir: string;
  let port: number;

  beforeAll(async () => {
    port = await getFreePort();
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
    } catch {
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

  it("applies migrations 001, 002, 003 DDL to real PostgreSQL engine without error", async () => {
    const migrationDir = path.resolve(__dirname, "../../supabase/migrations");
    const migrationFiles = [
      "001_safaria_core_schema.sql",
      "002_agency_partner_credentials.sql",
      "003_staff_users_and_rate_limits.sql",
    ];

    const client = pg.getPgClient();
    await client.connect();

    for (const file of migrationFiles) {
      const fullPath = path.join(migrationDir, file);
      if (fs.existsSync(fullPath)) {
        const sql = fs.readFileSync(fullPath, "utf8");
        await client.query(sql);
      }
    }

    // Verify all core tables exist in PostgreSQL information_schema
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
    expect(tableNames).toContain("staff_users");
    expect(tableNames).toContain("staff_audit_logs");
    expect(tableNames).toContain("rate_limits");

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

    // Poll until all child postgres.exe processes on Windows have completely exited
    for (let i = 0; i < 20; i++) {
      try {
        const { execSync } = await import("child_process");
        const list = execSync('tasklist /fi "imagename eq postgres.exe" /nh', { encoding: "utf8" });
        if (!list.includes("postgres.exe")) break;
      } catch {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Re-instantiate pointing to the SAME physical database directory
    pg = new EmbeddedPostgres({
      databaseDir: dbDir,
      port,
      user: "postgres",
      password: "password",
      persistent: true,
      authMethod: "password",
    });

    await pg.start();

    // Reconnect and verify data survived the shutdown and crash recovery
    const client2 = pg.getPgClient();
    await client2.connect();

    const result = await client2.query(`
      SELECT agency_name, city, status 
      FROM agency_applications 
      WHERE reference_no = 'B2B-20261108-DURABLE';
    `);

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].agency_name).toBe("Durable Aviation Ltd");
    expect(result.rows[0].city).toBe("Sylhet");
    expect(result.rows[0].status).toBe("ACTIVE_PARTNER");

    await client2.end();
  }, 60000);

  it("demonstrates distributed worker row claiming with FOR UPDATE SKIP LOCKED without double delivery", async () => {
    const clientSetup = pg.getPgClient();
    await clientSetup.connect();

    // Clear and insert 4 pending jobs into integration_outbox
    await clientSetup.query("TRUNCATE TABLE integration_outbox;");
    await clientSetup.query(`
      INSERT INTO integration_outbox (channel, event_type, payload, idempotency_key, status)
      VALUES 
        ('GHL_CRM', 'FLIGHT_ENQUIRY', '{"ref": "JOB1"}'::jsonb, 'idem-job-1', 'PENDING'),
        ('GHL_CRM', 'FLIGHT_ENQUIRY', '{"ref": "JOB2"}'::jsonb, 'idem-job-2', 'PENDING'),
        ('GHL_CRM', 'FLIGHT_ENQUIRY', '{"ref": "JOB3"}'::jsonb, 'idem-job-3', 'PENDING'),
        ('GHL_CRM', 'FLIGHT_ENQUIRY', '{"ref": "JOB4"}'::jsonb, 'idem-job-4', 'PENDING');
    `);
    await clientSetup.end();

    // Worker A and Worker B run concurrent queries using FOR UPDATE SKIP LOCKED
    const clientA = pg.getPgClient();
    const clientB = pg.getPgClient();
    await clientA.connect();
    await clientB.connect();

    await clientA.query("BEGIN;");
    await clientB.query("BEGIN;");

    // Worker A claims 2 records
    const claimA = await clientA.query(`
      SELECT id, idempotency_key 
      FROM integration_outbox 
      WHERE status = 'PENDING' 
      ORDER BY created_at ASC 
      LIMIT 2 
      FOR UPDATE SKIP LOCKED;
    `);

    // Worker B claims 2 records concurrently — SKIP LOCKED must guarantee Worker B never sees Worker A's rows
    const claimB = await clientB.query(`
      SELECT id, idempotency_key 
      FROM integration_outbox 
      WHERE status = 'PENDING' 
      ORDER BY created_at ASC 
      LIMIT 2 
      FOR UPDATE SKIP LOCKED;
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

  it("enforces cross-tenant data isolation and role boundaries on b2b_desk_records in real PostgreSQL", async () => {
    const client = pg.getPgClient();
    await client.connect();

    // 1. Unprivileged role 'anon' is completely blocked from accessing b2b_desk_records
    await client.query("SET ROLE anon;");
    await expect(
      client.query("SELECT * FROM b2b_desk_records;")
    ).rejects.toThrow(/permission denied/i);
    await client.query("RESET ROLE;");

    // 2. Insert two distinct partner agencies (Agency Alpha and Agency Beta)
    await client.query("SET ROLE service_role;");
    const appAlpha = await client.query(`
      INSERT INTO agency_applications (
        reference_no, agency_name, contact_person, phone, email, city, status
      ) VALUES (
        'B2B-TENANT-ALPHA', 'Alpha Travels Ltd', 'Alpha Officer', '+8801700000001', 'alpha@tenants.com', 'Dhaka', 'ACTIVE_PARTNER'
      ) RETURNING id;
    `);
    const appBeta = await client.query(`
      INSERT INTO agency_applications (
        reference_no, agency_name, contact_person, phone, email, city, status
      ) VALUES (
        'B2B-TENANT-BETA', 'Beta Travels Ltd', 'Beta Officer', '+8801700000002', 'beta@tenants.com', 'Chittagong', 'ACTIVE_PARTNER'
      ) RETURNING id;
    `);

    const agencyAlphaId = appAlpha.rows[0].id;
    const agencyBetaId = appBeta.rows[0].id;

    await client.query(`
      INSERT INTO b2b_desk_records (agency_id, desk_type, title, status, payload)
      VALUES 
        ($1, 'FARE_DESK', 'Alpha Urgent Group Fare', 'OPEN', '{"groupSize": 25}'::jsonb),
        ($2, 'FARE_DESK', 'Beta Corporate Charter', 'OPEN', '{"groupSize": 50}'::jsonb);
    `, [agencyAlphaId, agencyBetaId]);

    // Tenant Alpha query must ONLY return Alpha's records
    const alphaRecords = await client.query(`
      SELECT title, agency_id FROM b2b_desk_records WHERE agency_id = $1;
    `, [agencyAlphaId]);
    expect(alphaRecords.rows.length).toBe(1);
    expect(alphaRecords.rows[0].title).toBe("Alpha Urgent Group Fare");
    expect(alphaRecords.rows[0].agency_id).toBe(agencyAlphaId);

    // Tenant Beta query must ONLY return Beta's records
    const betaRecords = await client.query(`
      SELECT title, agency_id FROM b2b_desk_records WHERE agency_id = $1;
    `, [agencyBetaId]);
    expect(betaRecords.rows.length).toBe(1);
    expect(betaRecords.rows[0].title).toBe("Beta Corporate Charter");
    expect(betaRecords.rows[0].agency_id).toBe(agencyBetaId);

    await client.query("RESET ROLE;");

    // 3. Database Engine RLS Verification with authenticated role:
    // When executing as 'authenticated' with app.current_agency_id = agencyAlphaId,
    // a SELECT with NO WHERE clause is filtered by PostgreSQL RLS to ONLY Alpha's rows.
    await client.query("BEGIN;");
    await client.query("SET ROLE authenticated;");
    await client.query(`SET LOCAL app.current_agency_id = '${agencyAlphaId}';`);

    const rlsAlphaRecords = await client.query("SELECT id, title, agency_id FROM b2b_desk_records;");
    expect(rlsAlphaRecords.rows.length).toBe(1);
    expect(rlsAlphaRecords.rows[0].title).toBe("Alpha Urgent Group Fare");
    expect(rlsAlphaRecords.rows[0].agency_id).toBe(agencyAlphaId);

    // Attempting to INSERT a record for Beta while authenticated as Alpha MUST be blocked by PostgreSQL RLS
    await client.query("SAVEPOINT rls_insert_test;");
    await expect(
      client.query(`
        INSERT INTO b2b_desk_records (agency_id, desk_type, title, status)
        VALUES ($1, 'FARE_DESK', 'Malicious Cross Tenant Insert', 'OPEN');
      `, [agencyBetaId])
    ).rejects.toThrow(/violates row-level security policy/i);
    await client.query("ROLLBACK TO SAVEPOINT rls_insert_test;");

    // Attempting to UPDATE Beta's record while authenticated as Alpha affects 0 rows
    const updateRes = await client.query(`
      UPDATE b2b_desk_records SET title = 'Hacked by Alpha' WHERE agency_id = $1;
    `, [agencyBetaId]);
    expect(updateRes.rowCount).toBe(0);

    await client.query("ROLLBACK;");
    await client.query("RESET ROLE;");
    await client.end();
  }, 30000);

  it("proves durable multi-instance session revocation persistence in revoked_sessions table", async () => {
    const client = pg.getPgClient();
    await client.connect();

    const jtiToRevoke = "jti-durable-revocation-test-12345";
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    // Insert revoked session record
    await client.query(`
      INSERT INTO revoked_sessions (jti, user_id, reason, expires_at)
      VALUES ($1, 'usr-agency-99', 'LOGOUT', $2);
    `, [jtiToRevoke, expiresAt]);

    // Check revoked session is found
    const res = await client.query(`
      SELECT jti, reason, expires_at FROM revoked_sessions WHERE jti = $1;
    `, [jtiToRevoke]);

    expect(res.rows.length).toBe(1);
    expect(res.rows[0].jti).toBe(jtiToRevoke);
    expect(res.rows[0].reason).toBe("LOGOUT");

    // Anonymous role is blocked from tampering with or reading revoked_sessions
    await client.query("SET ROLE anon;");
    await expect(
      client.query("SELECT * FROM revoked_sessions;")
    ).rejects.toThrow(/permission denied/i);
    await client.query("RESET ROLE;");

    await client.end();
  }, 30000);

  it("proves staff_users RBAC isolation and audit log persistence in real PostgreSQL", async () => {
    const client = pg.getPgClient();
    await client.connect();

    // 1. Anon role cannot select staff users
    await client.query("SET ROLE anon;");
    await expect(
      client.query("SELECT * FROM staff_users;")
    ).rejects.toThrow(/permission denied/i);
    await client.query("RESET ROLE;");

    // 2. Authenticated role cannot select staff users
    await client.query("SET ROLE authenticated;");
    await expect(
      client.query("SELECT * FROM staff_users;")
    ).rejects.toThrow(/permission denied/i);
    await client.query("RESET ROLE;");

    // 3. Service role can insert and read staff users
    await client.query("SET ROLE service_role;");
    const staffRes = await client.query(`
      INSERT INTO staff_users (email, full_name, role, password_hash, password_salt, status)
      VALUES ('ops.lead@safaria.vibing.world', 'Operations Lead', 'SUPER_ADMIN', 'mock_hash', 'mock_salt', 'ACTIVE')
      RETURNING id, email, role;
    `);
    expect(staffRes.rows.length).toBe(1);
    expect(staffRes.rows[0].email).toBe("ops.lead@safaria.vibing.world");
    expect(staffRes.rows[0].role).toBe("SUPER_ADMIN");

    // 4. Rate limits table is protected from anon manipulation (Directive 014 P0 security)
    await client.query("SET ROLE anon;");
    await expect(
      client.query(`
        INSERT INTO rate_limits (key, points, expire_at)
        VALUES ('test:anon:ip', 1, NOW() + INTERVAL '10 minutes')
        RETURNING points;
      `)
    ).rejects.toThrow();

    // 5. Rate limits table is accessible to service_role for atomic rate limiting
    await client.query("SET ROLE service_role;");
    const rateRes = await client.query(`
      INSERT INTO rate_limits (key, points, expire_at)
      VALUES ('test:anon:ip', 1, NOW() + INTERVAL '10 minutes')
      RETURNING points;
    `);
    expect(rateRes.rows[0].points).toBe(1);

    // 6. Directive 015: consume_rate_limit() execution is strictly denied to anon and granted to service_role
    await client.query("SET ROLE anon;");
    await expect(
      client.query("SELECT * FROM consume_rate_limit('test:anon:rpc', 60, 5);")
    ).rejects.toThrow();

    await client.query("SET ROLE service_role;");
    const rpcRes = await client.query("SELECT * FROM consume_rate_limit('test:service:rpc', 60, 5);");
    expect(rpcRes.rows[0].allowed).toBe(true);
    expect(rpcRes.rows[0].points).toBe(1);

    await client.query("RESET ROLE;");
    await client.end();
  }, 30000);

  it("proves Directive 015 atomic concurrency handling for rate limiting under simultaneous connections", async () => {
    const client1 = pg.getPgClient();
    const client2 = pg.getPgClient();
    const client3 = pg.getPgClient();

    await Promise.all([client1.connect(), client2.connect(), client3.connect()]);

    try {
      await Promise.all([
        client1.query("SET ROLE service_role;"),
        client2.query("SET ROLE service_role;"),
        client3.query("SET ROLE service_role;"),
      ]);

      const testKey = `concurrent:test:${Date.now()}`;

      // Execute 3 concurrent requests simultaneously when key does not exist yet
      const [res1, res2, res3] = await Promise.all([
        client1.query("SELECT * FROM consume_rate_limit($1, 60, 5);", [testKey]),
        client2.query("SELECT * FROM consume_rate_limit($1, 60, 5);", [testKey]),
        client3.query("SELECT * FROM consume_rate_limit($1, 60, 5);", [testKey]),
      ]);

      const points = [res1.rows[0].points, res2.rows[0].points, res3.rows[0].points].sort((a, b) => a - b);
      // Because operations are strictly serialized via FOR UPDATE row locking and atomic UPSERT,
      // the three points returned MUST be sequentially 1, 2, and 3 with zero lost increments.
      expect(points).toEqual([1, 2, 3]);
      expect(res1.rows[0].allowed).toBe(true);
      expect(res2.rows[0].allowed).toBe(true);
      expect(res3.rows[0].allowed).toBe(true);
    } finally {
      await Promise.all([client1.end(), client2.end(), client3.end()]);
    }
  }, 30000);

  it("closes the audited gap: enquiriesRepository's B2B desk functions themselves are RLS-enforced, not just raw SQL", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `postgres://postgres:password@localhost:${port}/postgres`;

    try {
      const client = pg.getPgClient();
      await client.connect();
      await client.query("SET ROLE service_role;");
      const appGamma = await client.query(`
        INSERT INTO agency_applications (reference_no, agency_name, contact_person, phone, email, city, status)
        VALUES ('B2B-TENANT-GAMMA', 'Gamma Travels Ltd', 'Gamma Officer', '+8801700000003', 'gamma@tenants.com', 'Dhaka', 'ACTIVE_PARTNER')
        RETURNING id;
      `);
      const appDelta = await client.query(`
        INSERT INTO agency_applications (reference_no, agency_name, contact_person, phone, email, city, status)
        VALUES ('B2B-TENANT-DELTA', 'Delta Travels Ltd', 'Delta Officer', '+8801700000004', 'delta@tenants.com', 'Chittagong', 'ACTIVE_PARTNER')
        RETURNING id;
      `);
      const agencyGammaId = appGamma.rows[0].id;
      const agencyDeltaId = appDelta.rows[0].id;
      await client.query("RESET ROLE;");
      await client.end();

      // Create through the repository (scoped path) for both agencies.
      const gammaRecord = await enquiriesRepository.createB2BDeskRecord(
        "FARE_DESK",
        agencyGammaId,
        "Gamma Scoped Fare Request",
        { note: "gamma" }
      );
      const deltaRecord = await enquiriesRepository.createB2BDeskRecord(
        "FARE_DESK",
        agencyDeltaId,
        "Delta Scoped Fare Request",
        { note: "delta" }
      );

      // Gamma's scoped list must see ONLY its own record, even with no
      // deskType/agency WHERE clause written in the SQL — RLS is doing it.
      const gammaView = await enquiriesRepository.listB2BDeskRecords(undefined, agencyGammaId);
      expect(gammaView.some((r) => r.id === gammaRecord.id)).toBe(true);
      expect(gammaView.some((r) => r.id === deltaRecord.id)).toBe(false);

      const deltaView = await enquiriesRepository.listB2BDeskRecords(undefined, agencyDeltaId);
      expect(deltaView.some((r) => r.id === deltaRecord.id)).toBe(true);
      expect(deltaView.some((r) => r.id === gammaRecord.id)).toBe(false);

      // Gamma attempting to update Delta's record by ID is rejected by RLS
      const crossTenantUpdate = await enquiriesRepository.updateB2BDeskRecord(
        deltaRecord.id,
        "RESOLVED",
        "attempted cross-tenant update",
        agencyGammaId
      );
      expect(crossTenantUpdate).toBeNull();

      // Delta updating its own record succeeds through the same scoped path.
      const ownUpdate = await enquiriesRepository.updateB2BDeskRecord(
        deltaRecord.id,
        "RESOLVED",
        "legitimate update",
        agencyDeltaId
      );
      expect(ownUpdate?.status).toBe("RESOLVED");
    } finally {
      await _closeScopedPoolForTests();
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  }, 30000);
});
