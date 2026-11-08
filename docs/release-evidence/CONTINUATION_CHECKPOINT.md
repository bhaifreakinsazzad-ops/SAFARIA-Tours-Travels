# SAFARIA — Continuation Checkpoint

_Last updated: 2026-11-09 by Claude Code (Sonnet 5), continuation session `claude/safaria-prod-continuation-5ace06`._

## 0. Environment note (read this first)

The Claude Code **worktree session** this continuation was launched in
(`claude/safaria-continuation-5ace06`) was checked out from commit `494ea7e`
("Baseline: SAFARIA v2 design system + GHL block (pre agent-army)") — a
branch that contains **only** `design-system/project` and `ghl-block/`, i.e.
the earlier marketing-site/GHL-funnel work. It does **not** contain the
Next.js/Supabase travel-tech platform described in the continuation
directive.

That platform **does exist** in this repository, verified at:
- Branch: `feat/safaria-production-foundation`
- Tag: `v2.0.0-PROD-RC2`
- Full HEAD SHA: `56f8c8db1c053a6ed43eaf26288a49692b8b4c76` (short: `56f8c8d`)
  — matches the directive's reported commit prefix exactly.
- It was already checked out in the **main repository working copy**
  (`E:\Agentic Work Station\Websites\SAFARIA Tours & Travels`, not a
  worktree), on the same commit.

Because that branch was already checked out in the main repo (git forbids
checking out the same branch in two worktrees at once), a **new worktree**
was created, non-destructively, branched from `v2.0.0-PROD-RC2` /
`56f8c8d`:

- New branch: `claude/safaria-prod-continuation-5ace06`
- Path: `E:\Agentic Work Station\Websites\SAFARIA Tours & Travels\.claude\worktrees\safaria-prod-continuation`

**All verification below was performed in that new worktree.** The main
repo checkout and the original `safaria-continuation-5ace06` worktree were
left untouched.

**Operational note:** while hunting a stuck port-3000 listener, a
`taskkill /F /IM node.exe /T` was run. That command kills *every* Node
process on the machine, not just this session's dev server — it was broader
than intended and could have affected Node processes belonging to other
sessions/tools running at the time. No destructive repo action resulted,
but flagging it for the owner's awareness per the safety rules.

## 1. Phase 1 — Source & Git provenance (VERIFIED)

| Item | Status | Evidence |
|---|---|---|
| Repo root / project identity | `VERIFIED_LOCAL` | SAFARIA Tours & Travels confirmed; no HOOOPLAAA files touched |
| Branch `feat/safaria-production-foundation` | `VERIFIED_LOCAL` | exists, HEAD matches tag |
| Tag `v2.0.0-PROD-RC2` | `VERIFIED_LOCAL` | lightweight tag, points at `56f8c8d` |
| Commit prefix `56f8c8d` | `VERIFIED_LOCAL` | exact match |
| `design-system/dist/...zip` source archive | `NOT_RUN` | not yet located/audited this session — next step |
| `npm ci` from lockfile | `VERIFIED_LOCAL` | clean install, 218 packages, 0 install errors (9 known npm-audit advisories, not yet triaged) |

## 2. Phase 1 — Real test/build results (VERIFIED, re-run from scratch)

Previous agent reports claimed "68 Vitest / 11 Playwright tests passed."
This was **independently re-run**, not trusted:

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | **FAILED initially** (2 errors) → **fixed, now 0 errors** | `tests/unit/authAndSecurity.test.ts` assigned directly to `process.env.NODE_ENV`, which newer `@types/node` marks read-only. Fixed via cast to `Record<string,string>`. Committed. |
| `npm run lint` | **BLOCKED_EXTERNAL / NOT_CONFIGURED** | No ESLint config exists in the repo (`next lint` dropped into an interactive "configure ESLint" prompt). The "lint" claim in prior reports is unverified — lint has never actually been set up here. |
| `npm test` (Vitest) | **68/68 passed**, 14 files | Includes `tests/integration/realPostgresServer.test.ts`, which boots a **real embedded PostgreSQL 18** engine (not mocked) and observes genuine `permission denied for table ...` / `row-level security policy` errors when a non-owner role is used — real RLS enforcement, not just GRANT failures. |
| `npm run build` | **Succeeded** | 18 routes (static + dynamic API routes) built cleanly. |
| Playwright E2E against `next dev` (cold) | **9/11 passed, 2 failed** | Both failures were timeouts tied to dev-mode on-demand compilation exceeding the 30s test timeout on first hit — not application bugs. |
| Playwright E2E against `next build && next start` (production server) | **11/11 passed** | Confirms the directive's "11 Playwright tests" claim is accurate **when run against a production build**, not `next dev`. This distinction should be written into the CI workflow and runbook so future runs don't flake. |

**Conclusion:** the prior agent's "68 Vitest / 11 Playwright" claim holds up
under independent re-run, with one caveat (dev-server flakiness) now
documented, and one true defect (typecheck failure) found and fixed.
"Lint passing" was **not** verified — no lint config exists.

## 3. Phase 2/5 — Spot-checked safety claims (source-level audit)

Quick source-level checks (not yet a full red-team pass):

- **SESSION_SECRET fail-closed**: `lib/auth/authService.ts:getSecretKey()` throws
  `FATAL SECURITY CONFIGURATION...` when `NODE_ENV=production` and no
  `SESSION_SECRET` is set (except during the Next.js build phase). Confirmed
  by passing test. `VERIFIED_LOCAL`.
- **72-hour B2B trial is NOT auto-activated**: `app/api/agency/route.ts`
  persists new applications with `PENDING_VERIFICATION` status only; the
  response text says the trial "will be activated upon trade credential
  audit." Activation itself is a separate staff action
  (`app/api/admin/agencies/route.ts`). `VERIFIED_LOCAL`.
- **Live payments / GDS ticketing**: `lib/config/featureFlags.ts` gates
  `enableLivePaymentGateway` / `enableLiveGdsTicketing` behind
  `ENABLE_LIVE_PAYMENTS` / `ENABLE_LIVE_GDS_TICKETING` env vars, both
  default `false` in `.env.example`. Neither flag is actually consumed
  anywhere else in the codebase — i.e. there is no live payment or GDS
  ticketing code at all yet, so nothing is at risk of silently going live.
- **Hotline number conflict** (historically `+8801674178437` vs
  `+8801641178437`): only `+8801674178437` appears anywhere in source
  (`lib/config/siteConfig.ts`, WhatsApp formatter + its tests). The
  conflict described in the directive does not currently exist in code —
  one number is used consistently. Still **owner-approval required** to
  confirm this is the correct number, but there is no live conflict to fix.
- **Pricing conflict** (historically ৳20,000/mo + ৳130,000/yr vs
  ৳5,999/mo + ৳69,999/yr): only `৳20,000/mo` appears in source
  (`components/B2BAgencySection.tsx`), explicitly labelled "Under Pilot
  Review" in both languages. The other three historical figures do not
  appear anywhere. `OWNER_APPROVAL_REQUIRED` to formally bless the number,
  but no live unqualified-commitment defect exists today.

## 4. NOT yet done this session (honest gap list)

These phases from the master directive have **not** been executed yet —
do not assume otherwise:

- Full Phase 2 security gate (positive/negative API tests per role,
  CSRF/rate-limit/PII review, restart-based session-revocation test beyond
  what the existing Vitest suite already covers).
- Phase 3 six-desk functional UAT matrix (manual/scripted walk-through of
  FareDesk, BookingDesk, ClearMargin, AfterCare, Verified Workflow,
  PartnerGrowth with two synthetic agencies).
- Phase 4 CRM outbox concurrency/failure-injection testing (429/500/crash
  scenarios) — the existing `outboxDispatcher.test.ts` (3 tests) is unit-level
  only.
- Source ZIP location/audit, fresh-extraction test, SHA-256 manifest.
- CI workflow (`.github/workflows/ci.yml`) review.
- `docs/release-evidence/*` deliverables beyond this checkpoint file.
- ESLint setup/config (currently absent).
- `npm audit` triage (9 advisories: 4 moderate, 3 high, 2 critical — not yet
  reviewed).

## 5. Immediate next actions

1. Triage the 9 `npm audit` advisories (2 critical) before any further
   release claims.
2. Stand up ESLint config so "lint" is a real, checkable gate.
3. Locate/validate the claimed source ZIP
   (`design-system/dist/safaria-v2.0.0-staging-rc2-source.zip`) if it
   exists in the main checkout, or regenerate it from this verified commit.
4. Decide, with the owner, whether ongoing work continues in this new
   worktree/branch (`claude/safaria-prod-continuation-5ace06`) going
   forward, since the original session worktree is on an unrelated
   baseline branch.
