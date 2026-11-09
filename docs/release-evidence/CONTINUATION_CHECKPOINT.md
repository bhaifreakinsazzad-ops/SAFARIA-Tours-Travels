# SAFARIA Engineering Release Checkpoint & Directive 012 Closure

**Authoritative Branch:** `claude/safaria-release-closure`
**Based on:** `origin/main` @ `e20916e` (Merge commit of PR #3)
**Scope:** Master Execution Directive 012 — Safe Recovery, Security Hardening, Database Persistence, Staff RBAC, CRM Outbox Reliability, Vercel Cron Resolution, and Full End-to-End Verification.

---

## 1. Source Control & Repository State

- **Repository:** `https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels`
- **Base Commit:** `origin/main` @ `e20916e` (Merged PR #3 into `main`)
- **Integration Branch:** `claude/safaria-release-closure`
- **Target Pull Request / Comparison:** Prepared for review against `main`
- **Branch Tracking:** Directly branched from latest `origin/main`, cleanly incorporating all post-merge hardening changes without losing history or force-pushing.

---

## 2. Core Architectural & Security Deliverables (Directive 011 & 012)

### A. Database-Backed Agency Management & Persistence
- **No Memory-Only Production Persistence:** Completely refactored `server/db/enquiriesRepository.ts` so that agency application creation, listing, retrieval, status updates (`PENDING_VERIFICATION`, `IN_REVIEW`, `TRIAL_APPROVED`, `ACTIVE_PARTNER`, `SUSPENDED`, `REJECTED`), credential issuance, and password verification read and write directly to PostgreSQL/Supabase.
- **Credential Storage:** Uses scrypt hashing (`hashPassword`, `verifyPassword`) with individual salt generation; raw passwords and salts are never returned across the API.
- **Fail-Closed Persistence:** In production, if database writes or reads fail, operations fail closed with controlled sanitized errors rather than faking success in memory.

### B. Authoritative Individual Staff Authentication & RBAC
- **Migration 003:** Created `supabase/migrations/003_staff_users_and_rate_limits.sql` adding:
  - `staff_users` table with individual scrypt credentials, `failed_login_attempts`, `locked_until`, `last_login_at`, and status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`).
  - `staff_audit_logs` table recording staff mutating actions with target entity, ID, IP address, and details.
  - Strict PostgreSQL Row Level Security (RLS) restricting `staff_users` table access to `service_role`.
- **Staff Service:** Built `server/auth/staffService.ts` providing:
  - Staff identity verification with scrypt hashing.
  - 5-consecutive failed attempts lockout (15-minute freeze).
  - RBAC support for `SUPER_ADMIN`, `OPS_AGENT`, and `FINANCE_DESK`.
  - Operator bootstrap procedure.
- **Route Handler:** Replaced shared admin secret in `src/app/api/auth/login/route.ts` with individual staff authentication; removed signed token reflection in JSON payloads (HttpOnly cookie only).

### C. Durable Session Authorization & CSRF Guard
- **Session Verification:** `server/auth/authService.ts` provides `extractSessionFromRequestAsync` verifying token signatures, database-backed `revoked_sessions` table, active staff account status, and active partner agency status.
- **Cross-Instance Revocation:** Logouts and suspensions are immediately enforced across all serverless instances via database persistence.
- **CSRF & Origin Verification:** Built `server/utils/csrfGuard.ts` enforcing matching Origin/Referer headers on cookie-authenticated mutating requests (`POST`, `PATCH`, `DELETE`).

### D. Distributed Sliding-Window Rate Limiting
- **Distributed Limiter:** Built `server/auth/distributedRateLimiter.ts` using PostgreSQL `rate_limits` table with atomic upserts and expiration windows.
- **Abuse Protection:** Integrated into `server/utils/abuseGuard.ts` and active on `/api/enquiries`, `/api/agency`, `/api/general`, and `/api/auth/login`.

### E. Resilient CRM Outbox & Recovery
- **Decoupled Sync:** `server/crm/ghlAdapter.ts` handles contact upserts and opportunity creation independently; opportunity creation failure queues a dedicated `GHL_OPPORTUNITY_RETRY` outbox task without failing contact upsert.
- **Dispatcher Recovery:** `server/crm/outboxDispatcher.ts` supports distributed row locking via `FOR UPDATE SKIP LOCKED`, exponential backoff, and recovery of expired worker leases.

### F. Vercel Deployment & Cron Schedule Resolution
- **Root Cause Analysis:** PR #3 on `main` failed deployment because `vercel.json` configured a cron schedule of `"*/5 * * * *"`. On Vercel Hobby accounts, cron jobs running more frequently than once per day trigger an immediate deployment rejection (<1s) by Vercel's API before build begins.
- **Resolution:** Updated `vercel.json` to `"schedule": "0 0 * * *"` (daily), fully complying with Vercel Hobby plan limitations.

---

## 3. End-to-End Verification Evidence Matrix

All verification gates were executed against the code on `claude/safaria-release-closure`:

| Test Suite / Gate | Command | Exit Code | Result Summary |
|---|---|:---:|---|
| **TypeScript Strict** | `npm run typecheck` | `0` | **PASS** — 0 errors across entire frontend and backend |
| **ESLint Flat Config** | `npm run lint` | `0` | **PASS** — 0 errors, 0 warnings |
| **Vitest Unit & Fast Integration** | `npm test` | `0` | **PASS** — 19 test files / 79 tests passing cleanly |
| **Native PostgreSQL 18 Server** | `vitest run realPostgresServer.test.ts` | `0` | **PASS** — 10 database-level tests passing (RLS isolation, persistence across restart, SKIP LOCKED) |
| **Purge & PII Safety Gate** | `npm run verify:purge` | `0` | **PASS** — 40 files scanned, 0 PII leaks, 0 unauthenticated external fetches |
| **3D Atlas & Globe Browser Check** | `npm run verify:atlas` | `0` | **PASS** — 8 routes, 0 errors, full Three.js canvas & node interaction |
| **Offers & Explorer Browser Check** | `npm run verify:phase23` | `0` | **PASS** — 26 offers, 33 destinations, favorites, search, responsive layout |
| **SEO & Mobile Emulation Check** | `npm run verify:phase45` | `0` | **PASS** — Canonical URLs, zero CLS, iPhone 13 & Pixel 7 emulation |
| **B2B End-to-End Workflows** | `npm run verify:b2b` | `0` | **PASS** — 13 browser phases verified: staff login, triage, approval, partner login, all 6 desks, cross-tenant rejection, session revocation |
| **Next.js Production Build** | `npm run build` | `0` | **PASS** — Next.js 16.4.5 Turbopack compiled 20 static/dynamic routes |

---

## 4. Preservation of Public Travel Experience

- Verified SAFARIA Visual Identity: Emerald (`#041713`), Navy (`#10243A`), Gold (`#D6B779`), Ivory (`#F8F5EC`).
- Fonts: Hind Siliguri (Bengali), Manrope (Body/UI), Playfair Display (Serif headings).
- Original Bengali Hero Section & Itinerary Cards: Preserved verbatim.
- Customer Enquiry Flow: Friction-free WhatsApp quotation deep link generation preserved; no raw public PII stored prior to approved data privacy policy.
- Safety Locks: Real financial charges, live GDS automated ticketing, and live radar feeds remain strictly disabled (`SAFETY_LOCKED = false`).
