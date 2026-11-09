-- ==============================================================================
-- SAFARIA Tours & Travels — Individual Staff Accounts, Audit & Distributed Rate Limits
-- Migration: 003_staff_users_and_rate_limits.sql
-- ==============================================================================

-- 1. STAFF USERS (Individual authenticated staff accounts with RBAC)
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OPS_AGENT', 'FINANCE_DESK')),
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_users_email ON staff_users(email);
CREATE INDEX IF NOT EXISTS idx_staff_users_status ON staff_users(status);

-- 2. STAFF ADMINISTRATIVE AUDIT LOGS
CREATE TABLE IF NOT EXISTS staff_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff_users(id) ON DELETE SET NULL,
    staff_email VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64),
    target_id VARCHAR(64),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_audit_logs_staff ON staff_audit_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_audit_logs_action ON staff_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_staff_audit_logs_created_at ON staff_audit_logs(created_at);

-- 3. DISTRIBUTED RATE LIMITS (Atomic shared backend for multi-instance serverless)
CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(128) PRIMARY KEY,
    points INT NOT NULL DEFAULT 1,
    expire_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expire_at ON rate_limits(expire_at);

-- ==============================================================================
-- STRICT ROW-LEVEL SECURITY (RLS) FOR STAFF & RATE LIMIT TABLES
-- ==============================================================================

ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Staff credentials and audit records are strictly internal:
-- Service role only; no anonymous or general authenticated access
REVOKE ALL ON staff_users FROM anon, authenticated;
REVOKE ALL ON staff_audit_logs FROM anon, authenticated;
GRANT ALL PRIVILEGES ON staff_users TO service_role;
GRANT ALL PRIVILEGES ON staff_audit_logs TO service_role;

CREATE POLICY "Privileged service access to staff users"
    ON staff_users FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service access to staff audit logs"
    ON staff_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Rate limits table allows atomic consumption across server roles
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO anon, authenticated, service_role;

CREATE POLICY "Public rate limits operations"
    ON rate_limits FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
