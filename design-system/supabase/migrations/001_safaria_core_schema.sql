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
