# SAFARIA — Workspace Agent Rules

You are implementing SAFARIA Tours & Travels (Just Another Travel Group) into a secure production-grade travel-tech application.

## Required inputs
Before editing, read `safaria_platform_master_application.md` (raw HTML despite `.md`), `safaria_master_technical_directive_and_implementation_document.md`, and `SAFARIA_ANTIGRAVITY_MASTER_DEVELOPMENT_PROMPT.md`. Also consult the B2B pain-points file if present. Inspect the actual repository and Git status.

## Absolute constraints
- Preserve verified SAFARIA visual identity: emerald/navy/gold/ivory, Hind Siliguri/Manrope/Playfair, original Bengali hero and the existing website sections.
- Never misrepresent an enquiry as a confirmed flight, booking, fare, ticket, active trial, refund, licensed supplier connection or live radar.
- Never invent customer records, business accreditation, prices, testimonials or performance claims.
- Financial/ticket issuance, collection, supplier API access and trial activation OFF by default until permissions/agreements and user approval are confirmed.
- Never commit/deploy secrets or raw PII. Use secure server routes, validation, real persistence, RBAC and RLS. Do not reuse permissive RLS from the legacy draft.
- No direct public localStorage PII store or publicly accessible admin panel. No successful confirmation before durable server persistence.
- No generic rebrand, duplicated sections or uncontrolled rewrites; use incremental change sets and automated tests.
- Do not force all production functionality into a GoHighLevel custom-coded HTML block. Use GHL as an API-integrated CRM layer.
- Research current vendor API docs before integrating. Handle unavailable credentials with honest disabled states and mock/test adapters only in nonproduction environments.
- Do not force-push, overwrite uncommitted changes, alter production, DNS, or execute destructive migrations without explicit permission.

## Execution discipline
- Begin with source/repo audit; record evidence in `docs/audits/BASELINE_AUDIT.md`.
- Maintain `docs/REQUIREMENTS_TRACEABILITY.md` and `docs/FEATURE_READINESS_MATRIX.md`.
- Use dependency-ordered phases with explicit tests and acceptance gates.
- Enforce strict TypeScript, shared input schemas, accessible mobile-first UI, localization parity and role-isolation tests.
- For each milestone, run typecheck, lint, build, and targeted tests; use browser verification and screenshots where possible.
- Report concrete files changed, tests run, remaining blockers and Git status. Do not claim completion without verification.
