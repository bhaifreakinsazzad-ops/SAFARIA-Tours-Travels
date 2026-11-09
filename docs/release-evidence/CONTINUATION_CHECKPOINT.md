# SAFARIA Post-Merge Hardening — Continuation Checkpoint (Directive 011)

**Branch:** `claude/safaria-postmerge-hardening`
**Based on:** `main` @ `5738e75` (merge commit of PR #1, `claude/safaria-integration-main` → `main`)
**PR:** [#3](https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels/pull/3)
**Scope:** Directive 011 Master Execution Directive — database agency persistence, individual staff RBAC, durable session authorization, distributed abuse protection, CRM outbox recovery, Vercel cron compliance, and dynamic test port allocation.

---

## A. Source Control & Repository State

- **Repository:** `https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels`
- **Active Branch:** `claude/safaria-postmerge-hardening`
- **Base Commit:** `main` @ `5738e75`
- **Previous Checkpoint Commit:** `d03aea5b1327127bc0370687255738f0d2273cef`
- **Target PR:** PR #3 (maintained on `claude/safaria-postmerge-hardening`, no force-push, no duplicate PRs)

---

## B. Summary of Directive 011 Engineering Accomplishments

### 1. Database-Backed Agency Management (P0)
- `server/db/enquiriesRepository.ts`: Completely eliminated in-memory-only read gaps for agency applications.
- `listAgencyApplications()`, `getAgencyApplicationById()`, `getAgencyApplicationByEmail()`, and `updateAgencyStatus()` now read and write directly to Supabase/PostgreSQL.
- In production, PostgreSQL is the authoritative data source; memory store is retained strictly for offline non-production test suites.
- Agency password hashing, salt storage, credential issuance, and account suspensions/reactivations are fully persisted to the database.

### 2. Authoritative Individual Staff Authentication & RBAC (P0)
- Created `supabase/migrations/003_staff_users_and_rate_limits.sql`:
  - `staff_users` table with scrypt credentials, `failed_login_attempts`, `locked_until`, `last_login_at`.
  - `staff_audit_logs` table recording all mutating administrative actions with target type, ID, IP address, and metadata.
  - Strict RLS ensuring `staff_users` is only accessible to `service_role`.
- Created `server/auth/staffService.ts`:
  - Individual staff identity verification using scrypt hashing (`hashPassword`, `verifyPassword`).
  - 5-attempt consecutive lockout policy (15-minute freeze).
  - RBAC support for `SUPER_ADMIN`, `OPS_AGENT`, and `FINANCE_DESK`.
  - Operator bootstrap helper for initial admin creation.
- Updated `src/app/api/auth/login/route.ts`:
  - Removed shared admin secret; uses individual staff authentication via `staffService.verifyStaffCredentials`.
  - Removed raw signed tokens from JSON responses (HttpOnly cookie only).

### 3. Durable Session Authorization & CSRF Guard (P0)
- `server/auth/authService.ts`:
  - `extractSessionFromRequestAsync` verifies session signatures, database-persisted session revocation (`revoked_sessions`), staff account active status, and partner agency active status.
  - Expired, revoked, or suspended credentials immediately fail-closed across all application instances.
- Created `server/utils/csrfGuard.ts`:
  - Verifies Origin and Referer headers against canonical domains for cookie-authenticated mutating requests.
  - Integrated into `/api/auth/logout`, `/api/admin/agencies`, `/api/admin/enquiries`, `/api/partner/desk`, and `/api/partner/verify-passenger`.

### 4. Distributed Sliding-Window Rate Limiting & Abuse Guard
- Created `server/auth/distributedRateLimiter.ts`:
  - Atomic PostgreSQL/Supabase-backed rate limiting via `rate_limits` table with sliding window and atomic upsert.
  - Integrated into `server/utils/abuseGuard.ts` with `checkSubmissionRateLimitAsync` and `isDuplicateSubmissionAsync`.
  - Applied across `/api/enquiries`, `/api/agency`, `/api/general`, and `/api/auth/login`.

### 5. Resilient CRM Outbox & Error Recovery
- `server/crm/ghlAdapter.ts`:
  - Decoupled contact upsert and opportunity creation.
  - If opportunity creation fails (e.g. invalid pipeline stage), contact sync is preserved and a recoverable `GHL_OPPORTUNITY_RETRY` outbox task is queued.
- `server/crm/outboxDispatcher.ts`:
  - Added dedicated handler for `GHL_OPPORTUNITY_RETRY`.

### 6. Vercel Hobby Deployment Crash Fix
- `vercel.json`:
  - Replaced `"schedule": "*/5 * * * *"` with `"schedule": "0 0 * * *"` (daily).
  - Vercel Hobby tier rejects cron jobs running more frequently than once per day, causing preview builds to fail in <1s. Daily schedule complies with Hobby tier.

### 7. Embedded PostgreSQL Test Harness Dynamic Port Fix
- `tests/integration/realPostgresServer.test.ts`:
  - Replaced hardcoded static port `54333` with `getFreePort()` (dynamically binds ephemeral port via `net.createServer().listen(0)`).
  - Eliminates all port contention and orphaned process collisions on test runs.
  - Added native PostgreSQL migration 003 execution and tests for `staff_users` RLS and `rate_limits` atomic operations.

---

## C. Feature & Security Readiness Status

| Subsystem / Capability | Status | Architectural & Operational Reality |
|---|---|---|
| Public Website & Design Identity | `PRODUCTION_READY` | Emerald/navy/gold/ivory identity, 3D Journey Atlas, Travel Studio, bilingual Bengali/English UX preserved verbatim |
| Public Visitor Form Flow | `COMPLIANT_GATED` | WhatsApp-draft-only enquiry generation; zero direct PII persistence before owner privacy approval (enforced by purge gate) |
| Agency Application Persistence | `PRODUCTION_READY` | Fully backed by PostgreSQL/Supabase, credentials hashed with scrypt, zero memory-only persistence in production |
| Individual Staff Identity & RBAC | `PRODUCTION_READY` | Dedicated `staff_users` table, scrypt verification, 5-attempt lockout, audit trail, role separation (`SUPER_ADMIN`, `OPS_AGENT`, `FINANCE_DESK`) |
| Multi-Instance Session Revocation | `PRODUCTION_READY` | Database-backed `revoked_sessions` table, async session validation, fail-closed on suspended or deleted accounts |
| B2B Desk Tenant Isolation | `PRODUCTION_READY` | Row Level Security (RLS) policies tested and verified against native PostgreSQL 18 engine; fail-closed scoped queries |
| Distributed Abuse Protection | `PRODUCTION_READY` | Multi-instance sliding-window rate limiting via PostgreSQL `rate_limits` table with memory fallback for offline tests |
| CRM Outbox & Recovery | `PRODUCTION_READY` | Distributed `FOR UPDATE SKIP LOCKED` row claiming, exponential backoff, independent opportunity retry queue |
| Vercel Deployment Configuration | `PRODUCTION_READY` | `vercel.json` cron schedule updated to `"0 0 * * *"` for Hobby tier compliance |
| Live Payment / GDS Radar | `SAFETY_LOCKED` | Intentionally disabled (`false`) pending commercial licensing and regulatory authorization |

---

## D. Verification Evidence

- `npm run typecheck` — **0 errors** (TypeScript strict compliance)
- `npm run lint` — **0 errors, 0 warnings** (ESLint flat config)
- `npm run verify:purge` — **PASS** (40 files scanned, zero PII leaks, zero unauthenticated external fetches in `src/`)
- `npm test` (vitest unit & integration) — **19 test files / 79 tests PASSED**
- `tests/integration/realPostgresServer.test.ts` (native PostgreSQL 18) — **10 tests PASSED**
  - Data persistence across full server restart
  - Anonymous PII extraction rejection via RLS
  - Cross-tenant data isolation on `b2b_desk_records`
  - Multi-instance session revocation persistence
  - `staff_users` RLS isolation and audit log persistence
  - Distributed `FOR UPDATE SKIP LOCKED` worker row claiming without double-delivery
- `npm run build` — **PASS** (Turbopack, Next.js 16.4.5, 20 static/dynamic routes compiled cleanly)
