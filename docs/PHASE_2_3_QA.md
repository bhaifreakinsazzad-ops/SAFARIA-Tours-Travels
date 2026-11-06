# Phase 2/3 local QA

## Scope

Implemented in the new Next.js app: emerald globe visual upgrade, 26 data-driven campaign cards, 33-location explorer, five-step persisted Travel Studio, and agency pricing/application. No deployment or external provider integration was performed.

## Checks

- `npm run import:data` imported 26 offers and 33 destinations from the supplied CSV files.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed.
- `npm run verify:atlas` checks the original eight route nodes, accessible route list, WebGL fallback, reduced motion, mobile layouts, offscreen pause and WhatsApp number.
- `npm run verify:phase23` checks campaign presets, all cards, favorite persistence, search/filter, destination modal, Travel Studio validation and refresh persistence, Bengali/English WhatsApp encoding, agency pricing arithmetic, trial consent and responsive overflow.
- Lighthouse against the local production build: mobile **83 performance / 100 accessibility / 100 best practices / 100 SEO**; desktop **98 / 100 / 100 / 100**. Mobile LCP was 3.8 s under Lighthouse emulation. Reports are saved locally in `qa-phase23/`.
- `npm audit --omit=dev` reported zero production dependency vulnerabilities.

## Product limits

- The WhatsApp links prepare messages only. Users must press Send; there is no delivery receipt or CRM submission.
- Agency prices follow the new phase directive in this app. Older GHL project files contain historical pricing; no hosted GHL page was changed.
- The “AI Draft My Trip” button creates a local template with a typing effect, not an AI-generated response.
- Travel Studio state and favorites persist only in the browser's local storage. Drafts can be cleared with the UI button. They are not synced to an account.
- Agency applications are subject to verification, fair use and approved written terms; the form does not activate a trial, subscription or ticket credit.
