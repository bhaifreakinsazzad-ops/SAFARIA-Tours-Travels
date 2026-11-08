# SAFARIA — Continuation Checkpoint

_Last updated: 2026-11-09 by Claude Code (Sonnet 5), continuation session `claude/safaria-prod-continuation-5ace06` (branched from `56f8c8db1c053a6ed43eaf26288a49692b8b4c76` / `v2.0.0-PROD-RC2` / `feat/safaria-production-foundation`)._

## 0. Environment note

The Claude Code worktree session this continuation launched in
(`claude/safaria-continuation-5ace06`) was checked out from an unrelated
baseline commit (`494ea7e`) containing only `design-system/project` and
`ghl-block/` — no Next.js app. The real platform was already checked out in
the **main repository folder**, so a new worktree/branch
(`claude/safaria-prod-continuation-5ace06`) was created from the exact
commit the directive reported, and all work below happened there. The main
checkout and the original worktree were left untouched.

One operational slip: while freeing port 3000, `taskkill /F /IM node.exe /T`
was run once, which kills every Node process on the machine, not just this
session's dev server. Flagging for awareness; no repo damage resulted. All
later process kills in this session were PID-targeted.

## 1. Critical finding and fix: B2B partner login had no password check

**This is the single most important finding of this continuation.**
`POST /api/auth/login` granted a full `B2B_PARTNER` session for **any**
approved agency's email address with **zero password verification** — no
`password` column existed anywhere in the schema (`agency_applications`),
so the login route never checked one; the `matchedAgency` branch issued a
session token regardless of what password string was submitted. A second,
separate hardcoded bypass (`partner@greendelta.com`, any password) existed
alongside it, live in production, with no environment gating. Neither path
had any test coverage, which is why "68/68 passing tests" never caught it.
Downstream authorization (`/api/partner/desk`, etc.) correctly scopes
access by the session's `agencyId`, so this was a full account-takeover
vector for every registered partner, not just the demo one.

**Fixed and tested** (commit `ffefb84`):
- `lib/auth/passwordService.ts` — scrypt password hashing/verification,
  high-entropy temporary password generation.
- `lib/db/enquiriesRepository.ts` — `agency_applications` gains
  `passwordHash`/`passwordSalt`; `updateAgencyStatus()` issues real
  credentials (hash persisted, plaintext returned once to the approving
  staff member) the first time an agency is approved; new
  `verifyAgencyCredentials()`.
- `supabase/migrations/002_agency_partner_credentials.sql` — adds the
  columns, revokes column-level `SELECT` from `authenticated`.
- `app/api/auth/login/route.ts` — demo bypass removed entirely; the real
  agency path now requires a verified password; added a simple in-memory
  per-IP+email rate limiter (`lib/auth/rateLimiter.ts`, 5 failures / 10 min
  → 15 min lockout) on both staff and partner login.
- `app/api/admin/agencies/route.ts` — relays the one-time issued password
  to staff only; strips `passwordHash`/`passwordSalt` from every agency
  object returned to any client.
- `tests/integration/partnerLoginSecurity.test.ts` — new regression
  coverage (4 tests) for the former bypass, credential issuance,
  wrong-password rejection, and rate limiting.

**Known follow-up, not fixed here:** `listAgencyApplications()` (and hence
login) never reads from Supabase even when configured — the in-memory
store is the de facto source of truth for agencies regardless of DB config.
This is a pre-existing multi-instance/restart consistency gap, separate
from the auth bypass, that needs its own pass.

## 2. Other fixes landed this session

- **Request body size limits** (commit `4542c2b`): Next.js Route Handlers
  impose none by default. Added `lib/utils/requestGuards.ts`
  (`readJsonBodyGuarded`, streams with a hard byte cap, doesn't trust
  Content-Length alone) and wired it into `/api/enquiries`, `/api/agency`,
  `/api/general`, `/api/auth/login`. Relevant given the `npm audit`-flagged
  zod memory-exhaustion advisory on oversized collections (see §4).
- **ESLint actually configured** (commit `dab4f9c`): no config existed at
  all before this session (`next lint` dropped into an interactive setup
  prompt). Added `eslint.config.mjs` + `eslint`/`eslint-config-next`.
  Running it for real surfaced ~35 pre-existing `@typescript-eslint/
  no-explicit-any` errors and assorted unused-var/react-hooks-deps
  warnings, written before any lint gate existed — **not fixed in this
  pass** (see §5 for the full list by file). `next.config.mjs` sets
  `eslint.ignoreDuringBuilds: true` so the production build stays green
  while `npm run lint` now does real, reportable work as its own gate.
- **Source ZIP packaging was broken** (commit `3b053ab`):
  `scripts/package-dist.js` requires `archiver`, which was never declared
  as a dependency — running it failed with `MODULE_NOT_FOUND`. Added it as
  a devDependency; regenerated the ZIP; see
  `docs/release-evidence/ARTIFACT_MANIFEST_SHA256.txt`.
- **Flaky embedded-Postgres test timeout**: bumped Vitest `hookTimeout`/
  `testTimeout` to 60s. The embedded PostgreSQL 18 suite's cold start can
  exceed the previous 30s default in a freshly `npm ci`'d environment
  (reproduced once, fixed on re-run).
- **Typecheck fix** (earlier, commit `7df7c58`): `authAndSecurity.test.ts`
  assigned directly to `process.env.NODE_ENV`, which newer `@types/node`
  marks read-only.

## 3. Verified test/build results (re-run from scratch, not trusted from prior reports)

| Command | Result |
|---|---|
| `npm run typecheck` | Clean (0 errors) |
| `npm run lint` | Runs for real now; ~35 pre-existing `no-explicit-any` errors + warnings (see §5) — not release-blocking by itself since build is decoupled from lint |
| `npm test` (Vitest) | **74/74 passed**, 16 files (68 original + 6 new from this session's fixes). Includes a real embedded PostgreSQL 18 engine with genuine `permission denied` / `row-level security policy` RLS errors — not mocked. |
| `npm run build` | Succeeds, 18 routes |
| Playwright E2E against `next dev` (cold) | 9/11 — 2 timeouts from dev-mode on-demand compilation exceeding the 30s test timeout, not application bugs |
| Playwright E2E against `next build && next start` | **11/11** |
| Fresh ZIP extraction (isolated temp folder, `npm ci` from the archive's own lockfile) | typecheck clean, 74/74 tests, build clean |

## 4. Dependency security (`npm audit`)

9 advisories before this session's `eslint`/`archiver` additions (2
critical, 3 high, 4 moderate), now 19 after (additional ones are all in the
new ESLint toolchain's own transitive deps — dev-only, not shipped).
**Not auto-fixed**: every available fix (`npm audit fix --force`) is a
semver-major bump (Next 15→16, Zod 3→4, Vitest 2→5), which the project
rules explicitly warn against doing as an unrelated/unreviewed upgrade. The
production-relevant one is `zod` (high: memory exhaustion on oversized
constrained collections) — mitigated in practice by the new request-size
guard (§2), since an attacker can no longer hand zod an arbitrarily large
payload to begin with. The rest (`vitest`/`vite`/`esbuild`/`tinypool`/
`postcss`) are dev-toolchain-only, not present in the production bundle.
Recommend reviewing a Next 16 / Zod 4 upgrade as its own planned,
tested piece of work — not bundled into this fix pass.

## 5. Lint debt inventory (not fixed — tracked for a future pass)

`npm run lint` now genuinely runs. Current findings, all pre-existing (none
introduced by this session's new files, which lint clean):
- `@typescript-eslint/no-explicit-any` (**error**, ~35 occurrences) in:
  `app/api/admin/{agencies,enquiries}/route.ts`, `app/api/agency/route.ts`,
  `app/api/auth/{login,logout}/route.ts`,
  `app/api/cron/dispatch-outbox/route.ts`, `app/api/enquiries/route.ts`,
  `app/api/general/route.ts`, `app/api/partner/{desk,verify-passenger}/route.ts`,
  `app/partner/page.tsx`, `components/{B2BApplicationModal,FlightEnquiryForm,
  GeneralEnquiryModal,JourneyAtlas,TrackEnquiryModal}.tsx`,
  `lib/crm/{ghlAdapter,outboxDispatcher}.ts`, `lib/db/enquiriesRepository.ts`.
  Mostly `catch (err: any)` and a few CRM/three.js payload shapes.
- Unused imports/vars (**warning**) across `app/admin/page.tsx`,
  `app/partner/page.tsx`, several `components/*.tsx`.
- `react-hooks/exhaustive-deps` (**warning**) in `app/partner/page.tsx` and
  `components/TrackEnquiryModal.tsx`.
- One `@next/next/no-page-custom-font` warning in `app/layout.tsx`.

## 6. CI workflow (`.github/workflows/ci.yml`) — reviewed, not run

Correctly builds production (`next build`) and runs Playwright against
`next start`, not `next dev` — matching what this session found is
necessary to avoid flakiness. No `origin` remote is configured in this
repository, so this workflow **has never actually executed on GitHub**:
status is `CI_CONFIGURED / REMOTE_UNVERIFIED`, not "CI passing." No `npm
run lint` step exists yet; adding one now would immediately turn CI red
over the pre-existing debt in §5, so it's intentionally not added until
that's paid down (or until it's added as `continue-on-error`).

## 7. Spot-checked safety claims (source-level, from the prior checkpoint — re-confirmed, no changes)

- SESSION_SECRET fails closed in production. Verified by passing test.
- 72-hour B2B trial is not auto-activated; requires a separate staff
  action. Verified in `app/api/agency/route.ts` / `app/api/admin/agencies/route.ts`.
- Live payments/GDS ticketing flags default `false` and are not consumed
  anywhere — no implementation exists yet, so nothing is at risk of
  silently going live.
- Only one hotline number (`+8801674178437`) and one price point (৳20,000/mo,
  explicitly labelled "Under Pilot Review") appear anywhere in source — the
  historically reported conflicts do not currently exist in code.

## 8. Honest gap list — NOT done this session

- Full Phase 2 red-team pass beyond the login fix (CSRF token/
  double-submit, broader brute-force coverage beyond login, PII/logging
  hygiene review).
- Phase 3 six-desk functional UAT matrix (manual/scripted walk-through with
  two synthetic agencies).
- Phase 4 CRM outbox failure-injection testing (429/500/crash scenarios) —
  existing `outboxDispatcher.test.ts` is unit-level only.
- `FUNCTIONAL_UAT_MATRIX.md`, `CRM_DELIVERY_EVIDENCE.md`,
  `COMMERCIAL_APPROVAL_REGISTER.md`, `UX_CONTENT_QA.md`,
  `STAGING_DEPLOYMENT_READINESS.md`, `RELEASE_MANIFEST.md`,
  `START_HERE_FOR_RELEASE.md` — intentionally **not created**; creating them
  without having done the underlying work would be exactly the placeholder
  padding the master directive forbids.
- Paying down the §5 lint debt and the §4 dependency-major-version debt.
- Fixing the §1 "known follow-up" (agency reads never hitting Supabase).

## 9. Immediate next actions, in priority order

1. If this is heading toward real deployment: have the agency-portal
   credential-issuance UX (temp password shown once to staff, relayed
   out-of-band) reviewed by the owner — it's a real but minimal flow, not
   yet battle-tested against how staff actually operate day to day.
2. Decide whether `listAgencyApplications`'s in-memory-only reads (§1
   follow-up) block going live with Supabase configured, or can wait.
3. Phase 3 UAT pass once the above is settled.
4. Pay down lint/dependency debt (§4, §5) as a dedicated pass, not mixed
   into feature/security work.
