# SAFARIA Tours & Travels — Project Status Briefing

**Prepared:** 2026-11-09
**Repository:** https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels
**Current branch (this workspace):** `claude/safaria-postmerge-hardening`
**Open PR:** [#3](https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels/pull/3) — draft, not merged

---

## 1. What this project is

A premium travel-tech platform for SAFARIA Tours & Travels (Next.js 16 / React 19), live at
`https://safaria.vibing.world`. Public-facing: destination offers, a 3D "Journey Atlas," Travel Studio,
bilingual (Bengali/English) UX, and a WhatsApp-based enquiry flow. Behind that sits a separately-built
backend: Supabase/Postgres persistence, staff/partner authentication, six B2B "operational desks" for
travel agencies, and a GoHighLevel CRM integration.

## 2. Condition found at the start of this engagement

- **Public site**: fully built, deployed, and working — by design, visitor forms made **zero network
  calls**; every enquiry became a pre-filled WhatsApp message the visitor had to press Send on. This was
  a deliberate, documented choice pending the owner's approval of data-handling/privacy terms, enforced
  by a repo script (`scripts/check-purge.cjs`) that fails the build if any form ever calls a backend.
- **Backend platform**: built on a **separate, unrelated git branch/history** (different Next.js
  version, different architecture) that had never been merged with the live site. It had never been
  independently verified — on inspection, it had a real critical bug: B2B partner login accepted **any
  password** for an approved agency (no hash check at all), plus a hardcoded bypass account.
- The two halves had no common git ancestor, so GitHub couldn't even diff them for a pull request.

## 3. Work completed, in order

**Phase 1 — Verify and fix the backend branch on its own.**
Independently re-verified every claim about the backend (didn't trust prior descriptions), fixed the
critical login bug with real password hashing + rate limiting, added missing request-size limits, set
up linting (none existed), and produced honest evidence of what was tested vs. not.

**Phase 2 — Merge the two halves (`claude/safaria-integration-main` → PR #1, merged to `main`).**
Rather than merge two unrelated histories (impossible cleanly), branched fresh from the live site and
selectively **ported the backend in as additive code** — new `server/` directory, 11 API routes, new
`/admin` and `/partner` pages — without touching the public site's design, content, or the WhatsApp-only
behavior. Fixed real integration friction (a hardcoded domain, duplicated/conflicting pricing config,
~30 lint violations to meet this repo's stricter bar). This was reviewed and merged as **PR #1**.

**Phase 3 — Post-merge hardening (`claude/safaria-postmerge-hardening` → PR #3, currently open).**
A second independent audit (four parallel reviews) found that although the merged backend's low-level
pieces were real (real crypto, real DB schema, real RLS policies, real CRM API calls), **none of it was
actually wired together**: no login page existed; the admin/partner dashboards sent hardcoded fake
auth headers that the server correctly rejected; a real hardcoded-password fallback existed with no
production guard; desk data only lived in an in-memory map (never Supabase); the database's row-level
security was real but **dormant** because the app only ever used a privileged service-role connection
that bypasses it; the CRM outbox had a genuine race condition letting two workers double-process the
same job; GHL "opportunity creation" was claimed in a comment but never written; and the public forms
had no rate limiting or duplicate-submission protection at all.

All of the above were fixed, each with an automated regression test (79 tests total, including a new
test that proves tenant isolation against a **real PostgreSQL 18 engine**, not just application logic).
Typecheck, lint, production build, and all four of the project's own browser-verification scripts pass
cleanly, with the public site's design/content/offers confirmed byte-for-byte unchanged. Full detail is
in [`docs/release-evidence/CONTINUATION_CHECKPOINT.md`](docs/release-evidence/CONTINUATION_CHECKPOINT.md).

This work was pushed and **PR #3** was opened for review (currently a draft).

## 4. Where things stand right now

- **PR #3 is open but its Vercel preview deployment is failing.** This was being actively investigated
  when work paused — the deployment fails in well under a second with no build or runtime logs
  recorded, which points to a very early configuration-level failure rather than a code/test problem
  (everything passes locally, as above). Root cause not yet identified.
- A new instruction ("Directive 010") has been received asking for a further round of hardening on
  this same PR: database-backed agency management with no memory fallback, individual staff accounts
  (replacing the current shared staff password), making the RLS tenant boundary fail closed if its
  database connection is unavailable, deeper CRM outbox reliability (lease recovery, partial-retry,
  opportunity reconciliation), moving rate limiting to a shared/distributed store instead of in-process
  memory, stricter B2B input validation, and resolving the Vercel failure above. **This work has not
  started** — it was paused to produce this briefing.

## 5. Decisions still needed from the project owner (unrelated to engineering)

- A real GoHighLevel pipeline (ID + stage ID) — CRM contact sync works today; opportunity creation is
  written but inert without this.
- Approval of the privacy notice / consent language / data-retention policy before any public form can
  ever be connected to the backend (still fully WhatsApp-only today, unchanged).
- A decision on how staff get notified of new leads (email/Slack/SMS) — no channel has been chosen.
- Whether/when to actually deploy this branch to production, once its Vercel issue is resolved and it's
  reviewed.

## 6. Nothing destructive has happened

No force-pushes, no `main` branch changes, no merges, no production deployment, and no live
payments/ticketing/PII collection were enabled at any point. Every piece of work lives on its own
branch/PR, reviewable and revertible.
