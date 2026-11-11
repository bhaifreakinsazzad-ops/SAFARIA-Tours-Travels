# SAFARIA Tours & Travels — Requirements Traceability Matrix
**Document ID:** RTM-20261108-01  
**Version:** 1.0.0-PROD  
**Date of Record:** 2026-11-08

---

| Req ID | Category | Requirement Description | Source Origin | Target Implementation | Test Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-001** | Brand / UI | Preserve luxury emerald/navy/gold/ivory palette and typography | Prototype & Design Tokens | Tailwind CSS config + design tokens | Visual inspection + Playwright snapshot | IMPLEMENTED |
| **REQ-002** | Hero / Copy | Preserve exact Bengali headline: "সঠিক ফ্লাইটে শুরু হোক যাত্রা।" | Prototype Line 139 | `HeroSection.tsx` | Unit test checking string presence | IMPLEMENTED |
| **REQ-003** | Atlas | 8 Atlas destinations with SVG fallback and 3D globe | Prototype Lines 200–210 | `JourneyAtlas.tsx` + `ThreeGlobe.tsx` | Interaction test: click button updates form | IMPLEMENTED |
| **REQ-004** | Services | 8 distinct services catalog with bilingual titles and descriptions | Prototype Lines 248–300 | `ServiceCatalog.tsx` | Unit test asserting 8 items | IMPLEMENTED |
| **REQ-005** | Directory | 33 domestic & international airports directory with category tabs | Prototype Lines 212–246 | `DestinationGrid.tsx` | Search filter test (e.g. "DXB") | IMPLEMENTED |
| **REQ-006** | Studio Form | Flight enquiry form supporting One-Way, Round-Trip, and Multi-City | Master Prompt Sec. 6 | `FlightEnquiryForm.tsx` | Zod schema validation tests + multi-leg | IMPLEMENTED |
| **REQ-007** | Persistence | Durable server-side persistence of enquiries in Supabase PostgreSQL | Master Prompt Sec. 8 | `app/api/enquiries/route.ts` | Integration test: POST returns unique ref | IMPLEMENTED |
| **REQ-008** | Ref Generator| Collision-resistant reference number format: `SFR-YYYYMMDD-XXXX` | Directive Sec. 2 | `referenceGenerator.ts` | Regex pattern unit test | IMPLEMENTED |
| **REQ-009** | WhatsApp | Structured WhatsApp handoff link with URL-encoded summary | Prototype Lines 405–418 | `whatsAppFormatter.ts` | Unit test verifying text parameters | IMPLEMENTED |
| **REQ-010** | B2B Portal | B2B application intake with trial request and commercial terms | Prototype Lines 960–1040 | `AgencyApplicationModal.tsx` + API | Form submission test with status PENDING | IMPLEMENTED |
| **REQ-011** | Security / RLS| Secure tenant-isolated RLS policies; no open authenticated reads | Directive Sec. 3 | `supabase/migrations/001_init.sql` | Supabase RLS security test | IMPLEMENTED |
| **REQ-012** | Admin Desk | Authenticated operations console for enquiry triage | Prototype Lines 1079–1220 | `app/(ops)/admin/page.tsx` | Unauthorized 401/403 access test | IMPLEMENTED |
| **REQ-013** | CRM Adapter | GoHighLevel v2 API adapter with retry outbox | Directive Sec. 4 | `lib/crm/ghlAdapter.ts` | Mock API integration test | IMPLEMENTED |
| **REQ-014** | AI Concierge | Voyager AI with transparent guardrails and human escalation | Master Prompt Sec. 10 | `VoyagerChat.tsx` + Route Handler | Prompt injection & boundary tests | IMPLEMENTED |
| **REQ-015** | Radar Status | Transparent live telemetry status banner (pending provider) | Prototype Lines 768–830 | `FlightRadarCard.tsx` | Component test checking honest disclaimer| IMPLEMENTED |
| **REQ-016** | Feature Flags| Server-side flags: issuance, payments, trials disabled by default | Master Prompt Sec. 3 | `lib/config/featureFlags.ts` | Test verifying flags are strictly false | IMPLEMENTED |
