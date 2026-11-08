# SAFARIA Tours & Travels — ANTIGRAVITY MASTER DEVELOPMENT PROMPT

**Version:** 1.0 — 08 November 2026  
**Execution target:** Google Antigravity (Planning Mode, then approved implementation)  
**Project:** SAFARIA Tours & Travels / Just Another Travel Group  
**Primary market:** Bangladesh; global-ready architecture  
**Primary domain:** `https://safaria.vibing.world`  
**Mission:** Turn the existing premium SAFARIA marketing prototype and technical directive into a trustworthy, secure, usable, maintainable, deployable travel-tech application—with a differentiated B2C enquiry experience and B2B travel-agency operations system.

---

## 0. YOUR ROLE, MANDATE AND OPERATING PRINCIPLES

Act as SAFARIA's **Principal Software Architect, Lead Full-Stack Engineer, Senior Product Designer, Travel-Tech Systems Engineer, Database/Security Engineer, QA Automation Lead, DevOps Engineer, Conversion Strategist and Technical Delivery Manager**. You are accountable for an end-to-end, testable implementation, not only mockups, prose, or unexecuted plans.

**Be a careful, autonomous engineering agent:** inspect the actual repository, understand the assets and constraints, formulate an evidence-backed implementation plan, execute approved phases, test what you implement, and record objective evidence of completion. Make safe, reversible choices and keep progress traceable in Git. If approval is required for architecture changes, external credentials, destructive migrations, payment activation or production deployment, pause at that decision gate. Otherwise proceed with safe implementation steps instead of asking routine questions. Do not claim completion without tests.

**Non-negotiable priorities, in order:**
1. Truthfulness, user safety, legal/commercial readiness and data security.
2. Preserve SAFARIA's established brand, actual features and customer-facing content.
3. Real functional user journeys, persistence and operational reliability—not decorative demos.
4. High-converting, premium, mobile-first experiences with accessible Bangla/English copy.
5. Maintainable architecture, disciplined Git history, documentation and observability.
6. Progressive enhancement: integrate third-party providers only when real approved credentials and agreements exist.

**Do not:** rewrite the design into a generic agency template; create duplicate sections; remove working functionality without documenting its replacement; invent airfare, seat inventory, bookings, ticket numbers, PNRs, flight telemetry, customer records, supplier contracts, staff availability, regulatory approval, provider connectivity, refunds, price guarantees or testimonials; fake successful API calls; expose PII or credentials client-side; deploy live or charge real money without explicit authorization.

## 1. SOURCE DOCUMENTS AND PRECEDENCE

At project start, find and read **every line** of these authoritative inputs (they may be attached, copied into the workspace or placed in `/docs/source/`):

- `safaria_platform_master_application.md` — **despite its `.md` extension, this is a complete 2,386-line HTML document**, beginning `<!DOCTYPE html>`. Treat it as the live prototype/source of visual truth, not as Markdown. It uses React 18 + ReactDOM + Babel in the browser, Tailwind CDN, Three.js and `localStorage`.
- `safaria_master_technical_directive_and_implementation_document.md` — prior architecture proposal, feature intent, SQL draft and integration plan. It is a **specification**, NOT proof that features already work.
- `SAFARIA-Tours-&-Travels-B2B-Agency's-Pain-Points-&-Solutions.txt` (when available) — B2B research framework: 36 potential pain points, six proposed solution workstreams and a note that **business registration is pending**.
- Existing repository, Git history, images, brand assets, application configuration, source screenshots and any other supplied project files.

**Precedence rules:**
1. The user's explicit present instructions and verified business approvals override everything else.
2. Actual repository state and observed behavior determine WHAT HAS ALREADY BEEN IMPLEMENTED.
3. The prototype controls visual identity, existing content and user-flow preservation.
4. The technical directive controls the target stack and intended architecture, subject to security and correctness repairs.
5. The B2B research identifies product opportunities; it is not a verified promise to every agency.
6. Current official vendor documentation controls API syntax, supported frameworks and security guidance.
7. When sources conflict, document the conflict and propose the least-risk resolution; never silently assert unsupported facts.

**Required initial analysis artifacts:**
- `docs/audits/BASELINE_AUDIT.md` — what exists, what actually works, what is simulated, missing or risky, with file/line references.
- `docs/audits/SPEC_CONFLICTS_AND_DECISIONS.md` — conflicts, agreed defaults, approval blockers.
- `docs/REQUIREMENTS_TRACEABILITY.md` — every preserved/proposed feature with origin, owner, priority, implementation path, test and status.
- `docs/IMPLEMENTATION_PLAN.md` — dependency-ordered phases with acceptance gates.
- `docs/RISK_REGISTER.md` — severity, likelihood, mitigation and owner.
- `docs/FEATURE_READINESS_MATRIX.md` — statuses `NOT_STARTED`, `IN_PROGRESS`, `IMPLEMENTED`, `TESTED`, `BLOCKED`, `PRODUCTION_VERIFIED`.

## 2. VERIFIED BASELINE — DO NOT ACCEPT HISTORICAL 'COMPLETE' STATUS AT FACE VALUE

The supplied prototype has a strong visual foundation, but these are observed source-code facts to verify in the repository:

1. The app currently mounts a browser-bundled React tree into `#safaria-root`; there is no evidence of production Next.js server architecture in that file.
2. The Flight Enquiry form creates a reference number and saves records to `localStorage` (`safaria_enquiries_v2`). There are **no `fetch()` calls, no functioning backend route and no real Supabase persistence** in this source.
3. Flight form UI offers `ONE_WAY`, `ROUND_TRIP`, `MULTI_CITY`, but the `MULTI_CITY` choice does not render actual multiple flight legs.
4. B2B application creates an in-memory row and displays a success alert, but does not persist its record to the same `localStorage` or to a server. An application is not an activated trial.
5. The Admin Desk is accessible by a visible frontend modal control without genuine authentication/role authorization. Its PII must never remain publicly readable.
6. The 'Voyager AI' widget uses phrase-matching and timed predefined responses, **not a live LLM service**.
7. The 'Live Flight Tracker' honestly says the provider is pending, but the status-input button only shows a success `alert()`; no request is transmitted.
8. The Three.js globe auto-rotates. Full raycasting, route selection and camera-transition capabilities described in the technical guide are not implemented in the inspected prototype.
9. The source references `#sf-atlas` from navigation, while the actual `id="sf-atlas"` target is absent; repair anchor behavior.
10. The prototype includes 8 Atlas destinations, 33 directory destinations and 8 service cards. Keep all valid content while fixing incorrect mapping or airport labels.
11. Initial mock enquiry records and unverified marketing numbers (`100% verified`, `24/7`, etc.) appear in the prototype. Remove from production or replace with truthful, verified claims.
12. External CSS/JS CDN and browser-side Babel are acceptable for a prototype but unsuitable for the target optimized production build.
13. The old technical directive labels six phases `COMPLETE`. Its SQL/TypeScript snippets and `.env.example` are blueprints; most are not implemented in the prototype. Treat every historical claim as **unverified until inspected and tested**.
14. The reference SQL draft has permissive anonymous inserts and allows all `authenticated` users to read/update flight enquiries. **Do not deploy that security model.**
15. The prototype uses hardcoded dates, brand contact details and external artwork links. Replace hardcoded booking dates with valid dynamic defaults, and use centralized configuration for approved public data.

Record all additional findings, including broken CSS, missing alt text, source typos, inaccurate links, stale provider claims, incorrect foreign route assumptions, inaccessible modal behavior and responsive issues. Preserve legitimate code and content; remove only the risky or broken mechanics.

## 3. PRODUCT VISION AND BUSINESS MODEL

### Public B2C experience
A refined, trustworthy and fast site where users explore destinations, understand services, submit accurate flight quotation requests, request visa/corporate/hotel/tour support, receive a real reference number **only after confirmed server persistence**, and follow up by WhatsApp/email. **Quotation requests are NOT bookings and do NOT imply inventory availability.**

### B2B agency acquisition and operations
A differentiated partner acquisition funnel, eligibility verification, manual approval/trial activation, secure partner workspace and standardized workflow covering fare sourcing, request/booking coordination, finance reconciliation, after-sales support, supplier verification and partner growth.

The proposed six branded frameworks from the pain-point research are:
- **FareDesk** — fare requests, supplier quotations, comparisons, quote validity, reconfirmation.
- **BookingDesk** — IDs, request pipeline, ticket data validation, document/process records.
- **ClearMargin** — transparent fee/cost breakdown, verification and contribution calculations.
- **AfterCare Desk** — exchanges, changes, refunds, supplier follow-ups, escalation.
- **Verified Workflow** — supplier approval records, terms, evidence and secure access.
- **PartnerGrowth** — agencies, CRM activities, follow-ups and partner reporting.

**Distinguish product proposals from launched features.** Implement these as real internal workflow modules according to the phases below; show customer-facing claims only for features that have passed readiness gates.

### Business compliance boundary (critical)
The attached B2B strategy notes that SAFARIA registration is still pending. Until a responsible human verifies registration, relevant authorizations and supplier agreements:
- Public marketing and quotation-intake capability can be prepared subject to content/legal approval.
- Do not activate actual ticket issuance, paid deposits, transactional subscriptions, customer payments or guaranteed booking/visa outcomes.
- Admin can build and test approval, payment-verification and ticketing workflow **in a sandbox/staging mode**, but real-money execution/issuance remains disabled behind server-side feature flags.
- The website must clearly describe coordination/enquiry status rather than impersonating a licensed live inventory vendor.

### Commercial offer fidelity
The previous source proposes **৳20,000/month**, **৳130,000/year**, a **72-hour trial** and **0% SAFARIA markup on eligible net fares**, subject to written terms. Treat these as **draft commercial terms awaiting owner approval and supplier/legal verification**. Create a centralized `commercialConfig` with review/status flags and dates. Avoid implying trials activate automatically, 0% total fare, guaranteed lowest prices or unlimited ticketing rights. Preserve draft values internally and make publishability explicit. Annual comparison to twelve monthly payments is `৳240,000 − ৳130,000 = ৳110,000` if both prices are approved; do not portray it as a universal discount otherwise.

## 4. TARGET TECHNICAL ARCHITECTURE

Use or migrate to this stack **after repository audit**:
- **Frontend:** Current stable, supported Next.js App Router, React, strict TypeScript, Tailwind CSS as a compiled dependency, CSS custom properties/tokens. Choose supported versions from official package/documentation and lockfile; do not assume stale versions from old examples.
- **UI:** Reusable typed design-system components, responsive CSS, no browser-side Babel, proper `next/image`/font optimization where appropriate.
- **3D:** Three.js with lazy loading, supported React integration if warranted, SVG fallback, reduced-motion handling, WebGL loss handling and cleanup.
- **Forms:** React Hook Form or equally robust typed form state, Zod shared server/client validation, country-aware phone validation, accessible errors.
- **Database:** Supabase PostgreSQL with versioned, rollback-conscious SQL migrations, storage only if needed, Supabase Auth if suitable; **server-mediated public form writes**.
- **Backend:** Next.js Route Handlers/server functions for all privileged activity; no frontend secrets, no direct public admin queries.
- **CRM:** GoHighLevel/HighLevel API adapter on the server with proper location token scopes, idempotent upserts and webhook/outbox queue.
- **Notifications:** Approved transactional email service and WhatsApp deep links as reliable initial fallback. Use WhatsApp API only after authorization.
- **AI:** Server-side provider abstraction, constrained travel assistant with verified source data and graceful fallback.
- **Monitoring:** Structured logs (redacted), error reporting, health checks, queue visibility, backups and release diagnostics.
- **Testing:** Unit/integration tests, API/security tests, Playwright end-to-end, accessibility and visual regression where practical.
- **Deployment:** Target hosting proven compatible with chosen Next.js server features and Supabase configuration; document Vercel/alternative tradeoffs. Existing GHL funnel/site-builder pages can link to or embed safe segments where supported, but **do not force the entire authenticated application into a single GHL custom HTML block**.

Suggested app structure (adapt to preexisting good architecture rather than unnecessarily rebuilding):

```text
app/
  page.tsx                       # canonical Bengali homepage at /
  en/page.tsx                    # English homepage at /en
  [locale]/services|destinations|agency|corporate|visa/...
  (portal)/partner/...           # protected partner workspace, if ready
  (ops)/admin/...                # protected admin/ops application
  api/enquiries/route.ts
  api/agency/route.ts
  api/ai-assistant/route.ts
  api/flight-status/route.ts
  api/integrations/...           # guarded callbacks/webhooks
  sitemap.ts, robots.ts, not-found.tsx
components/
  brand/, navigation/, hero/, atlas/, destinations/, services/
  forms/, b2b/, operations/, ai/, layout/, ui/
lib/
  config/, auth/, validations/, db/, crm/, workflows/
  suppliers/, notifications/, security/, analytics/
features/
  enquiries/, partner-onboarding/, fares/, bookings/
  finance/, aftercare/, suppliers/, partner-growth/
supabase/migrations/
tests/unit/, tests/integration/, tests/e2e/
public/brand/, public/images/
docs/audits/, docs/operations/, docs/releases/
```

**Routing rule:** Keep `https://safaria.vibing.world` canonical for Bengali homepage, make English independently indexable at `/en`, implement correct canonical/hreflang per page, and permanently redirect legacy `/tours-and-travels` without duplicate indexing. Official Next.js redirects commonly return **308 permanent**; do not claim exact HTTP 301 unless the chosen hosting/proxy explicitly provides it. Restrict `/admin` and `/partner` with **server-side authorization** and noindex.

**No unnecessary microservices.** Begin with a coherent modular monolith and adapter boundaries. Use a proper background/queued process for durable asynchronous side effects if needed, rather than pretending an in-process timeout is reliable.

## 5. BRAND, VISUAL DESIGN AND USER EXPERIENCE — PRESERVE THE SIGNATURE

Design personality: **premium international aviation, understated luxury, deep emerald, midnight navy, warm gold, muted ivory**. This must feel like a trustworthy modern travel-tech product, not a generic travel flyer or startup admin template.

### Source design tokens
- Emerald `#064E3B`
- Deep emerald `#041713`, `#0A302D`, `#17584D`
- Navy `#10243A`, `#0A1726`
- Warm gold `#D6B779`, `#CFB57C`, `#F4D38D`
- Ivory `#F8F5EC`, `#EFECE2`; sand `#DFD9C9`
- Bengali: **Hind Siliguri**; English UI: **Manrope**; premium display accent: **Playfair Display**, applied sparingly.

Retain the identity and established Bengali hero headline **“সঠিক ফ্লাইটে শুরু হোক যাত্রা।”**, 8-route Journey Atlas, signature gradients, elegant card treatments, and existing 8 service categories. Use authentic/properly licensed imagery, crop control, optimized local assets and purposeful iconography. Replace any fabricated brand logo or unsupported external asset only with the verified actual asset or a documented temporary placeholder.

### User-facing sections (preserve and refine)
1. Navigation, logo/wordmark, language switch, prominent quotation CTA.
2. Hero with accurate benefits and interactive Journey Atlas.
3. Eight service types: domestic flight, international flight, group flight, corporate, visa documentation, hotel assistance, tour packages, B2B agency support.
4. Searchable destination grid with region filters and destination-to-quote prefill.
5. Travel Studio multi-mode quotation form and real submission confirmation.
6. B2B benefits, price-plan comparison if approved, trial/application funnel, terms and FAQs.
7. Corporate travel and visa desk entry points with functional forms/WhatsApp fallback.
8. Verified flight-status enquiry or provider-backed flight-status component; no fake live radar.
9. ViBE Trippin' ecosystem section and Just Another Travel Group linkage (verify actual URL/relationship before public activation).
10. Voyager AI concierge, truthful capabilities and smooth handoff.
11. Footer with real approved contact details, policies, disclaimers and legal pages.

### Interaction standards
- Mobile-first widths: 320px, 375px, 390px, 768px, 1024px, 1440px and above; no accidental horizontal scrolling.
- Accessible nav and dialogs: keyboard focus, Escape to close, focus trap/return, `aria` labels, no background scroll while modal open.
- One primary CTA per viewport; use effective but restrained motion, crisp typography and clear spacing.
- Skeleton/loading/empty/error/retry/confirmation states for all real async actions.
- Bangla first with complete English parity. Do not leave half-translated tabs, validation errors or support notices.
- Respect `prefers-reduced-motion`, low-power devices, poor bandwidth, no-WebGL and JavaScript degradation where possible.
- Distinguish informational routes from real supplier-confirmed flights; no simulated availability/pricing.
- Use semantic SEO markup, avoid broken anchors and duplicate interactive controls.

## 6. FLIGHT QUOTATION ENGINE — PRODUCTION JOURNEY

Implement a real Flight Enquiry/Quotation workflow with the following contract:

**Inputs:** trip type (`ONE_WAY`, `ROUND_TRIP`, `MULTI_CITY`), 1–6 flight legs as appropriate, origin IATA airport code, destination IATA airport code, departure date, optional return date, adults, children, infants, cabin, preferred carrier, lead name, country-aware WhatsApp/phone, optional email, special instructions, explicit privacy/contact consent. Preserve form progress between UI steps without storing sensitive personal information needlessly.

**Correctness:**
- `ONE_WAY`: one leg, no return date.
- `ROUND_TRIP`: one outbound leg plus a return date not earlier than departure.
- `MULTI_CITY`: at least 2 independently editable legs and up to a documented maximum (recommended 6); enforce valid sequencing and airport selection.
- Prevent origin=destination on any leg, missing dates, past dates in `Asia/Dhaka`, negatives, bad phone/email formats, impossible traveller mixes (including infants exceeding adults), duplicate requests and empty consent.
- Source of truth for destination codes: verified airport-level IATA data. Current `LON` is a **metro/city code** used by an Atlas shortcut, not an individual flight-origin/destination airport; resolve to specific airports during input. Correct other airport/city naming mismatches (e.g. Tokyo HND vs NRT, New York JFK vs EWR).
- Dynamic defaults; no hardcoded November 2026 travel dates in production.
- Server and client enforce matching Zod rules; server performs its own final validation.
- API must return success only after a durable database transaction commits, with a collision-resistant server-generated reference such as `SFR-YYYYMMDD-<secure suffix>` and a database uniqueness constraint.
- Duplicate prevention/idempotency for retries and double-clicks. Disable button while submitting, show specific errors, never pretend a request succeeded when it failed.
- Optional WhatsApp handoff includes the existing reference; WhatsApp itself must not be the only record of the enquiry.
- Store immutable submission details plus audit trail, privacy consent version, sanitized sources/UTM data and status timestamps.
- Do not automatically accept payment, promise fare availability or issue tickets.

**Status model:** `NEW -> QUALIFYING -> SOURCING -> QUOTATION_READY -> QUOTATION_SENT -> CUSTOMER_CONTACTED -> CONVERTED` with appropriate `EXPIRED`, `CANCELLED`, `CLOSED_UNFULFILLED` terminal states. Enforce permitted transitions by role. Consider separate quote, booking and case status models to avoid conflating distinct business events.

**Admin functionality:** inbox view, filters, search, ownership, priority, notes, service type, SLA/next-action, communication log, request detail, status history, export with RBAC, and role-specific metrics.

## 7. B2B PARTNERSHIP AND SIX SERVICE-DESK MODULES

### A. B2B application and onboarding
Replace the existing modal-only illusion of submission with a genuine multi-step, accessible funnel: agency details -> contact details -> location/license/IATA status -> interested plan -> consent/terms -> server submission -> reference ID -> pending verification. Require manual review, business identity checks, supplier/settlement agreement verification, and explicit authorized activation of any trial. If registration is pending, default eligibility/issuance flags to `disabled`.

**Important:** Do NOT activate 72-hour trial just because a user clicks Apply. A trial can begin only when staff approves it and records a valid activation timestamp. Expose countdown only for approved active trials.

### B. Secure partner workspace
Build login and role-controlled access for approved partner agency users, designed to be usable even before live issuer integration. Scope all data to a specific `agency_id` server-side **and in RLS policies**. Partners may submit fare requests, view their own requests, review issued quotations, upload only permitted documents to private storage, track follow-ups and raise AfterCare cases. They must not see other agencies' records, supplier margin data or internal notes. Include invited user flow, password reset/MFA options, session expiry and audit history. Route-gate unavailable services with clear copy, not fake functionality.

### C. FareDesk
Normalized supplier requests/quotes with fare source, currency, base fare, taxes, supplier fees, SAFARIA fee, baggage, transit, change/refund conditions, quote expiry, last-confirmed timestamp and approval. Comparison UI shows differences without implying live inventory. Reconfirm before any proposed ticket issuance. Respect provider agreements.

### D. BookingDesk
Work queue and status-driven request-to-ticket workflow, passenger detail checks, supplier booking records, issuance checklist, attachments and evidence. **No fake PNR**. Ticket-issuance action must be unavailable until verified authorization, provider/contract, settlement and human approval exist. For sandbox tests, clearly tag simulated test records as test-only and isolate them from real customer data.

### E. ClearMargin
Booking-level money-in/money-out and contribution ledger with configurable BDT and foreign currency fields, exchange rate provenance, document references, tax/fee breakdown, supplier payable, customer receivable, verified/awaiting payment state and reconciliation. Use precise decimal arithmetic (not JS floating-point for money). Immutable ledger/audit records, reversals instead of silent edits. Financial acceptance/settlement is a restricted internal workflow, **not a live payment gateway** unless separately approved.

### F. AfterCare Desk
Issue/reference ID, change request, refund request, complaint, case notes, related booking, supplier communications, owner, due dates, milestones, expected vs confirmed amounts, SLA and escalation. Supplier or airline decides refund eligibility/timing; never show fabricated guaranteed refund time.

### G. Verified Workflow
Supplier registry, eligibility/contract evidence, validity dates, risk flags, contact channels, checklist templates, responsibilities and approval trail. Private documents, restricted scopes, retention schedules and tamper-evident metadata; don't accept passport copies before secure authorized intake is configured.

### H. PartnerGrowth
Agencies, contacts, lifecycle, lead source, follow-up tasks, renewal interest, activity log and understandable reporting: new applications, approval rate, quote response time, quote-to-conversion when verifiable, unresolved after-sales cases, contribution by agency after reconciliation. No invented metrics; explicit definitions and date ranges.

## 8. DATABASE, AUTH, RLS AND SECURITY REQUIREMENTS

Use Postgres migrations with consistent naming and clear indexes, foreign keys, checks and deletion/retention strategy. Derive schema from actual domains rather than copy-pasting the old SQL unchanged. Core entities will likely include:

`users`, `profiles`, `organizations`, `organization_memberships`, `roles/permissions`, `agency_applications`, `flight_enquiries`, `flight_legs`, `general_enquiries`, `quotes`, `quote_options`, `suppliers`, `supplier_documents`, `bookings`, `settlement_transactions`, `ledger_entries`, `aftercare_cases`, `case_events`, `tasks`, `communications`, `notification_outbox`, `integration_events`, `idempotency_keys`, `audit_logs`, `consent_records`, `feature_flags`.

Use relationships with UUIDs and separate user-visible references. Add only the tables justified by implemented workflows; version every schema change and provide seed data strictly for local/staging, not production. Separate real data from demo/test tenants.

**Security invariants:**
- Never expose Supabase secret/service-role keys, GHL tokens or LLM keys to browser bundles, repository or public logs.
- Use the official current Supabase guidance for `anon`, `authenticated` grants and RLS. The old `USING (true)` rule for all authenticated admin reads is not acceptable. `TO authenticated` alone is **not authorization**. Tenant access must use verified organization membership/ownership, robust `USING` and `WITH CHECK` conditions, and least-privilege grants. Never trust editable `user_metadata` for authorization; verify server-controlled role claims or database memberships. Protect security-definer functions and views against unintended RLS bypass.
- Admin access requires explicit role/authorization checks; partner row access requires organization-membership filtering and matching RLS.
- Prefer public form writes through secured server routes with Zod validation, bot protection, rate limiting, sensible length limits and idempotency; do not allow arbitrary anonymous direct DB insertion.
- Use CSRF protection where applicable, origin checks, CORS restrictions, safe cookies, secure session handling, auth event logs, input sanitization and output encoding.
- Never trust a client-supplied role, account ID, price, approval state, payment state, supplier permission or settlement flag.
- Minimize PII. Do not record passports, raw payment credentials or full lead payloads in error logs/analytics. Apply privacy/access/retention policies and consent handling appropriate to deployment jurisdictions.
- Secure document storage with private buckets, file-type/size scanning/validation and short-lived signed URLs.
- Protect sensitive exports and audit export actions. Redact secrets and PII from monitoring.
- Provide server-side feature flags for `flight_issuance_enabled`, `payment_collection_enabled`, `b2b_trial_activation_enabled`, `supplier_live_search_enabled`, `aircraft_tracking_enabled`, and `voyager_llm_enabled`, default OFF until all dependencies are approved and tested.
- Add backups and documented restore procedure; do not claim disaster recovery tested until a restore test passes.

## 9. GOHIGHLEVEL CRM, EMAIL AND MESSAGING

GoHighLevel is SAFARIA's CRM/automation layer, not the primary database of record. Implement the adapter on the server:

1. Inspect current HighLevel official docs, authentication/scope requirements and Custom Fields v2 API before writing requests.
2. Map valid contact/agency fields, source, tags and approved custom-field IDs; avoid incorrect assumptions that field display names can be supplied as IDs.
3. Use contact upsert or find-then-update according to documented availability, conflict handling and rate limits.
4. Avoid duplicate contacts/opportunities by recording provider IDs and using application-level idempotency.
5. Persist the SAFARIA enquiry transaction **first**; enqueue outbound CRM sync as a retryable side effect. When provider sync fails, retain lead data and show an internal failure/retry state rather than telling the visitor that a successful submission failed.
6. Use exponential backoff, bounded retries and a dead-letter/manual-replay pathway. Log correlation ID, provider response status and sanitized error, never raw tokens or full sensitive payloads.
7. Proposed pipelines: `B2C Flight Enquiries`, `B2B Agency Onboarding`, `Corporate`, `Visa/Other`, `AfterCare`. Create only after checking existing pipelines to avoid duplicates.
8. Proposed workflow triggers: new lead, staff assignment, quote requested, quote delivered, action overdue, pending partner verification, approved trial expiration, refund case update. Ensure consent and outbound messaging policy compliance.
9. Incoming GHL webhooks must authenticate/signature-verify where supported and be idempotent; prevent circular sync loops.
10. Make integrations replaceable: clearly typed interfaces and stub/test adapters for CI.

Public WhatsApp and contact settings from the prototype **require owner verification before launch**: `+8801674178437`, `safariatoursandtravels@gmail.com`, Dhaka, Bangladesh. Store in approved centralized config. All links must use safe `wa.me` encoding and correct destinations. If notification credentials are absent, implement a clear manual work queue; no phantom emails/texts.

## 10. VOYAGER AI — USEFUL, GROUNDED AND SAFE

Replace the current keyword-response demonstration with a properly delimited assistant service:

- Friendly Bengali-first / English-aware chat for destinations, enquiry collection, document/checklist guidance and B2B programme explanations.
- LLM behind a **server-side** provider interface, versioned prompt and schema-controlled tool actions.
- Ground answers in approved SAFARIA service knowledge and destination data, not unverified real-time fares or inventory.
- Detect unsupported requests and route to a human; never guarantee visa approval, tickets, seats, flight times, regulations or refund outcomes.
- Extract structured enquiry intent with explicit user confirmation before posting forms; prevent prompt injection from external content affecting credentials or privileged actions.
- Protect abuse budgets: input limit, per-IP/session throttling, maximum turns, cost and latency controls, safe output and consent.
- Clearly label the experience: assistant/automated guide; do not imply a human is responding.
- Absent valid provider credentials: the chat must enter a transparent **guided assistant mode** (or show unavailable), not pretend that scripted responses are live AI.
- AI should never directly approve agencies, modify settlement ledger, send tickets or trigger payments.

## 11. AIRPORT DATA, 3D GLOBE, FLIGHT STATUS AND SUPPLIERS

### Journey Atlas
Preserve the source SVG geometry and the following 8 destination shortcuts: `RUH`, `JED`, `CXB`, `KUL`, `SIN`, `DXB`, `CAN`, `LON`. Repair touch/keyboard support, route hover/selection, route highlighting and prefill. Treat the globe as an illustrative **journey atlas**, not proof of operating flight routes. Use a proper Three.js scene lifecycle: resize observer, renderer and geometry/material disposal, pause offscreen, WebGL recovery, raycasting/pin interaction only if correctly implemented, reduced motion and an always-usable SVG alternative. Avoid excessive bundle size and high battery consumption.

### Destination directory
Audit and preserve the 33-directory entries as initial seed data; correct inaccurate city/airport descriptions. Do not mistake a metro code for a single airport or imply every pair has a direct service. Keep IATA data typed and traceable to a source/verification date. Allow safe future CMS/data updates.

### Flight status/radar
Until a properly licensed supplier API is connected, show **“Live tracking currently unavailable / request verification”** and route real status inquiries to a persisted staff work queue. A button that only displays an alert is not a successful request. If provider credentials are approved, implement a server proxy with clear API provenance, timestamps, provider terms, quotas, caching and stale-data indicators. No simulated radar aircraft presented as real.

### Fare/booking suppliers
Build provider adapters with capability declarations (`search`, `reprice`, `hold`, `book`, `issue`, `refund`, etc.). Keep unauthorized capabilities OFF. Never claim Amadeus, Sabre, Duffel or an airline supports a specific transaction for SAFARIA until account permissions and commercial terms are confirmed. Separate provider sandbox from live; require reprice and written authorization gates.

## 12. SEO, ACCESSIBILITY, PERFORMANCE, ANALYTICS AND TRUST

- Primary domain canonical `https://safaria.vibing.world`, proper legacy redirect, correct hreflang (`bn-BD`, `en`), self-canonical URLs and unique metadata per page.
- SSR/SSG for public content, server-rendered indexable destination/service pages where justified, localized title/description, sitemap, robots, valid OG image and JSON-LD `TravelAgency` only with approved factual fields.
- Strict `noindex` for admin, partner portal, private records and preview environments. Do not leak quotation PII into link previews or analytics.
- Show approved business identity/contact details, privacy policy, terms, cancellation/refund/quotation disclaimer, response expectations and a consent mechanism. Regulatory/registration details must be verified before publication; no fabricated registration or accreditation badges.
- Define event analytics: page, CTA, form start, validation error, form submit success, agency apply, qualified enquiry. Use consent-aware analytics and no raw phone/passport/email in events.
- WCAG 2.2 AA target: semantic labels, focus states, contrasts, keyboard accessibility, screen readers, motion alternatives and error announcements.
- Performance targets to validate in production/representative field data: LCP <= 2.5s, CLS <= 0.1, INP <= 200ms at p75 where measurable. Keep 3D an optional enhancement, not a blocker to first content.
- Implement lightweight anti-spam and sensible SEO/internal linking without stuffing generic travel keywords.

## 13. COMPLETE VALIDATION AND TESTING REQUIREMENTS

**Required tests**, run rather than merely list:

### Static and build
- Clean dependency installation, TypeScript check, ESLint, formatting, production build, no hardcoded secrets, no unreviewed vulnerabilities.
- Verify imports, route links, images/assets, translations, schema migration consistency and server-only boundaries.

### Domain logic
- One-way, round-trip and multi-city leg validation (including malformed past dates, wrong airport codes, duplicate legs, infant/adult rules, missing consent).
- Reference uniqueness and safe idempotent retries; persistent DB commit before success response.
- B2B trial is pending before staff approval; time window starts from approved timestamp, not application submission.
- Quote expiry/reconfirmation, change/refund case statuses, monetary decimal math, permissions and audit log completeness.

### Security
- Anonymous users cannot list enquiries, guess private records, access admin pages or trigger supplier/payment functions.
- Partner A cannot read/update Partner B's requests, documents or billing records even with crafted API requests.
- Signed-out/form abuse, input injection, direct DB permissions, server tokens, CSRF/origin, webhook replay and duplicate notifications.

### Integration
- GHL success, 429, timeout, malformed response, missing credentials, eventual retry and idempotency; test against mock adapters until approved sandbox available.
- Email/WhatsApp unavailability; no false success notices.
- AI unknown fares or visa outcomes; provider-off fallback; cost/abuse constraints.
- Tracking provider-off fallback must be honest and functional.

### Browser/e2e
- Use Playwright and Antigravity's browser tooling where available: Chrome console/network plus actual form interactions, modal keyboard navigation, filters, responsive layouts and locale switching.
- Screenshots for desktop (1440px), tablet (768px) and mobile (390px), including hero, forms, B2B and admin, before/after visual comparison.
- Broken anchor `#sf-atlas`, all CTA links, destination prefill, modal close/restore, error/retry/success states, no horizontal overflow.
- Run accessibility checks (e.g. axe) with manual keyboard/screen-reader spot checks.

**Evidence standard:** Every significant feature is reported as `IMPLEMENTED` only when code exists; `TESTED` only when named tests ran; `PRODUCTION_VERIFIED` only after approved live checks. Collect commands, results, screenshots and outstanding blockers in a walkthrough. Do not declare 100% production-ready while secrets, approvals, integrations or critical tests are missing.

## 14. DEPENDENCY-ORDERED IMPLEMENTATION PHASES AND GATES

### Phase 0 — Repo preservation and forensic audit (P0)
- Inspect repository structure/branches, dependencies, existing HTML and screenshots.
- `git status` then safe checkpoint branch `feat/safaria-production-foundation`; do not overwrite or delete uncommitted user work. If dirty, document state and seek approval before destructive Git changes.
- Document baseline audit, feature matrix, acceptance criteria, credential/approval blockers and proposed migration strategy.
- Present Antigravity implementation-plan artifact. Follow the platform's Plan Review Policy. **Do not execute irreversible/deploy changes before approval.**

**Gate:** plan ties every original section and intended functionality to implementation tasks and tests.

### Phase 1 — Stable application foundation and premium frontend (P0)
- Scaffold/migrate Next.js + TS + Tailwind with maintainable components and preservation of 8 services, 33 destination entries, 8-route atlas, bilingual content and brand palette.
- Fix route anchors, city/airport mismatches, modal accessibility, responsive layout, dynamic date inputs, SEO structure and 3D fallback.
- Create centralized typed config and translate UI consistently.

**Gate:** production build passes; public website behaves on mobile/desktop; visual screenshots are reviewed against baseline.

### Phase 2 — Real enquiry operations and administrative security (P0)
- Auth/role implementation, secured database migrations, enquiry API, real form persistence, unique server reference, validation, status updates and admin inbox.
- Real B2B application capture, status `PENDING_VERIFICATION`, manual approval controls. All transactional actions off by default.
- Correlated audit logs, rate limiting, bot controls, privacy consent and admin record filtering.

**Gate:** database-backed submissions survive a different browser/session; forged admin access and cross-account data access fail.

### Phase 3 — CRM, notifications, operational triage (P0)
- GHL adapter, outbox worker/retry, mapping, queue visibility and manual fallback.
- Internal operations workflow with lead assignment, notes, task due dates, notifications or manual work queue and status-driven follow-ups.
- Corporate/visa/flight-status requests actually persist or hand off transparently.

**Gate:** one lead arrives exactly once in the DB, enters CRM when credentials available, and is not lost if CRM is down.

### Phase 4 — B2B workspaces and six desk workflows (P1)
- Approved partner login and isolation, FareDesk, BookingDesk, AfterCare and Verified Workflow first.
- ClearMargin with audit-safe internal ledger; PartnerGrowth activity and real aggregation.
- Explicit approval flags and role-gated user experiences; no fake transactions.

**Gate:** role-isolation tests, sample workflow lifecycle, financial reconciliation and after-sales traceability pass in staging.

### Phase 5 — Advanced integrations and intelligence (P1/P2, credential-gated)
- Provider-backed Voyager AI with grounded responses, live flight status only if licensed, fare provider adapters/sandbox only if authorized.
- Improve globe interaction, animations and nonessential experience details after performance budgets are satisfied.
- Add any payment or issuer capabilities **only after independent business, supplier and security approvals**.

**Gate:** each adapter provides its own real integration test, fallback behavior, legal/operational approval and cutover checklist.

### Phase 6 — Release hardening and launch readiness (P0)
- CI, QA gates, observability, backups, rollback runbook, environment separation, domain/canonical SSL, tests, accessibility, analytics and SEO audit.
- Stage release with actual approved settings. Prepare production release candidate, document remaining blockers.
- **Request user approval before production deployment, domain DNS changes, live payment/ticketing activation or any irreversible operations.**

**Gate:** separate Go/No-Go review with factual readiness and compliance checklist.

## 15. DELIVERABLES AND REPOSITORY HANDOFF

In addition to working code, create/update:

- `README.md`: local setup, stack versions, commands and architecture overview.
- `.env.example`: **placeholders only**, names and purpose; never real secrets.
- `docs/ARCHITECTURE.md`, `docs/INTEGRATIONS.md`, `docs/DATABASE.md`, `docs/SECURITY.md`.
- `docs/OPERATIONS_RUNBOOK.md`, `docs/DEPLOYMENT_GUIDE.md`, `docs/BUSINESS_APPROVALS.md`.
- `docs/REQUIREMENTS_TRACEABILITY.md`, `docs/FEATURE_READINESS_MATRIX.md`.
- `docs/QA_TEST_REPORT.md`, `docs/RELEASE_CHECKLIST.md` and screenshots/recordings from verification.
- Migration files, unit/integration/e2e test suites and deterministic demo seed fixture files.
- Concise `docs/CHANGELOG.md` with phase commits and no secrets.
- `AGENTS.md` in the repository root encoding the invariant project rules.

### Git rules
- Never force push, delete branches, rewrite history or alter remote deployment without user permission.
- Make focused commits with meaningful messages after passing appropriate tests; do not automatically push to remote or open a PR without user direction.
- Preserve all source assets and document migrations/removals. Never commit real credentials, passport data, test customer PII or generated production secrets.
- Record commands/results and any skipped tests honestly.

### Required progress report after each phase
Provide a short factual status in this template:

```text
PHASE: <number and name>
FILES CHANGED: <paths>
WHAT NOW WORKS: <verified behaviors>
TESTS EXECUTED: <commands and passing/failing counts>
VISUAL EVIDENCE: <screenshots/recording paths>
SECURITY/CROSS-ACCOUNT CHECKS: <results>
BLOCKERS: <credentials/approvals/missing specs>
NEXT PHASE: <specific tasks>
GIT STATE: <branch, commit, uncommitted changes>
READINESS: <implemented/tested/blocked—not speculative>
```

## 16. PRODUCTION DECISION AND QUALITY BAR

Public launch must not be declared safe until:

- All enabled public actions persist legitimate records and fail transparently.
- Admin is authenticated and role-restricted; B2B tenant isolation tested.
- CRM/emails either work under approved credentials or have an honest manual fallback.
- No fabricated fare/flight/booking/trial/provider functionality exists.
- Content and commercial claims are approved, registration/permission boundaries respected.
- Brand/content preservation checked against the original 2,386-line HTML prototype.
- Required build, security, localization, accessibility and browser tests pass.
- Environment secrets, monitoring, backup and rollback strategy are established.
- A human authorizes production deployment and separate transactional feature activation.

**The minimum viable public launch is a fully functional, secure B2C enquiry and B2B application-intake platform—not pretend real-time ticketing.** Enable deeper B2B operations progressively. It is better to launch a trustworthy enquiry product than a visually complete interface which falsely claims unavailable functions.

## 17. EXACT INSTRUCTIONS FOR YOUR FIRST ANTIGRAVITY RESPONSE

Start by **reading the files and inspecting Git/repository state**, not by producing UI mockups. Then:

1. Produce the baseline forensic findings with concrete file references, not generic observations.
2. Identify all deviations between the implementation and the earlier `COMPLETE` milestone claims.
3. Publish a prioritized P0/P1/P2 implementation plan with dependencies, risks, approval gates, file changes and tests.
4. Set up the persistent repository `AGENTS.md` and the feature/readiness matrix after plan approval.
5. Start Phase 0 and Phase 1 implementation as soon as the approval policy permits. Continue through safe phases without unnecessary interruptions.
6. Run real commands and tests, fix failures and attach evidence. No 'finished' claim for missing credentials or blocked commercial functions.
7. Summarize exactly what is now implemented and what must wait for an external approval.

**Final governing instruction:** Be uncompromising about craft, correctness, conversion, security and honest operational claims. Build the real SAFARIA platform from its current source, preserve its distinctive brand and functionality, and make every phase independently reviewable, testable and releaseable.
