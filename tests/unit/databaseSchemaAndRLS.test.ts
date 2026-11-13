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

describe("B2B Subscription & Invoices Migration (005_b2b_subscriptions_and_invoices.sql)", () => {
  const migration005Path = path.resolve(
    __dirname,
    "../../supabase/migrations/005_b2b_subscriptions_and_invoices.sql"
  );
  const fullSchemaPath = path.resolve(__dirname, "../../supabase/FULL_PRODUCTION_SCHEMA.sql");
  const sql005 = fs.readFileSync(migration005Path, "utf-8");
  const fullSql = fs.readFileSync(fullSchemaPath, "utf-8");

  it("extends agency_applications with SUSPENDED status and Directive 005 subscription/telemetry columns", () => {
    expect(sql005).toContain("'SUSPENDED'");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS plan");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS subscription_started_at");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS subscription_expires_at");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS assigned_staff_owner");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS whatsapp_draft_opened");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS whatsapp_inbound_confirmed");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS pain_category");
    expect(sql005).toContain("ADD COLUMN IF NOT EXISTS district");
  });

  it("creates agency_invoices table with foreign key and strict RLS policies", () => {
    expect(sql005).toContain("CREATE TABLE IF NOT EXISTS agency_invoices");
    expect(sql005).toContain("REFERENCES agency_applications(id) ON DELETE CASCADE");
    expect(sql005).toContain("ALTER TABLE agency_invoices ENABLE ROW LEVEL SECURITY;");
    expect(sql005).toContain("ON agency_invoices FOR SELECT TO authenticated");
    expect(sql005).toContain("ON agency_invoices FOR ALL TO service_role USING (true) WITH CHECK (true)");
    expect(sql005).not.toMatch(/FOR SELECT TO anon/i);
  });

  it("includes agency_invoices and subscription columns inside FULL_PRODUCTION_SCHEMA.sql", () => {
    expect(fullSql).toContain("CREATE TABLE IF NOT EXISTS agency_invoices");
    expect(fullSql).toContain("whatsapp_draft_opened BOOLEAN");
    expect(fullSql).toContain("subscription_expires_at TIMESTAMPTZ");
  });
});

