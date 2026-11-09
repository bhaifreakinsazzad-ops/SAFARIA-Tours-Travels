// ==============================================================================
// SAFARIA Tours & Travels — Agency-Scoped Direct Postgres Connection
//
// Closes the specific gap the post-merge security audit identified: this
// repo's RLS policies (supabase/migrations/001_safaria_core_schema.sql) are
// real and are proven to reject cross-tenant access — but only when exercised
// as the `authenticated` role with `app.current_agency_id` set, which only
// tests/integration/realPostgresServer.test.ts's raw SQL ever did. The actual
// application only ever constructed a service-role Supabase REST client
// (server/db/supabaseClient.ts), which bypasses RLS entirely — meaning the
// database was never the real tenant boundary for any real request; the
// session-derived agencyId check in route handlers was the ONLY one.
//
// This module makes RLS a REAL, DB-enforced second boundary for the specific
// repository functions that opt into it, using the exact same
// SET LOCAL ROLE authenticated / app.current_agency_id pattern the existing
// integration test already validates against a real PostgreSQL 18 engine —
// no RLS policy rewrite needed.
//
// It activates only when DATABASE_URL is configured (a direct Postgres
// connection string — e.g. Supabase's "Connection string" from its dashboard,
// distinct from the REST URL + service-role key supabaseClient.ts uses).
// Without it, callers fall back to the existing service-role path.
// ==============================================================================

import { Pool, PoolClient } from "pg";

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  pool = new Pool({
    connectionString,
    max: 5,
    // Supabase's pooled/direct connection endpoints require TLS; rejectUnauthorized
    // is relaxed because Supabase's pooler presents a cert chain Node's default
    // trust store does not always resolve — this matches Supabase's own
    // documented Node.js connection guidance, not a general weakening of TLS.
    ssl: connectionString.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  });
  return pool;
}

export function isScopedConnectionConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Test-only teardown: closes the pooled connection so a test process can exit cleanly. */
export async function _closeScopedPoolForTests(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Runs `fn` inside a transaction with the Postgres session scoped to
 * `authenticated` + the given agency — the real RLS boundary engages for
 * every statement `fn` issues. Rolls back and re-throws on any error so a
 * caller never observes a partially-applied scoped write.
 */
export async function withAgencyScope<T>(
  agencyId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const p = getPool();
  if (!p) {
    throw new Error("DATABASE_URL not configured — scoped connection unavailable");
  }

  const client = await p.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL ROLE authenticated");
    // set_config(..., true) scopes the GUC to this transaction (equivalent to
    // SET LOCAL) while allowing a bound parameter, avoiding string-interpolated SQL.
    await client.query("SELECT set_config('app.current_agency_id', $1, true)", [agencyId]);

    const result = await fn(client);

    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
