# SAFARIA Tours & Travels — Staging & Production Deployment Runbook
**Document ID:** DRB-20261108-01  
**Target Release:** `v2.0.0-PROD-RC1`  
**Architecture:** Next.js 15 App Router Modular Monolith + Supabase PostgreSQL + GoHighLevel API v2

---

## 1. System Architecture & Boundaries

```
[Public Visitor] ➔ [Next.js App Router (Vercel / Node 22)] ➔ [Zod Schemas]
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        [Supabase PostgreSQL]                  [Integration Outbox Queue]
     (Strict RLS: Public INSERT only;                     │
      Privileged Service SELECT/UPDATE)                  ▼
                                              [GoHighLevel CRM API v2]
                                              (Idempotent contact upsert)
```

- **Canonical URL:** `https://safaria.vibing.world` (Bengali default at `/`, English at `/en`)
- **Operations Triage Desk:** `/admin` (Protected by HMAC-SHA256 session token & `SUPER_ADMIN` role)
- **B2B Partner Portal:** `/partner` (Protected with strict multi-tenant isolation by `agency_id`)

---

## 2. Environment Variables Specification

| Variable Name | Required | Default / Format | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production caching & minification |
| `SESSION_SECRET` | Yes | Cryptographic 64-char hex string | HMAC-SHA256 signature for auth tokens |
| `SAFARIA_ADMIN_SECRET` | Yes | High-entropy secret | Staff admin authentication password |
| `CRON_SECRET` | Yes | Secret token | Authorizes `/api/cron/dispatch-outbox` |
| `SUPABASE_URL` | Yes | `https://<proj>.supabase.co` | PostgreSQL database connection endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJ...` | Privileged backend key for server Route Handlers |
| `GHL_API_KEY` | Optional | Bearer API token | GoHighLevel CRM v2 integration |
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
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_safaria_core_schema.sql
```

### Verified Schema Tables & Constraints:
- `flight_enquiries` (Unique reference `SFR-YYYYMMDD-XXXXXX`, status lifecycle, lap infant constraints)
- `flight_legs` (Cascading foreign key, sequential date check)
- `agency_applications` (Trade license requirement, manual trial audit state `PENDING_VERIFICATION`)
- `general_enquiries` (Visa, Corporate, Umrah, Holiday intake)
- `b2b_desk_records` (FareDesk, BookingDesk, ClearMargin, AfterCare, VerifiedWorkflow, PartnerGrowth)
- `integration_outbox` (Idempotent queue, max 5 attempts with exponential backoff)

---

## 4. Pre-Deployment Automated Verification Suite

Run all verification tests prior to release tagging:

```bash
# 1. TypeScript Strict Typecheck
npm run typecheck

# 2. Vitest Unit & Integration Tests (33 tests)
npm test

# 3. Playwright End-to-End Browser Tests (5 tests)
npm run test:e2e

# 4. Production Build Verification
npm run build
```

---

## 5. Deployment Procedure

### Vercel / Cloud Platforms:
1. Connect Git repository to feature branch `feat/safaria-production-foundation` or `main`.
2. Configure Root Directory to `design-system` (or repository root with build delegation).
3. Set build command: `npm run build`.
4. Populate production Environment Variables from Section 2.
5. Deploy and inspect deployment URL.

### Background Queue Dispatcher:
Configure a scheduled cron job (e.g. Vercel Cron, Google Cloud Scheduler, or GitHub Actions) triggering:
```bash
curl -X POST https://safaria.vibing.world/api/cron/dispatch-outbox \
  -H "x-cron-secret: $CRON_SECRET"
```
Recommended frequency: Every 2 minutes.

---

## 6. Rollback Plan

If critical defects or supplier integration anomalies are detected in staging:
1. Revert to prior verified Git commit.
2. The database schema is additive and non-destructive; rolling back frontend containers does not affect existing persisted quotation records.
3. Outbox queue holds failed requests with unconsumed idempotency keys, allowing safe replay once restored.
