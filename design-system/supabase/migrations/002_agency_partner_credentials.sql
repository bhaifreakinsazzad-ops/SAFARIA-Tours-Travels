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
