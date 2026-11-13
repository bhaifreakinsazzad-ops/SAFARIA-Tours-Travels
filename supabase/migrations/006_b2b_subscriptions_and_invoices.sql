-- ==============================================================================
-- SAFARIA Tours & Travels — B2B Subscriptions, Billing Invoices & Telemetry
-- Migration: 006_b2b_subscriptions_and_invoices.sql
-- ==============================================================================

-- 1. Extend agency_applications status check constraint to support SUSPENDED
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

-- 2. Add Directive 005 B2B subscription, lead qualification, and WhatsApp telemetry columns
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

-- 3. Create agency_invoices table for B2B subscription billing & reconciliation
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

-- Strict Row-Level Security for agency_invoices
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
