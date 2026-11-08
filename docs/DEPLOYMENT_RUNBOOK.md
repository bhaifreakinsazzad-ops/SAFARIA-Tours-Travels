# SAFARIA Tours & Travels — Staging & Production Deployment Runbook
**Document ID:** DRB-20261109-04  
**Target Release:** `v2.0.0-PROD-RC2`  
**Architecture:** Next.js 15 App Router Modular Monolith + Supabase / PostgreSQL 18 + GoHighLevel API v2  
**Verification Branch:** `feat/safaria-production-foundation`  
**Date of Record:** 2026-11-09  
**Directive Reference:** `SAFARIA_ANTIGRAVITY_DIRECTIVE_008R1_FINAL_CUTOVER.md`

---

## 1. System Architecture & Boundaries

```
[Public Visitor] ➔ [Next.js 15 App Router (Vercel / Node 22)] ➔ [Zod Schemas]
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
         [Supabase PostgreSQL 18]               [Distributed Outbox Queue]
     (Database Engine RLS via                  (FOR UPDATE SKIP LOCKED)
      app.current_agency_id session context)              │
                    │                                     ▼
                    ▼                          [GoHighLevel CRM API v2]
          [revoked_sessions]                   (Idempotent contact upsert)
```

- **Canonical URL:** `https://safaria.vibing.world` (Bengali default at `/`, English at `/en`)
- **Operations Triage Desk:** `/admin` (Protected by HMAC-SHA256 session token with `SUPER_ADMIN` role)
- **B2B Partner Portal:** `/partner` (Protected with database-engine-level multi-tenant isolation by `agency_id`)
- **Session Authentication & Security:**
  - HMAC-SHA256 signed session tokens with unique cryptographic JWT ID (`jti`).
  - Production runtime requires a high-entropy `SESSION_SECRET` (at least 32 characters). Ephemeral secret fallbacks are strictly prohibited in production and throw a fatal configuration exception.
  - Durable server-side revocation table (`revoked_sessions`) in PostgreSQL surviving process restarts across multiple worker nodes.
  - Dynamic account suspension verification: every authenticated request verifies `isAgencyActive`. If agency status is `SUSPENDED`, `REJECTED`, or `PENDING_VERIFICATION`, token is rejected immediately.
  - Constant-time signature verification with buffer length guards (`crypto.timingSafeEqual`).
  - Active logout route (`POST /api/auth/logout`) that registers token revocation in `revoked_sessions` and purges HTTP-only cookies (`Max-Age=0`).
  - Database-enforced multi-tenant isolation on all partner records: PostgreSQL engine RLS policies on `b2b_desk_records` evaluate `current_setting('app.current_agency_id', true)::uuid`. Malicious cross-tenant `INSERT` operations trigger native PostgreSQL RLS violation errors.
- **Distributed CRM Outbox Dispatcher:**
  - Database-coordinated row claiming via `claimOutboxBatch(workerId, batchSize, leaseDurationSeconds)`.
  - Concurrency safety: uses `FOR UPDATE SKIP LOCKED` in PostgreSQL to ensure multiple background workers never double-dispatch the same outbox item.
  - Expired-lease recovery: tasks stuck in `PROCESSING` status for longer than 30 seconds are automatically reclaimed and retried.
  - Dead-letter cutoff: items that exceed 5 attempts are marked `FAILED` with detailed diagnostic error logs.
  - Clear telemetry distinguishing `isSimulatedMode: true` (with simulation disclaimer) from `isSimulatedMode: false` live delivery.
- **Production HTTP Security Headers (`next.config.mjs`):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

---

## 2. Environment Variables Specification

| Variable Name | Required | Default / Format | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production caching & minification |
| `SESSION_SECRET` | Mandatory in Prod | Cryptographic 64-char hex string | HMAC-SHA256 signature for auth tokens (fatal error in prod if missing) |
| `SAFARIA_ADMIN_SECRET` | Yes | High-entropy secret | Staff admin authentication password |
| `CRON_SECRET` | Yes | Secret token | Authorizes `/api/cron/dispatch-outbox` |
| `DATABASE_URL` | Optional | `postgres://user:pass@host:5432/safaria` | Direct PostgreSQL connection string |
| `SUPABASE_URL` | Yes | `https://<proj>.supabase.co` | PostgreSQL database connection endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJ...` | Privileged backend key for server Route Handlers |
| `GHL_API_KEY` | Optional | Bearer API token | GoHighLevel CRM v2 integration (enables live dispatch) |
| `GHL_LOCATION_ID` | Optional | GHL location sub-account ID | Contacts & opportunities destination |
| `ENABLE_LIVE_PAYMENTS` | Guarded | `false` | Financial safety gate (Must remain `false`) |
| `ENABLE_LIVE_GDS_TICKETING` | Guarded | `false` | Direct airline issuance gate (Must remain `false`) |

---

## 3. Database Migration Execution

Execute the core schema migration on the target Supabase or PostgreSQL database:

```bash
# Using Supabase CLI
supabase db push

# Or execute SQL migration script directly via psql / Supabase SQL Studio
psql "$DATABASE_URL" -f supabase/migrations/001_safaria_core_schema.sql
```

### Verified Schema Tables & Constraints:
- `flight_enquiries` (Unique reference `SFR-YYYYMMDD-XXXXXX`, status lifecycle, lap infant constraints)
- `flight_legs` (Cascading foreign key `ON DELETE CASCADE`, sequential date check)
- `agency_applications` (Trade license requirement, manual trial audit state `PENDING_VERIFICATION`, RLS policy for partner self-view)
- `general_enquiries` (Visa, Corporate, Umrah, Holiday intake with `service_type` enum checks)
- `b2b_desk_records` (FareDesk, BookingDesk, ClearMargin, AfterCare, VerifiedWorkflow, PartnerGrowth; database-enforced RLS partitioned by `agency_id`)
- `integration_outbox` (Distributed queue with `locked_at` and `locked_by` leasing columns, max 5 attempts with exponential backoff)
- `revoked_sessions` (Durable revocation table indexed by `jti` with expiration timestamp)

---

## 4. Verification Test Commands & CI Automation

Continuous integration runs automatically on pull requests and pushes to `main` via `.github/workflows/ci.yml`.

To verify locally before deployment:

```bash
# 1. Vitest full unit and integration suite (68 tests across 14 suites)
npm test

# 2. Run real PostgreSQL 18 server engine tests specifically
npx vitest run tests/integration/realPostgresServer.test.ts

# 3. Next.js production build verification (18 routes, 0 errors, strict security headers)
npm run build

# 4. Playwright End-to-End browser tests (11 tests in headless Chromium)
npm run test:e2e
```

---

## 5. Rollback & Emergency Procedures

1. **Compromised Auth Token or Account Suspended:**
   - Mark agency status as `SUSPENDED` in `agency_applications` table.
   - Dynamic check `isAgencyActive` blocks the agency immediately on subsequent requests.
   - To revoke all active sessions, call `/api/auth/logout` or insert the token's `jti` directly into `revoked_sessions`.

2. **Stuck Outbox Jobs:**
   - If an outbox worker terminates unexpectedly, the next run of `/api/cron/dispatch-outbox` reclaims the lease after 30 seconds.
   - To inspect dead-letter jobs: `SELECT * FROM integration_outbox WHERE status = 'FAILED';`

3. **Database Rollback:**
   - Database migrations are additive and non-destructive. Rollback scripts preserve customer records in `flight_enquiries` and `agency_applications`.
