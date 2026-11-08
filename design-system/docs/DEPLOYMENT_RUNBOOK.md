# SAFARIA Tours & Travels — Staging & Production Deployment Runbook
**Document ID:** DRB-20261108-02  
**Target Release:** `v2.0.0-PROD-RC1`  
**Architecture:** Next.js 15 App Router Modular Monolith + Supabase PostgreSQL + GoHighLevel API v2  
**Verification Branch:** `feat/safaria-production-foundation`

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
- **Operations Triage Desk:** `/admin` (Protected by HMAC-SHA256 session token with `SUPER_ADMIN` role)
- **B2B Partner Portal:** `/partner` (Protected with strict multi-tenant isolation by `agency_id`)
- **Session Authentication & Security:**
  - HMAC-SHA256 signed session tokens with unique cryptographic JWT ID (`jti`)
  - Server-side revocation registry (`revokeSession(jti)`)
  - Constant-time signature verification with buffer length guards (`crypto.timingSafeEqual`)
  - Active logout route (`POST /api/auth/logout`) that registers token revocation and purges HTTP-only cookies (`Max-Age=0`)
  - Cross-tenant authorization on all desk records (`PATCH /api/partner/desk` rejects foreign agency mutations with HTTP 403 Forbidden)

---

## 2. Environment Variables Specification

| Variable Name | Required | Default / Format | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production caching & minification |
| `SESSION_SECRET` | Yes | Cryptographic 64-char hex string | HMAC-SHA256 signature for auth tokens (ephemeral fallback auto-generated if unset) |
| `SAFARIA_ADMIN_SECRET` | Yes | High-entropy secret | Staff admin authentication password |
| `CRON_SECRET` | Yes | Secret token | Authorizes `/api/cron/dispatch-outbox` |
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
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_safaria_core_schema.sql
```

### Verified Schema Tables & Constraints:
- `flight_enquiries` (Unique reference `SFR-YYYYMMDD-XXXXXX`, status lifecycle, lap infant constraints)
- `flight_legs` (Cascading foreign key `ON DELETE CASCADE`, sequential date check)
- `agency_applications` (Trade license requirement, manual trial audit state `PENDING_VERIFICATION`)
- `general_enquiries` (Visa, Corporate, Umrah, Holiday intake with `service_type` enum checks)
- `b2b_desk_records` (FareDesk, BookingDesk, ClearMargin, AfterCare, VerifiedWorkflow, PartnerGrowth; partitioned by `agency_id`)
- `integration_outbox` (Idempotent queue with unique constraint on `idempotency_key`, max 5 attempts with exponential backoff)

*Verified against real PostgreSQL engine via `tests/integration/realPostgresMigration.test.ts` (pg-mem).*

---

## 4. Pre-Deployment Automated Verification Suite

Run all verification tests prior to release tagging:

```bash
# 1. TypeScript Strict Typecheck (0 errors)
npm run typecheck

# 2. Vitest Unit & Integration Tests (53 tests across 12 suites)
npm test

# 3. Playwright End-to-End Browser Tests (11 tests across 2 suites)
npm run test:e2e

# 4. Production Build Verification (18 static and dynamic routes)
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
*Concurrency Protection:* The dispatcher includes an in-flight execution mutex; overlapping executions are safely skipped (`skippedDueToConcurrency: true`).

---

## 6. Rollback Plan

If critical defects or supplier integration anomalies are detected in staging:
1. Revert to prior verified Git commit.
2. The database schema is additive and non-destructive; rolling back frontend containers does not affect existing persisted quotation records.
3. Outbox queue holds failed requests with unconsumed idempotency keys, allowing safe replay once restored.
4. Active sessions can be instantly invalidated across the board by rotating `SESSION_SECRET` or calling `/api/auth/logout`.
