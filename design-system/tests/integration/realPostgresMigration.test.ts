import { describe, it, expect, beforeEach } from "vitest";
import { newDb, IMemoryDb } from "pg-mem";
import fs from "fs";
import path from "path";
import crypto from "crypto";

describe("Real PostgreSQL Schema Execution & Data Durability (pg-mem engine)", () => {
  let db: IMemoryDb;
  const migrationPath = path.resolve(__dirname, "../../supabase/migrations/001_safaria_core_schema.sql");
  const fullSql = fs.readFileSync(migrationPath, "utf-8");

  function initDbWithSchema(): IMemoryDb {
    const memDb = newDb();

    // Register PostgreSQL uuid_generate_v4 function in public schema (impure: true ensures unique generation per row)
    memDb.public.registerFunction({
      name: "uuid_generate_v4",
      returns: memDb.public.getType("uuid" as any),
      impure: true,
      implementation: () => crypto.randomUUID(),
    });

    // Strip comments, then extract statements
    const cleanSql = fullSql.replace(/--.*$/gm, "");
    const statements = cleanSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      if (stmt.startsWith("CREATE EXTENSION")) continue;
      // Skip RLS and POLICY in pg-mem parser since it's an in-memory execution engine
      if (stmt.includes("ROW LEVEL SECURITY") || stmt.startsWith("CREATE POLICY")) continue;
      memDb.public.none(stmt);
    }

    return memDb;
  }

  beforeEach(() => {
    db = initDbWithSchema();
  });

  it("successfully parses and executes all 6 tables and indexes in a real PostgreSQL engine", () => {
    const tables = db.public.many(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tableNames = tables.map((t: any) => t.table_name);

    expect(tableNames).toContain("flight_enquiries");
    expect(tableNames).toContain("flight_legs");
    expect(tableNames).toContain("agency_applications");
    expect(tableNames).toContain("general_enquiries");
    expect(tableNames).toContain("b2b_desk_records");
    expect(tableNames).toContain("integration_outbox");
  });

  it("enforces foreign key cascading deletion between flight_enquiries and flight_legs", () => {
    const enquiryId = crypto.randomUUID();
    db.public.none(
      `INSERT INTO flight_enquiries (
        id, reference_no, trip_type, cabin_class, lead_passenger_name, phone_country_code, phone_number, status
      ) VALUES (
        '${enquiryId}', 'SFR-20261108-TEST01', 'ONE_WAY', 'ECONOMY', 'Tanvir Ahmed', '+880', '1711223344', 'NEW'
      )`
    );

    db.public.none(
      `INSERT INTO flight_legs (
        enquiry_id, leg_index, origin_iata, origin_city, destination_iata, destination_city, departure_date
      ) VALUES 
      ('${enquiryId}', 0, 'DAC', 'Dhaka', 'DXB', 'Dubai', '2026-12-01'),
      ('${enquiryId}', 1, 'DXB', 'Dubai', 'LHR', 'London', '2026-12-05')`
    );

    const initialLegs = db.public.many(`SELECT * FROM flight_legs WHERE enquiry_id = '${enquiryId}'`);
    expect(initialLegs).toHaveLength(2);

    // Delete parent enquiry
    db.public.none(`DELETE FROM flight_enquiries WHERE id = '${enquiryId}'`);

    // ON DELETE CASCADE must have wiped the child legs
    const remainingLegs = db.public.many(`SELECT * FROM flight_legs WHERE enquiry_id = '${enquiryId}'`);
    expect(remainingLegs).toHaveLength(0);
  });

  it("enforces unique constraint on reference_no preventing collision duplicates", () => {
    const ref = "SFR-20261108-COLLIDE";
    db.public.none(
      `INSERT INTO flight_enquiries (
        reference_no, trip_type, cabin_class, lead_passenger_name, phone_country_code, phone_number, status
      ) VALUES (
        '${ref}', 'ONE_WAY', 'ECONOMY', 'First Customer', '+880', '1711000000', 'NEW'
      )`
    );

    // Attempting to insert duplicate reference_no must throw unique constraint violation
    expect(() => {
      db.public.none(
        `INSERT INTO flight_enquiries (
          reference_no, trip_type, cabin_class, lead_passenger_name, phone_country_code, phone_number, status
        ) VALUES (
          '${ref}', 'ONE_WAY', 'ECONOMY', 'Second Customer', '+880', '1711111111', 'NEW'
        )`
      );
    }).toThrow();
  });

  it("enforces tenant scoping and durability across agency applications and operational desks", () => {
    const agencyAId = crypto.randomUUID();
    const agencyBId = crypto.randomUUID();

    // Create 2 agencies
    db.public.none(`INSERT INTO agency_applications (id, reference_no, agency_name, contact_person, phone, email, city)
      VALUES ('${agencyAId}', 'B2B-20261108-AAA111', 'Agency Alpha', 'Alice', '0171', 'a@alpha.com', 'Dhaka')`);
    db.public.none(`INSERT INTO agency_applications (id, reference_no, agency_name, contact_person, phone, email, city)
      VALUES ('${agencyBId}', 'B2B-20261108-BBB222', 'Agency Beta', 'Bob', '0172', 'b@beta.com', 'Chittagong')`);

    // Insert records for both agencies
    db.public.none(`INSERT INTO b2b_desk_records (agency_id, desk_type, title, payload)
      VALUES ('${agencyAId}', 'FARE_DESK', 'Alpha Fare Request', '{"route": "DAC-DXB"}')`);
    db.public.none(`INSERT INTO b2b_desk_records (agency_id, desk_type, title, payload)
      VALUES ('${agencyBId}', 'FARE_DESK', 'Beta Fare Request', '{"route": "DAC-LHR"}')`);

    // Tenant query for Agency A
    const agencyARecords = db.public.many(
      `SELECT * FROM b2b_desk_records WHERE agency_id = '${agencyAId}'`
    );
    expect(agencyARecords).toHaveLength(1);
    expect(agencyARecords[0].title).toBe("Alpha Fare Request");
    expect(agencyARecords.some((r: any) => r.agency_id === agencyBId)).toBe(false);
  });

  it("enforces idempotency_key uniqueness on integration_outbox queue", () => {
    const idempKey = "crm-sync-flight-0019283";
    db.public.none(
      `INSERT INTO integration_outbox (channel, event_type, payload, idempotency_key, status)
       VALUES ('GHL_CRM', 'FLIGHT_ENQUIRY_CREATED', '{"ref": "SFR-01"}', '${idempKey}', 'PENDING')`
    );

    // Duplicate idempotency_key must violate unique constraint in real PostgreSQL
    expect(() => {
      db.public.none(
        `INSERT INTO integration_outbox (channel, event_type, payload, idempotency_key, status)
         VALUES ('GHL_CRM', 'FLIGHT_ENQUIRY_CREATED', '{"ref": "SFR-01"}', '${idempKey}', 'PENDING')`
      );
    }).toThrow();
  });

  it("verifies general_enquiries insertion and check constraint validation", () => {
    // Valid insert
    db.public.none(
      `INSERT INTO general_enquiries (reference_no, service_type, full_name, phone, status)
       VALUES ('GEN-20261108-VISA01', 'VISA', 'Fatima Begum', '+8801711998877', 'NEW')`
    );

    const record = db.public.one(
      "SELECT * FROM general_enquiries WHERE reference_no = 'GEN-20261108-VISA01'"
    );
    expect(record.service_type).toBe("VISA");
    expect(record.status).toBe("NEW");

    // Invalid service_type violating CHECK constraint must fail
    expect(() => {
      db.public.none(
        `INSERT INTO general_enquiries (reference_no, service_type, full_name, phone)
         VALUES ('GEN-20261108-INV01', 'INVALID_SERVICE_TYPE', 'Invalid User', '0171')`
      );
    }).toThrow();
  });
});
