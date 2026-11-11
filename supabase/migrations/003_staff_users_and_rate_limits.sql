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
AS $rate_limit$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_new_expire TIMESTAMPTZ;
    v_points INT;
    v_expire TIMESTAMPTZ;
    v_retry INT := 0;
BEGIN
    IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
        RAISE EXCEPTION 'Rate limit key cannot be null or empty';
    END IF;
    IF p_window_seconds <= 0 OR p_window_seconds > 86400 THEN
        RAISE EXCEPTION 'Window seconds must be between 1 and 86400';
    END IF;
    IF p_max_points <= 0 OR p_max_points > 10000 THEN
        RAISE EXCEPTION 'Max points must be between 1 and 10000';
    END IF;

    v_new_expire := v_now + make_interval(secs => p_window_seconds);

    -- One atomic INSERT/ON CONFLICT update also handles the initially absent
    -- key. Row-level locking on the unique key prevents lost increments.
    INSERT INTO public.rate_limits AS counter
      (key, points, expire_at, updated_at)
    VALUES (p_key, 1, v_new_expire, v_now)
    ON CONFLICT (key) DO UPDATE
    SET points = CASE
          WHEN counter.expire_at > v_now THEN counter.points + 1
          ELSE 1
        END,
        expire_at = CASE
          WHEN counter.expire_at > v_now THEN counter.expire_at
          ELSE EXCLUDED.expire_at
        END,
        updated_at = v_now
    RETURNING counter.points, counter.expire_at
    INTO v_points, v_expire;

    IF v_points > p_max_points THEN
        v_retry := GREATEST(1, EXTRACT(EPOCH FROM (v_expire - v_now))::INT);
    END IF;
    RETURN QUERY SELECT
        (v_points <= p_max_points),
        v_points,
        GREATEST(0, p_max_points - v_points),
        v_retry;
END;
$rate_limit$;

REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) TO service_role;
