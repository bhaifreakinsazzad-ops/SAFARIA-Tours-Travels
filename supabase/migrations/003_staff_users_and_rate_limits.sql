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

-- Rate limits table access is strictly restricted to service_role (backend server routes)
-- Anonymous and general authenticated client roles are explicitly REVOKED from manipulating rate limits
REVOKE ALL ON rate_limits FROM anon, authenticated;
GRANT ALL PRIVILEGES ON rate_limits TO service_role;

CREATE POLICY "Privileged service access to rate limits"
    ON rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Atomic SQL function to increment and consume rate limit window safely
CREATE OR REPLACE FUNCTION consume_rate_limit(
    p_key VARCHAR(128),
    p_window_seconds INT,
    p_max_points INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    points INT,
    remaining INT,
    retry_after_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_new_expire TIMESTAMPTZ := v_now + (p_window_seconds || ' seconds')::INTERVAL;
    v_record RECORD;
    v_points INT;
    v_expire TIMESTAMPTZ;
    v_retry INT := 0;
    v_allowed BOOLEAN := true;
BEGIN
    -- Strict input validation
    IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
        RAISE EXCEPTION 'Rate limit key cannot be null or empty';
    END IF;

    IF p_window_seconds <= 0 OR p_window_seconds > 86400 THEN
        RAISE EXCEPTION 'Window seconds must be between 1 and 86400';
    END IF;

    IF p_max_points <= 0 OR p_max_points > 10000 THEN
        RAISE EXCEPTION 'Max points must be between 1 and 10000';
    END IF;

    SELECT rl.points, rl.expire_at INTO v_record
    FROM rate_limits rl
    WHERE rl.key = p_key
    FOR UPDATE;

    IF FOUND AND v_record.expire_at > v_now THEN
        v_points := v_record.points + 1;
        v_expire := v_record.expire_at;
        UPDATE rate_limits
        SET points = v_points, updated_at = v_now
        WHERE key = p_key;
    ELSE
        v_points := 1;
        v_expire := v_new_expire;
        INSERT INTO rate_limits (key, points, expire_at, updated_at)
        VALUES (p_key, 1, v_new_expire, v_now)
        ON CONFLICT (key) DO UPDATE
        SET points = 1, expire_at = v_new_expire, updated_at = v_now;
    END IF;

    IF v_points > p_max_points THEN
        v_allowed := false;
        v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_expire - v_now))::INT);
    END IF;

    RETURN QUERY SELECT
        v_allowed,
        v_points,
        GREATEST(0, p_max_points - v_points),
        v_retry;
END;
$$;

REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) TO service_role;
