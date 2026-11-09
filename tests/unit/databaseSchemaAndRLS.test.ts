import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Database Schema & Strict RLS Audit (001_safaria_core_schema.sql)", () => {
  const schemaPath = path.resolve(__dirname, "../../supabase/migrations/001_safaria_core_schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  it("defines all six core tables with primary and foreign keys", () => {
    const requiredTables = [
      "flight_enquiries",
      "flight_legs",
      "agency_applications",
      "general_enquiries",
      "b2b_desk_records",
      "integration_outbox",
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }

    // Verify foreign key cascades
    expect(sql).toContain("REFERENCES flight_enquiries(id) ON DELETE CASCADE");
    expect(sql).toContain("REFERENCES agency_applications(id) ON DELETE SET NULL");
  });

  it("enforces collision-resistant unique reference numbers and idempotency keys", () => {
    expect(sql).toMatch(/reference_no VARCHAR\(\d+\) UNIQUE NOT NULL/);
    expect(sql).toMatch(/idempotency_key VARCHAR\(\d+\) UNIQUE NOT NULL/);
  });

  it("creates indexes on frequent lookup fields (status, reference_no, foreign keys)", () => {
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_flight_legs_enquiry_id");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_flight_enquiries_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_flight_enquiries_ref");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_agency_status");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_agency_ref");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_b2b_desk_agency");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_outbox_pending");
  });

  it("strictly enables Row Level Security (RLS) on all 6 tables", () => {
    const rlsTables = [
      "flight_enquiries",
      "flight_legs",
      "agency_applications",
      "general_enquiries",
      "b2b_desk_records",
      "integration_outbox",
    ];

    for (const table of rlsTables) {
      expect(sql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("guarantees write-only public access and strictly forbids public reads", () => {
    // Check that public anon policies only allow INSERT
    expect(sql).toContain("CREATE POLICY \"Public anonymous insert for flight enquiries\"");
    expect(sql).toContain("ON flight_enquiries FOR INSERT TO anon, authenticated");

    expect(sql).toContain("CREATE POLICY \"Public anonymous insert for flight legs\"");
    expect(sql).toContain("ON flight_legs FOR INSERT TO anon, authenticated");

    expect(sql).toContain("CREATE POLICY \"Public anonymous insert for agency applications\"");
    expect(sql).toContain("ON agency_applications FOR INSERT TO anon, authenticated");

    expect(sql).toContain("CREATE POLICY \"Public anonymous insert for general enquiries\"");
    expect(sql).toContain("ON general_enquiries FOR INSERT TO anon, authenticated");

    // Check that there is NO "FOR SELECT TO anon" policy in the entire migration
    expect(sql).not.toMatch(/FOR SELECT TO anon/i);
    expect(sql).not.toMatch(/FOR ALL TO anon/i);

    // Privileged access is restricted to service_role
    expect(sql).toContain("TO service_role USING (true) WITH CHECK (true)");
  });
});
