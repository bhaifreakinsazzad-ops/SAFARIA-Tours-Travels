-- ==============================================================================
-- SAFARIA Tours & Travels — Consolidated Production Supabase Database Migration
-- Run this single script in the Supabase SQL Editor to provision all tables & functions
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- File: 001_safaria_core_schema.sql
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- SAFARIA Tours & Travels — Core Production Schema & Strict RLS
-- Migration: 001_safaria_core_schema.sql
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure standard Supabase/PostgreSQL security roles exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN 
        CREATE ROLE anon; 
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN 
        CREATE ROLE authenticated; 
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN 
        CREATE ROLE service_role; 
    END IF;
END $$;

-- 1. FLIGHT ENQUIRIES
CREATE TABLE IF NOT EXISTS flight_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no VARCHAR(32) UNIQUE NOT NULL,
    trip_type VARCHAR(16) NOT NULL CHECK (trip_type IN ('ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY')),
    cabin_class VARCHAR(16) NOT NULL DEFAULT 'ECONOMY' CHECK (cabin_class IN ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')),
    passengers JSONB NOT NULL DEFAULT '{"adults": 1, "children": 0, "infants": 0}'::jsonb,
    preferred_carrier VARCHAR(64),
    lead_passenger_name VARCHAR(128) NOT NULL,
    phone_country_code VARCHAR(8) NOT NULL DEFAULT '+880',
    phone_number VARCHAR(32) NOT NULL,
    email VARCHAR(128),
    special_notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_REVIEW', 'QUOTATION_SENT', 'BOOKED', 'EXPIRED', 'CANCELLED')),
    crm_synced_at TIMESTAMPTZ,
    crm_contact_id VARCHAR(64),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FLIGHT LEGS (Supports 1 leg for One-Way, 2 legs for Round-Trip, up to 6 legs for Multi-City)
CREATE TABLE IF NOT EXISTS flight_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES flight_enquiries(id) ON DELETE CASCADE,
    leg_index SMALLINT NOT NULL CHECK (leg_index >= 0 AND leg_index < 6),
    origin_iata VARCHAR(3) NOT NULL,
    origin_city VARCHAR(64) NOT NULL,
    destination_iata VARCHAR(3) NOT NULL,
    destination_city VARCHAR(64) NOT NULL,
    departure_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_legs_enquiry_id ON flight_legs(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_flight_enquiries_status ON flight_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_flight_enquiries_ref ON flight_enquiries(reference_no);

-- 3. B2B AGENCY APPLICATIONS
CREATE TABLE IF NOT EXISTS agency_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no VARCHAR(32) UNIQUE NOT NULL,
    agency_name VARCHAR(128) NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL,
    trade_license_number VARCHAR(64),
    years_in_business SMALLINT DEFAULT 0,
    monthly_ticket_volume VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
        status IN ('PENDING_VERIFICATION', 'IN_REVIEW', 'TRIAL_APPROVED', 'ACTIVE_PARTNER', 'REJECTED')
    ),
    trial_activated_at TIMESTAMPTZ,
    trial_expires_at TIMESTAMPTZ,
    approved_by VARCHAR(64),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_status ON agency_applications(status);
CREATE INDEX IF NOT EXISTS idx_agency_ref ON agency_applications(reference_no);

-- 4. GENERAL SERVICE ENQUIRIES (Corporate, Visa, Umrah, Holiday, Hotel)
CREATE TABLE IF NOT EXISTS general_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_no VARCHAR(32) UNIQUE NOT NULL,
    service_type VARCHAR(32) NOT NULL CHECK (
        service_type IN ('VISA', 'CORPORATE', 'HOLIDAY', 'HOTEL', 'UMRAH', 'CUSTOM')
    ),
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW' CHECK (
        status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. B2B OPERATIONAL DESK RECORDS (The 6 Desks)
CREATE TABLE IF NOT EXISTS b2b_desk_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agency_applications(id) ON DELETE SET NULL,
    desk_type VARCHAR(32) NOT NULL CHECK (
        desk_type IN ('FARE_DESK', 'BOOKING_DESK', 'CLEAR_MARGIN', 'AFTER_CARE', 'VERIFIED_WORKFLOW', 'PARTNER_GROWTH')
    ),
    title VARCHAR(256) NOT NULL,
    priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_desk_agency ON b2b_desk_records(agency_id);
CREATE INDEX IF NOT EXISTS idx_b2b_desk_type ON b2b_desk_records(desk_type);

-- 6. INTEGRATION OUTBOX (Distributed Reliable Queue with Worker Locking)
CREATE TABLE IF NOT EXISTS integration_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel VARCHAR(32) NOT NULL CHECK (channel IN ('GHL_CRM', 'WHATSAPP_HOOK', 'EMAIL_NOTIFICATION')),
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
    attempts SMALLINT NOT NULL DEFAULT 0,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    locked_at TIMESTAMPTZ,
    locked_by VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON integration_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_outbox_claim ON integration_outbox(status, next_retry_at, locked_at);

-- 7. DURABLE SESSION REVOCATION (Survives server restarts and multi-instance deployments)
CREATE TABLE IF NOT EXISTS revoked_sessions (
    jti VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    reason VARCHAR(64) DEFAULT 'LOGOUT',
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_revoked_sessions_expires_at ON revoked_sessions(expires_at);

-- ==============================================================================
-- STRICT ROW-LEVEL SECURITY (RLS) POLICIES
-- Zero anonymous reads on customer PII or operational records
-- ==============================================================================

ALTER TABLE flight_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_desk_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_sessions ENABLE ROW LEVEL SECURITY;

-- Grant minimal necessary table privileges to standard roles
GRANT INSERT ON flight_enquiries, flight_legs, agency_applications, general_enquiries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON b2b_desk_records TO authenticated;
GRANT SELECT ON agency_applications TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Anonymous public users may ONLY insert enquiries and applications (write-only)
CREATE POLICY "Public anonymous insert for flight enquiries" 
    ON flight_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public anonymous insert for flight legs" 
    ON flight_legs FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public anonymous insert for agency applications" 
    ON agency_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Public anonymous insert for general enquiries" 
    ON general_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- ==============================================================================
-- NATIVE POSTGRESQL MULTI-TENANT ROW-LEVEL SECURITY (RLS) FOR B2B PARTNERS
-- Enforces cross-tenant isolation at the database engine level
-- ==============================================================================
CREATE POLICY "Tenant isolation for desk records select"
    ON b2b_desk_records FOR SELECT TO authenticated
    USING (
        agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR agency_id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    );

CREATE POLICY "Tenant isolation for desk records insert"
    ON b2b_desk_records FOR INSERT TO authenticated
    WITH CHECK (
        agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR agency_id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    );

CREATE POLICY "Tenant isolation for desk records update"
    ON b2b_desk_records FOR UPDATE TO authenticated
    USING (
        agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR agency_id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    )
    WITH CHECK (
        agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR agency_id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    );

CREATE POLICY "Tenant isolation for agency application select"
    ON agency_applications FOR SELECT TO authenticated
    USING (
        id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    );

-- NO PUBLIC READ FOR CUSTOMER DATA (Prevents PII scraping)
-- Only service_role or authenticated staff with privileged role can select/update
CREATE POLICY "Privileged service read all flight enquiries"
    ON flight_enquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service read all flight legs"
    ON flight_legs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service read all agency applications"
    ON agency_applications FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service read all general enquiries"
    ON general_enquiries FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service access to desk records"
    ON b2b_desk_records FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service access to integration outbox"
    ON integration_outbox FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Privileged service access to revoked sessions"
    ON revoked_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ------------------------------------------------------------------------------
-- File: 002_agency_partner_credentials.sql
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- SAFARIA Tours & Travels — B2B Partner Login Credentials
-- Fixes a critical pre-existing defect: the login API previously granted a
-- full B2B_PARTNER session for ANY approved agency's email with no password
-- check at all (no password column existed anywhere in the schema), plus a
-- hardcoded demo-account bypass. Both are removed in the application layer;
-- this migration adds the storage the real check now relies on.
--
-- Only a salted scrypt hash is ever persisted — never a plaintext password.
-- Credentials are issued once, at TRIAL_APPROVED/ACTIVE_PARTNER transition,
-- by lib/db/enquiriesRepository.ts#updateAgencyStatus, and relayed to the
-- partner out-of-band by staff (the existing WhatsApp-handoff pattern).
-- ==============================================================================

ALTER TABLE agency_applications
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS password_salt TEXT;

-- Defense in depth: password_hash/password_salt must never be readable via
-- the existing `authenticated`-role SELECT policy on this table. Service-role
-- access (used by all Node API routes) already bypasses RLS and is
-- unaffected by this revoke.
REVOKE SELECT (password_hash, password_salt) ON agency_applications FROM authenticated;


-- ------------------------------------------------------------------------------
-- File: 003_staff_users_and_rate_limits.sql
-- ------------------------------------------------------------------------------

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


-- ------------------------------------------------------------------------------
-- File: 004_secure_rate_limit_function.sql
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- SAFARIA Tours & Travels — Directive 015 Security Hardening Migration
-- Forward-Only PostgreSQL Security Closure:
-- 1. Secure search_path and execution privileges on consume_rate_limit()
-- 2. Revoke execute privileges from PUBLIC, anon, and authenticated
-- 3. Grant execute strictly to service_role with explicit search_path
-- Migration: 004_secure_rate_limit_function.sql
-- ==============================================================================

-- Revoke default public execution rights
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM anon;
REVOKE ALL ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) FROM authenticated;

-- Replace function with fixed search_path to prevent search_path hijacking
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

-- Grant execution strictly to service_role
GRANT EXECUTE ON FUNCTION consume_rate_limit(VARCHAR, INT, INT) TO service_role;


-- ------------------------------------------------------------------------------
-- File: 006_b2b_subscriptions_and_invoices.sql
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- SAFARIA Tours & Travels — B2B Subscriptions, Billing Invoices & Telemetry
-- Migration: 006_b2b_subscriptions_and_invoices.sql
-- ==============================================================================

ALTER TABLE agency_applications
    DROP CONSTRAINT IF EXISTS agency_applications_status_check;

ALTER TABLE agency_applications
    ADD CONSTRAINT agency_applications_status_check CHECK (
        status IN (
            'PENDING_VERIFICATION',
            'IN_REVIEW',
            'TRIAL_APPROVED',
            'ACTIVE_PARTNER',
            'REJECTED',
            'SUSPENDED'
        )
    );

ALTER TABLE agency_applications
    ADD COLUMN IF NOT EXISTS plan VARCHAR(16),
    ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS assigned_staff_owner VARCHAR(128),
    ADD COLUMN IF NOT EXISTS whatsapp_draft_opened BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS whatsapp_inbound_confirmed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS pain_category VARCHAR(32),
    ADD COLUMN IF NOT EXISTS district VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_agency_plan ON agency_applications(plan);

CREATE TABLE IF NOT EXISTS agency_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no VARCHAR(32) UNIQUE NOT NULL,
    agency_id UUID NOT NULL REFERENCES agency_applications(id) ON DELETE CASCADE,
    agency_name VARCHAR(128) NOT NULL,
    amount_bdt INT NOT NULL CHECK (amount_bdt > 0),
    plan VARCHAR(16) NOT NULL CHECK (plan IN ('MONTHLY', 'ANNUAL')),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
        status IN ('PENDING_VERIFICATION', 'VERIFIED_PAID', 'CANCELLED')
    ),
    payment_method VARCHAR(32) NOT NULL CHECK (
        payment_method IN ('BANK_TRANSFER', 'BKASH_MERCHANT', 'NAGAD', 'MANUAL_RECONCILED')
    ),
    payment_reference VARCHAR(128),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(128),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_invoices_agency_id ON agency_invoices(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_invoices_status ON agency_invoices(status);

ALTER TABLE agency_invoices ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON agency_invoices TO authenticated;
GRANT ALL PRIVILEGES ON agency_invoices TO service_role;

DROP POLICY IF EXISTS "Tenant isolation for agency invoices select" ON agency_invoices;
CREATE POLICY "Tenant isolation for agency invoices select"
    ON agency_invoices FOR SELECT TO authenticated
    USING (
        agency_id = NULLIF(current_setting('app.current_agency_id', true), '')::uuid
        OR agency_id = (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb->>'agency_id')::uuid
    );

DROP POLICY IF EXISTS "Privileged service access to agency invoices" ON agency_invoices;
CREATE POLICY "Privileged service access to agency invoices"
    ON agency_invoices FOR ALL TO service_role USING (true) WITH CHECK (true);



