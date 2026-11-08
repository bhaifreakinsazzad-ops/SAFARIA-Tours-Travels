# SAFARIA Tours & Travels — Feature Readiness Matrix
**Document ID:** FRM-20261109-06  
**Status Taxonomy:** `VERIFIED_REAL` | `VERIFIED_LOCAL` | `SIMULATED` | `BLOCKED_EXTERNAL` | `SAFETY_LOCKED` | `NOT_READY`  
**Date of Record:** 2026-11-09  
**Verification Branch:** `feat/safaria-production-foundation`  
**Directive Reference:** `SAFARIA_ANTIGRAVITY_DIRECTIVE_007_EVIDENCE_CORRECTION_AND_LAUNCH_GATE.md`

---

## 1. Feature Readiness Taxonomy Definitions

- `VERIFIED_REAL`: Demonstrated against real external services or native databases (e.g., native PostgreSQL 18 engine, kernel-level RLS, WAL restart persistence, concurrent row locking).
- `VERIFIED_LOCAL`: Tested thoroughly in local environment (Next.js 15 App Router, Zod validation, responsive mobile layout, bilingual parity, Playwright browser E2E).
- `SIMULATED`: Validated with high-fidelity mocks (GHL CRM mock provider with exponential backoff, idempotency hashing).
- `BLOCKED_EXTERNAL`: Dependent on unconfigured third-party credentials (Live GoHighLevel API tokens and Location ID).
- `SAFETY_LOCKED`: Intentionally disabled for business safety and regulatory compliance (Live payment collection, GDS ticketing, trial auto-activation).
- `NOT_READY`: Incomplete or failing (None).

---

## 2. Feature Matrix Status

| Feature / Capability | Operational Readiness | Implementation Path | Verification Results | Target Release |
| :--- | :--- | :--- | :--- | :--- |
| **Real Native PostgreSQL 18 Engine & RLS** | **VERIFIED_REAL** | Native PostgreSQL 18.6 daemon + `001_safaria_core_schema.sql` | 8/8 tests passed in `realPostgresServer.test.ts`: DDL, kernel-level RLS, foreign keys, WAL recovery across restart, cross-tenant desk isolation, durable revocation table | v2.0.0-PROD |
| **Distributed Outbox Job Claiming (`FOR UPDATE SKIP LOCKED`)** | **VERIFIED_REAL** | `lib/crm/outboxDispatcher.ts` + `claimOutboxBatch` | 4/4 tests passed in `distributedOutbox.test.ts`: disjoint worker partitioning, expired lease recovery | v2.0.0-PROD |
| **Durable Session Revocation & Dynamic Account Suspension** | **VERIFIED_REAL** | `revoked_sessions` table + `isAgencyActive` check | 7/7 tests passed in `authAndSecurity.test.ts`: persistent `jti` revocation, rejected suspended accounts | v2.0.0-PROD |
| **B2C Flight Enquiry Workflow (One-Way & Round-Trip)** | **VERIFIED_LOCAL** | Next.js form + Zod schema + Route Handler + Supabase DB | Vitest (10 tests) + Playwright E2E passed | v2.0.0-PROD |
| **B2C Flight Enquiry Workflow (Dynamic Multi-City 1–6 Legs)** | **VERIFIED_LOCAL** | Dynamic leg state + sequential date validation | Vitest leg tests + Playwright dynamic leg test passed | v2.0.0-PROD |
| **General Enquiries (Visa & Corporate Mobility)** | **VERIFIED_LOCAL** | `GeneralEnquiryModal.tsx` + `app/api/general/route.ts` | Integration test verified (`GEN-...` ref generated) | v2.0.0-PROD |
| **Customer Reference Tracking & Masked Lookup UI** | **VERIFIED_LOCAL** | `TrackEnquiryModal.tsx` + `GET /api/enquiries?ref=...` | Vitest (5 tests) + Playwright E2E test passed; PII masked | v2.0.0-PROD |
| **Collision-Resistant Reference Generation** | **VERIFIED_LOCAL** | `lib/utils/referenceGenerator.ts` (`SFR-...`, `B2B-...`, `GEN-...`) | 1,000 unique iterations tested without collision | v2.0.0-PROD |
| **WhatsApp Structured Concierge Handoff** | **VERIFIED_LOCAL** | `lib/utils/whatsAppFormatter.ts` | Formatter unit tests passed; URI encoded | v2.0.0-PROD |
| **B2B Agency Application Intake** | **VERIFIED_LOCAL** | `B2BApplicationModal.tsx` + `POST /api/agency` | Integration test passed; manual trade audit state | v2.0.0-PROD |
| **B2B 72-Hour Trial Policy & Admin Approval** | **VERIFIED_LOCAL** | Manual staff approval via `PATCH /api/admin/agencies` | Server calculates 72h countdown upon approval | Phase 4 (Restricted) |
| **The 6 B2B Desks (FareDesk, BookingDesk, ClearMargin, AfterCare, VerifiedWorkflow, PartnerGrowth)** | **VERIFIED_LOCAL** | `app/partner/page.tsx` + `app/api/partner/desk` | Full CRUD + PATCH status transitions + audit logs + tenant isolation verified | v2.0.0-PROD |
| **Verified Workflow™ Passenger Name & Passport Audit** | **VERIFIED_LOCAL** | `app/api/partner/verify-passenger/route.ts` | 3 unit tests passed (symbol, title, expiry checks) | v2.0.0-PROD |
| **Role-Gated Operations Console (Admin Triage)** | **VERIFIED_LOCAL** | `app/admin/page.tsx` + `app/api/admin/...` | Playwright E2E passed; lifecycle patching verified | v2.0.0-PROD |
| **3D Journey Atlas with Dynamic Route Prefill** | **VERIFIED_LOCAL** | Three.js WebGL canvas + Corridor Prefill triggers | E2E verified: corridor selection (DAC-LHR) prefills flight quote form | v2.0.0-PROD |
| **33 Airport Destination Grid** | **VERIFIED_LOCAL** | `components/DestinationGrid.tsx` | 8 domestic BD + 25 global hubs; category filters | v2.0.0-PROD |
| **Bilingual Parity & Accessibility (a11y)** | **VERIFIED_LOCAL** | `/` (Bengali) & `/en` (English) + WCAG labels & modal traps | Playwright a11y tests passed (lang attributes, mobile layout, aria-dialog) | v2.0.0-PROD |
| **GoHighLevel CRM Outbox Engine & Backoff** | **SIMULATED** | `lib/crm/outboxDispatcher.ts` | Unit tests passed: 5 attempts cutoff, exponential backoff, idempotency hashing | v2.0.0-PROD |
| **Live GoHighLevel CRM Delivery** | **BLOCKED_EXTERNAL** | Requires production `GHL_API_KEY` & `GHL_LOCATION_ID` | Mock provider active; returns `providerMode: 'mock'` | Staging/Prod Gate |
| **Live Aircraft Telemetry (Radar)** | **SAFETY_LOCKED** | `components/FlightRadarCard.tsx` | Honest status note: ADS-B in regulatory review; zero fake radar | Post-Launch |
| **Live GDS Ticketing & PNR Issuance** | **SAFETY_LOCKED** | `lib/config/featureFlags.ts` | Server flag `ENABLE_LIVE_GDS_TICKETING=false` by default; zero false ticketing | Post-Launch |
| **Online Payment Gateway Collection** | **SAFETY_LOCKED** | `lib/config/featureFlags.ts` | Server flag `ENABLE_LIVE_PAYMENTS=false` by default; zero client charging | Post-Launch |

---

## 3. Launch Readiness Gate Status

- **Real Database & Storage Engine:** **GREEN (VERIFIED_REAL)**
  - Native PostgreSQL 18.6 daemon verified on x86_64 Windows (`realPostgresServer.test.ts`, 8/8 tests passed).
  - Native Row-Level Security (RLS) actively blocks unauthorized anonymous PII extraction with PostgreSQL kernel `permission denied`.
  - Durability and persistence proven across server stop, restart, automatic WAL crash recovery, and fsync checkpointing.
  - Cascading foreign keys verified on `flight_legs`.
  - Cross-tenant data isolation and role boundaries verified on `b2b_desk_records`.
  - Durable session revocation table `revoked_sessions` verified with anonymous role access denied.
- **Session Security & Authorization:** **GREEN (VERIFIED_REAL)**
  - Distributed token revocation table `revoked_sessions` stores cryptographic `jti` identifiers.
  - Multi-instance session invalidation survives process restarts.
  - Dynamic account suspension (`isAgencyActive`) blocks compromised or unapproved agencies immediately without waiting for token expiration.
- **Distributed CRM Outbox:** **GREEN (VERIFIED_REAL / SIMULATED)**
  - Multi-worker job claiming with `claimOutboxBatch` guarantees disjoint task assignment (`FOR UPDATE SKIP LOCKED`).
  - Stale worker recovery: abandoned jobs with leases older than 30 seconds are reclaimed and processed.
  - Max 5 delivery attempts with exponential backoff and idempotency SHA-256 deduplication.
  - Explicit telemetry distinction between `mock` and `live` provider modes.
- **B2C Customer Intake Workflows:** **GREEN (VERIFIED_LOCAL)**
  - One-way, round-trip, and dynamic multi-city (up to 6 legs) forms validated with Zod and sanitized.
  - General enquiries (visa, corporate, umrah) verified with distinct collision-resistant reference IDs (`GEN-...`).
  - Customer reference tracking displays masked PII and realistic status badges.
- **B2B Operational Desks (6 Desks):** **GREEN (VERIFIED_LOCAL)**
  - FareDesk, BookingDesk, ClearMargin, AfterCare Desk, Verified Workflow, and PartnerGrowth fully functional.
  - Strict tenant scoping by `agency_id`; unauthorized cross-tenant mutations blocked with HTTP 403 Forbidden.
  - Verified Workflow™ validates passenger name formatting and passport validity (>6 months).
- **Safety & Regulatory Controls:** **SAFETY_LOCKED (GREEN FOR STAGING)**
  - Live payments (`ENABLE_LIVE_PAYMENTS=false`) and live ticketing (`ENABLE_LIVE_GDS_TICKETING=false`) strictly disabled.
  - B2B commercial pricing displays honest configurable commission rates without false accreditation claims.
  - Live aircraft radar displays honest regulatory status disclaimer.
- **Test Suite Results:**
  - **Automated Tests:** **67/67 Unit & Integration Tests Passed** (Vitest across 14 test suites, including 8 in native PostgreSQL 18 engine and 4 in distributed outbox).
  - **End-to-End Tests:** **11/11 Playwright Browser Tests Passed** (Bilingual navigation, forms, a11y labels, modal focus traps, Journey Atlas prefill).
  - **Production Build:** **18/18 Routes Compiled Cleanly** (0 TypeScript errors, 0 linting errors).
