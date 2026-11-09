# SAFARIA Post-Merge Hardening — Continuation Checkpoint

**Branch:** `claude/safaria-postmerge-hardening`
**Based on:** `main` @ `5738e75` (merge commit of PR #1, `claude/safaria-integration-main` → `main`)
**Scope:** Post-merge production completion directive — authentication wiring, B2B desk real-data
wiring, RLS enforcement, CRM outbox correctness bugs, GHL opportunity creation, public-enquiry abuse
protection, Vercel Cron wiring. No new PR opened per the directive's "do not create another PR for the
same integration work" instruction for this merged-PR scenario — this branch is ready for its own
review when pushed.

## A. Source Control

- Repository: `https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels`
- Base: `main` @ `5738e75` (confirmed via `git log origin/main` before branching — the merge commit is
  a real ancestor, not just claimed)
- Development branch: `claude/safaria-postmerge-hardening`
- Commit SHA: see the commit this file ships in (`git log -1` on this branch after push)
- Pushed branch status / PR URL: see the chat response accompanying this checkpoint

## B. What Was Independently Verified Before Any Code Was Written

Four parallel read-only audits (not this author's own prior claims) inspected the actual code against
the directive's P0 sections. Summary of what they found **already true** before this session touched
anything:

- Auth primitives (`server/auth/*`) are real: HMAC-SHA256 signed sessions, scrypt password hashing,
  sliding-window rate limiting, DB-backed session revocation, cross-tenant checks at the API layer.
- RLS policies (`supabase/migrations/001_safaria_core_schema.sql`) are real and were already proven,
  via raw SQL in `tests/integration/realPostgresServer.test.ts`, to reject cross-tenant access.
- The GHL contact-upsert path is real (genuine `fetch` to `services.leadconnectorhq.com`), gated
  correctly on credential presence.
- The outbox's retry/backoff (`2^attempts * 2` seconds, 5-attempt terminal state) is real.

And what they found **not actually true** despite looking complete:
- No login page existed anywhere; `/admin` and `/partner` sent hardcoded placeholder headers
  (`"x-safaria-admin-key": "safaria-ops-2026"`, `"staging-token"`, `"Bearer mock-token"`) that the
  server correctly rejected outside `NODE_ENV=test` — all four desks and both staff/partner "portals"
  were non-functional through the real UI.
- `src/app/api/auth/login/route.ts` had a hardcoded staff-password fallback
  (`SAFARIA_ADMIN_SECRET || "safaria-ops-2026"`) with **no production guard** — a real demo-bypass bug,
  not test-only.
- `enquiriesRepository.listB2BDeskRecords` / `updateB2BDeskRecord` only ever read/wrote an in-memory
  `Map`, never Supabase — desk records and their audit trail did not survive a serverless restart.
- RLS was real but **dormant**: the application only ever constructed a service-role Supabase client,
  which bypasses RLS entirely. The database was never the actual tenant boundary for any real request —
  only the route handler's session-derived `agencyId` check was.
- The outbox's Supabase claim path had a genuine race condition (select-then-blind-update, no status
  guard on the UPDATE itself) and a fallthrough bug (zero Supabase candidates fell through to claiming
  stray in-memory entries).
- `enqueueOutbox` wrote to the memory-store mirror unconditionally, even after a successful Supabase
  insert — a legitimate idempotency-key collision would still produce a duplicate in memory.
- GHL opportunity creation did not exist at all, despite a header comment claiming it did.
- No rate limiting or duplicate-submission protection existed on the public enquiry endpoints.
- No Vercel Cron config existed; `/api/cron/dispatch-outbox` was unreachable in production.
- `.env.example` was stale ("no environment variables are required"), predating the entire backend.

## C. Work Completed This Session

1. **Removed the hardcoded staff-password fallback and the leaked admin-key client literal.**
   `login/route.ts` now mirrors `authService.ts`'s existing fail-closed pattern: `SAFARIA_ADMIN_SECRET`
   is mandatory in production, with no literal fallback outside local/test runs.
2. **Built a real `/login` page** (`src/app/login/page.tsx`) — staff and partner share one form,
   POSTs to `/api/auth/login`, relies on the httpOnly cookie the server already sets.
3. **Rewired `/admin` and `/partner`** to drop every hardcoded header, check `/api/auth/me` on mount
   with `credentials: "include"`, redirect to `/login` when unauthenticated, and added sign-out buttons
   that call `/api/auth/logout`.
4. **Made B2B desk reads/writes durable**: `listB2BDeskRecords` and `updateB2BDeskRecord` now read/write
   Supabase (service-role path) with an append-only audit trail, falling back to memory only when
   Supabase is unconfigured or the call fails.
5. **Made RLS the real, DB-enforced tenant boundary for partner desk access** — not just tested-but-
   dormant defense-in-depth. New `server/db/scopedPgClient.ts` opens a direct Postgres connection (via
   an optional `DATABASE_URL`) and runs desk creates/reads/a-partner's-own-updates inside
   `SET LOCAL ROLE authenticated` + `app.current_agency_id`, reusing the *existing, already-tested* RLS
   policies verbatim (no policy rewrite). A new integration test
   (`tests/integration/realPostgresServer.test.ts`, "closes the audited gap...") proves — against a
   real PostgreSQL 18 engine, through the actual repository functions, not raw SQL — that one agency
   cannot list or update another agency's desk records. **This activates only when `DATABASE_URL` is
   configured**; without it, the service-role path (app-code tenant check only) remains the fallback,
   exactly as before this session.
6. **Fixed three real outbox correctness bugs**: the claim UPDATE now re-asserts the status guard
   (closes the double-claim race), a legitimately-empty Supabase candidate set returns immediately
   instead of falling through to the memory store, and a successful Supabase insert no longer also
   writes a memory-store duplicate.
7. **Implemented GHL opportunity creation** (`tryCreateOpportunity` in `ghlAdapter.ts`), wired into both
   `syncFlightEnquiry` and `syncAgencyApplication`. Gated on `GHL_PIPELINE_ID`/`GHL_PIPELINE_STAGE_ID`,
   neither of which is configured anywhere — **this is implemented but genuinely inert** until the
   business owner provisions a real GHL pipeline (see Section E).
8. **Added rate limiting + duplicate-submission detection** (`server/utils/abuseGuard.ts`) to all three
   public enquiry endpoints (`/api/enquiries`, `/api/general`, `/api/agency`): 5 submissions per 10
   minutes per IP, and a 5-minute content-fingerprint dedup window.
9. **Wired Vercel Cron** (`vercel.json`) to `/api/cron/dispatch-outbox`, which gained a `GET` handler
   matching Vercel Cron's actual invocation contract (`Authorization: Bearer <CRON_SECRET>`) — the
   previous POST-only handler with an `x-cron-secret` header was never reachable by Vercel's own cron
   mechanism.
10. **Rewrote `.env.example`** to document every environment variable the code actually reads.
11. Public visitor-facing forms remain **untouched** — still zero network calls, WhatsApp-draft-only,
    per the owner's existing data-handling approval boundary. No feature flag was added for this because
    none was needed: the purge gate (`scripts/check-purge.cjs`) already makes any wiring attempt fail
    the build, so "dormant until approved" is structurally enforced, not just a runtime toggle.

## D. Implemented Functionality — Status

| Feature | Status |
|---|---|
| Public website (design, Atlas, offers, WhatsApp journey) | `VERIFIED` — `verify:purge`/`verify:atlas`/`verify:phase23`/`verify:phase45` all pass, unchanged |
| Customer quotation workflow (DB-backed, one-way/round-trip/multi-city, visa/corporate/holiday/Umrah) | `VERIFIED_LOCAL` — real validation + persistence + reference lookup, tested; dormant per owner approval boundary (by design, not a flag) |
| Agency onboarding / B2B application | `VERIFIED_LOCAL` |
| Staff administration (`/admin`) | `VERIFIED_LOCAL` — real login, real server-side role gate, real cookie session |
| Partner authentication (`/login` → `/partner`) | `VERIFIED_LOCAL` — real login, real session, real logout |
| FareDesk™ | `VERIFIED_LOCAL` — real form → real persisted record; sample fares are manual-request, now honestly labeled as such, not live GDS |
| BookingDesk™ | `VERIFIED_LOCAL` |
| AfterCare Desk™ | `VERIFIED_LOCAL` |
| Verified Workflow™ (passenger audit) | `VERIFIED_LOCAL` — real validation logic, real session gate |
| ClearMargin™ | `VERIFIED_LOCAL` — now computed from this agency's own real FareDesk/BookingDesk records (previously fully static) |
| PartnerGrowth™ | `VERIFIED_LOCAL` — tier now computed from real logged BookingDesk count (previously fully static) |
| Tenant isolation (app-code) | `VERIFIED` — real-Postgres + unit tests |
| Tenant isolation (DB/RLS) | `VERIFIED_LOCAL` when `DATABASE_URL` is configured; `NOT_READY` (falls back to app-code-only) otherwise — see Section E |
| CRM contact sync | `VERIFIED_LOCAL` (real API shape) / `BLOCKED_EXTERNAL` (live confirmation needs real GHL creds) |
| CRM opportunity creation | `SIMULATED` — code is real and tested against a mocked `fetch`, but inert without a real GHL pipeline — see Section E |
| Outbox reliability (claiming, backoff, idempotency) | `VERIFIED_LOCAL` |
| Vercel Cron dispatch | `NOT_READY` — config added, cannot be verified until actually deployed to Vercel |
| Staff notification triggers (GHL CRM section) | `NOT_READY` — no channel (email/SMS/Slack) has been decided or configured; needs an owner decision, not just credentials |

## E. Remaining Decisions Requiring Owner Authorization

1. **Public PII collection / live form wiring** — unchanged from before this session: requires the
   owner's approved privacy notice, consent language, and data-retention policy before any public form
   is wired to the backend. Nothing in this session moves that forward or backward.
2. **GHL pipeline for opportunity creation** — needs `GHL_PIPELINE_ID` and `GHL_PIPELINE_STAGE_ID` from
   a real, owner-provisioned GHL pipeline, plus the base `GHL_API_KEY`/`GHL_LOCATION_ID`. Until then,
   opportunity creation silently no-ops (contact sync still works).
3. **Staff notification channel** — the directive asks for "staff notification triggers" but no channel
   was ever chosen (email via SendGrid? Slack? SMS via Twilio?). Implementing one would mean picking a
   provider and its credentials; deferred rather than guessed.
4. **`DATABASE_URL` for DB-enforced RLS** — a direct Postgres connection string (distinct from the
   Supabase REST URL + service-role key) activates the real RLS boundary for partner desk access
   (Section C.5). Without it, the existing service-role/app-code-only boundary remains in place — not a
   regression, but also not yet the stronger guarantee this session built and tested.
5. **Vercel Cron schedule** — `*/5 * * * *` was chosen as a reasonable default; Vercel's Hobby plan
   only permits daily cron, so this may need adjusting (or a Pro plan) at actual deploy time.
6. **Production deployment of this branch** — not done, not requested; this checkpoint and the pushed
   branch are the deliverable for owner/reviewer decision.

## F. Verification Evidence (this session, on this branch)

- `npm run typecheck` — clean, 0 errors
- `npm run lint` — clean, 0 errors, 0 warnings
- `npm test` (vitest) — **70/70** unit + fast-integration tests pass (17 files), plus **9/9** real-
  PostgreSQL-18 integration tests pass in a separate run (embedded Postgres, includes the new
  RLS-through-the-repository-function test) — 79 total. The two suites are run separately in this repo
  because the embedded-Postgres harness uses a fixed port (54333) and is sensitive to concurrent vitest
  workers; this is a pre-existing test-infra characteristic, not something introduced here.
- `npm run build` — clean, 20 routes, no warnings
- `npm run verify:purge` — pass (40 files scanned, canonical domain intact)
- `npm run verify:atlas` — pass (8 routes, unchanged)
- `npm run verify:phase23` — pass (26 offers, 33 destinations, unchanged)
- `npm run verify:phase45` — pass (iPhone 13 / Pixel 7 device emulation, unchanged)
- No `playwright.config.*` or `tests/e2e/` exist in this repo — the project's actual "browser tests"
  are the four `verify:*` scripts above (confirmed by reading `package.json` and the filesystem directly,
  not assumed from the directive's wording).
- Manual live-server verification (`npm run start` + curl) confirmed the login→cookie→`/admin`/`/partner`
  flow once, then was superseded by the deterministic `tests/integration/authCookieFlow.test.ts`, which
  exercises the same flow through the real route handlers without depending on this machine's port
  state (the dev machine had numerous unrelated stray `node.exe` processes from earlier in this
  session's history, causing real but environmental — not code — port-contention noise during manual
  checks; the automated test avoids that entirely and is the test that should be trusted going forward).

## G. Known Pre-Existing / Unrelated Observations (not touched, flagged for visibility)

- The embedded-Postgres test harness's fixed port (54333) means stray processes from an interrupted
  prior run can cause spurious failures on the next run — pre-existing, documented in this repo's own
  test history, not introduced or fixed in this session.
- This dev machine accumulated many unrelated background `node.exe` processes across this long session's
  history; none were killed indiscriminately (lesson already learned earlier in this engagement), only
  PID-targeted kills of processes this session itself started.
