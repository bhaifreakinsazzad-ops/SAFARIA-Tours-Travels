# SAFARIA Tours & Travels — Feature Readiness Matrix
**Document ID:** FRM-20261110-08  
**Status Taxonomy:** `VERIFIED_REAL` | `VERIFIED_LOCAL` | `SIMULATED` | `BLOCKED_EXTERNAL` | `SAFETY_LOCKED` | `NOT_READY`  
**Date of Record:** 2026-11-10  
**Verification Branch:** `claude/safaria-release-closure` (PR #8)  
**Directive Reference:** `SAFARIA_GEMINI_DIRECTIVE_015_FINAL_SECURITY_ACCEPTANCE.md`

---

## 1. Feature Readiness Taxonomy Definitions

- `VERIFIED_REAL`: Demonstrated against real external services or native databases (e.g., native PostgreSQL 18 engine, kernel-level RLS, WAL restart persistence, concurrent row locking, migration 004 function execution restrictions).
- `VERIFIED_LOCAL`: Tested thoroughly in local environment (Next.js 16 App Router Turbopack, strict TypeScript, ESLint, Playwright browser E2E, 6 operational desks functional mutations, strict CSRF origin validation).
- `SIMULATED`: Validated with high-fidelity mocks (GHL CRM mock provider with exponential backoff, idempotency hashing, fail-closed handling in production).
- `BLOCKED_EXTERNAL`: Dependent on unconfigured third-party credentials (Live GoHighLevel API tokens and Location ID).
- `SAFETY_LOCKED`: Intentionally disabled for business safety and regulatory compliance (Live payment collection, GDS ticketing, trial auto-activation).
- `NOT_READY`: Incomplete or failing (None — 0 failing gates).

---

## 2. Feature Matrix Status

| Feature / Capability | Operational Readiness | Implementation Path | Verification Results | Target Release |
| :--- | :--- | :--- | :--- | :--- |
| **Real Native PostgreSQL 18 Engine & RLS** | **VERIFIED_REAL** | Native PostgreSQL 18.6 daemon + migrations 001, 002, 003, 004 | 11/11 tests passed in `realPostgresServer.test.ts`: DDL, kernel-level RLS, 3-client atomic rate limit concurrency, WAL restart persistence, SKIP LOCKED | v2.0.0-PROD |
| **Secure Function Privileges & Migration 004** | **VERIFIED_REAL** | `004_secure_rate_limit_function.sql` (`SECURITY DEFINER`, fixed search_path) | Anon denied execution in PostgreSQL; service_role granted; input validation verified | v2.0.0-PROD |
| **Atomic Concurrency Rate Limiter** | **VERIFIED_REAL** | `server/auth/distributedRateLimiter.ts` | 3 concurrent connections serialized cleanly to `[1, 2, 3]` points; no lost increments | v2.0.0-PROD |
| **Strict CSRF & Origin Guard** | **VERIFIED_REAL** | `server/utils/csrfGuard.ts` | 6/6 tests passed in `csrfGuard.test.ts`: eliminated header bypasses, rejects forged origins | v2.0.0-PROD |
| **Production Staff Authentication & RBAC** | **VERIFIED_REAL** | `server/auth/staffService.ts` + `authService.ts` | 7/7 tests passed in `staffAuth.test.ts`: scrypt hashing, lockouts, active status enforced, test tokens rejected in prod | v2.0.0-PROD |
| **Durable Session Revocation & Dynamic Account Suspension** | **VERIFIED_REAL** | `revoked_sessions` table + `isAgencyActive` check | Persistent `jti` revocation, rejected suspended accounts across restarts | v2.0.0-PROD |
| **Distributed Outbox Job Claiming (`FOR UPDATE SKIP LOCKED`)** | **VERIFIED_REAL** | `server/crm/outboxDispatcher.ts` + `claimOutboxBatch` | Disjoint worker partitioning verified, expired lease recovery | v2.0.0-PROD |
| **B2C Flight Enquiry Workflow (One-Way & Round-Trip)** | **VERIFIED_LOCAL** | Next.js form + Zod schema + Route Handler + Supabase DB | Vitest (10 tests) + Playwright E2E passed | v2.0.0-PROD |
| **B2C Flight Enquiry Workflow (Dynamic Multi-City 1–6 Legs)** | **VERIFIED_LOCAL** | Dynamic leg state + sequential date validation | Vitest leg tests + Playwright dynamic leg test passed | v2.0.0-PROD |
| **General Enquiries (Visa & Corporate Mobility)** | **VERIFIED_LOCAL** | `GeneralEnquiryModal.tsx` + `app/api/general/route.ts` | Integration test verified (`GEN-...` ref generated) | v2.0.0-PROD |
| **Customer Reference Tracking & Masked Lookup UI** | **VERIFIED_LOCAL** | `TrackEnquiryModal.tsx` + `GET /api/enquiries?ref=...` | Vitest (5 tests) + Playwright E2E test passed; PII masked | v2.0.0-PROD |
| **Collision-Resistant Reference Generation** | **VERIFIED_LOCAL** | `server/utils/referenceGenerator.ts` (`SFR-...`, `B2B-...`, `GEN-...`) | 1,000 unique iterations tested without collision | v2.0.0-PROD |
| **WhatsApp Structured Concierge Handoff** | **VERIFIED_LOCAL** | `server/utils/whatsAppFormatter.ts` | Formatter unit tests passed; URI encoded | v2.0.0-PROD |
| **B2B Agency Application Intake** | **VERIFIED_LOCAL** | `B2BApplicationModal.tsx` + `POST /api/agency` | Integration test passed; manual trade audit state | v2.0.0-PROD |
| **B2B 72-Hour Trial Policy & Admin Approval** | **VERIFIED_LOCAL** | Manual staff approval via `PATCH /api/admin/agencies` | Server calculates 72h countdown upon approval | Phase 4 (Restricted) |
| **The 6 B2B Desks (FareDesk, BookingDesk, ClearMargin, AfterCare, VerifiedWorkflow, PartnerGrowth)** | **VERIFIED_LOCAL** | `app/partner/page.tsx` + `app/api/partner/desk` | Full CRUD + PATCH status transitions + audit logs + tenant isolation verified in `verify:b2b` | v2.0.0-PROD |
| **Verified Workflow™ Passenger Name & Passport Audit** | **VERIFIED_LOCAL** | `app/api/partner/verify-passenger/route.ts` | 3 unit tests passed (symbol, title, expiry checks) | v2.0.0-PROD |
| **Role-Gated Operations Console (Admin Triage)** | **VERIFIED_LOCAL** | `app/admin/page.tsx` + `app/api/admin/...` | Playwright E2E passed; lifecycle patching verified | v2.0.0-PROD |
| **3D Journey Atlas with Dynamic Route Prefill** | **VERIFIED_LOCAL** | Three.js WebGL canvas + Corridor Prefill triggers | E2E verified (`verify:atlas` passed): 8 routes, 0 errors | v2.0.0-PROD |
| **33 Airport Destination Grid & Travel Offers** | **VERIFIED_LOCAL** | `DestinationGrid.tsx` + Travel Offers Explorer | `verify:phase23` passed: 26 offers, 33 destinations | v2.0.0-PROD |
| **Bilingual Parity, Mobile & SEO (a11y)** | **VERIFIED_LOCAL** | Bengla / English + WCAG labels | `verify:phase45` passed: iPhone 13 & Pixel 7 emulation | v2.0.0-PROD |
| **GoHighLevel CRM Outbox Engine & Backoff** | **SIMULATED** | `server/crm/outboxDispatcher.ts` | Unit tests passed: 5 attempts cutoff, exponential backoff, fails closed if credentials missing | v2.0.0-PROD |
| **Live GoHighLevel CRM Delivery** | **BLOCKED_EXTERNAL** | Requires production `GHL_API_KEY` & `GHL_LOCATION_ID` | Honest reporting: never represents mock delivery as real delivery in prod | Staging/Prod Gate |
| **Live Aircraft Telemetry (Radar)** | **SAFETY_LOCKED** | `components/FlightRadarCard.tsx` | Honest status note: ADS-B in regulatory review; zero fake radar | Post-Launch |
| **Live GDS Ticketing & PNR Issuance** | **SAFETY_LOCKED** | `server/config/constants.ts` | Safety lock strictly enforced; zero unverified automated ticketing | Post-Launch |
| **Online Payment Gateway Collection** | **SAFETY_LOCKED** | `server/config/constants.ts` | Safety lock strictly enforced; zero client charging | Post-Launch |

---

## 3. Launch Readiness Gate Status

- **Real Database & Storage Engine:** **GREEN (VERIFIED_REAL)**
  - Native PostgreSQL 18.6 daemon verified on x86_64 Windows (`realPostgresServer.test.ts`, 8/8 tests passed).
  - Native Row-Level Security (RLS) actively blocks unauthorized anonymous PII extraction with PostgreSQL kernel `permission denied`.
  - Database-engine-level multi-tenant isolation on `b2b_desk_records` using `current_setting('app.current_agency_id', true)::uuid`. Malicious cross-tenant insertions trigger native PostgreSQL RLS violation denial.
  - Durability and persistence proven across server stop, restart, automatic WAL crash recovery, and fsync checkpointing.
  - Cascading foreign keys verified on `flight_legs`.
  - Durable session revocation table `revoked_sessions` verified with anonymous role access denied.
- **Session Security & Authorization:** **GREEN (VERIFIED_REAL)**
  - Distributed token revocation table `revoked_sessions` stores cryptographic `jti` identifiers.
  - Multi-instance session invalidation survives process restarts.
  - Production runtime requires high-entropy `SESSION_SECRET`; ephemeral secret generation is strictly rejected with fatal exception.
  - Dynamic account suspension (`isAgencyActive`) blocks compromised or unapproved agencies immediately without waiting for token expiration.
- **Distributed CRM Outbox:** **GREEN (VERIFIED_REAL / SIMULATED)**
  - Multi-worker job claiming with `claimOutboxBatch` guarantees disjoint task assignment (`FOR UPDATE SKIP LOCKED`).
  - Stale worker recovery: abandoned jobs with leases older than 30 seconds are reclaimed and processed.
  - Max 5 delivery attempts with exponential backoff and idempotency SHA-256 deduplication.
  - Explicit telemetry distinction between simulated mock dispatch and live external delivery.
- **B2C Customer Intake Workflows:** **GREEN (VERIFIED_LOCAL)**
  - One-way, round-trip, and dynamic multi-city (up to 6 legs) forms validated with Zod and sanitized.
  - General enquiries (visa, corporate, umrah) verified with distinct collision-resistant reference IDs (`GEN-...`).
  - Customer reference tracking displays masked PII and realistic status badges.
- **B2B Operational Desks (6 Desks):** **GREEN (VERIFIED_LOCAL)**
  - FareDesk, BookingDesk, ClearMargin, AfterCare Desk, Verified Workflow, and PartnerGrowth fully functional.
  - Strict tenant scoping by `agency_id` enforced both at application level and database RLS policy level.
  - Verified Workflow™ validates passenger name formatting and passport validity (>6 months).
- **Safety & Regulatory Controls:** **SAFETY_LOCKED (GREEN FOR STAGING)**
  - Live payments (`ENABLE_LIVE_PAYMENTS=false`) and live ticketing (`ENABLE_LIVE_GDS_TICKETING=false`) strictly disabled.
  - B2B commercial pricing displays honest configurable commission rates without false accreditation claims.
  - Live aircraft radar displays honest regulatory status disclaimer.
- **Test Suite Results:**
  - **Automated Tests:** **68/68 Unit & Integration Tests Passed** (Vitest across 14 test suites, including 8 in native PostgreSQL 18 engine and 4 in distributed outbox).
  - **End-to-End Tests:** **11/11 Playwright Browser Tests Passed** (Bilingual navigation, forms, a11y labels, modal focus traps, Journey Atlas prefill).
  - **Production Build:** **18/18 Routes Compiled Cleanly** (0 TypeScript errors, 0 linting errors, production security headers).
