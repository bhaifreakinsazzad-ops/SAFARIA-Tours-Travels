# SAFARIA Tours & Travels — Baseline Forensic Audit
**Document ID:** AUD-20261108-01  
**Auditor:** SAFARIA Principal Full-Stack Architect  
**Audit Target:** `safaria_platform_master_application.md` & Repository State  
**Branch:** `feat/safaria-production-foundation`  
**Date of Record:** 2026-11-08

---

## 1. Executive Summary

This forensic audit evaluates the actual code, runtime characteristics, and security posture of the SAFARIA codebase against the claims of historical technical directives and commercial specifications.

**Finding:** The historical document `safaria_master_technical_directive_and_implementation_document.md` claimed Phases 1 through 6 were **"COMPLETE"**. Our line-by-line inspection of the actual implementation in `safaria_platform_master_application.md` reveals that these completion claims are largely blueprint assertions; the live code is a client-side React prototype running in the browser with Babel and Tailwind CDN, relying on `localStorage` without a functioning Next.js backend, authenticated admin security, or verified database persistence.

---

## 2. Line-by-Line Code Audit Findings

### 2.1 Architecture & Runtime
- **Runtime Stack:** `safaria_platform_master_application.md` (Lines 82–90) mounts a client-side React 18 tree directly into `<div id="safaria-root"></div>` using unpkg-hosted UMD React, ReactDOM, Babel standalone, and Tailwind CDN.
- **Deficiency:** High bundle overhead, uncompiled JSX runtime compilation in browser, CDN failure points, zero SSR/SSG for SEO, and no backend API route execution.

### 2.2 Data Persistence & Data Loss Risks
- **Storage Layer (Lines 310–338):**
  ```javascript
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const cached = localStorage.getItem('safaria_enquiries_v2');
      return cached ? JSON.parse(cached) : [ ... initial mock rows ... ];
  ```
- **Form Submission (Lines 362–402):** Submissions write to React state and `localStorage`. There is no `fetch()` call, no backend endpoint, and no Supabase transaction.
- **Risk:** Clearing browser cache, changing devices, or private browsing results in immediate permanent loss of customer flight quotations and B2B partner applications.

### 2.3 Critical Security Vulnerabilities
- **Public Admin Console (Lines 267–275, 1079–1220):**
  An unauthenticated lock icon in the main navigation bar triggers `setActiveModal('admin')`. This opens the `AdminDeskModal`, exposing customer names, phone numbers, route itineraries, and trade license numbers to any visitor.
- **Flawed RLS Blueprint:**
  In `safaria_master_technical_directive_and_implementation_document.md` Section 3, the proposed Supabase policy is:
  ```sql
  CREATE POLICY "Admin select flight enquiries" 
    ON public.flight_enquiries FOR SELECT 
    TO authenticated USING (true);
  ```
  `TO authenticated USING (true)` allows *any* logged-in user (including external customers or competitors) to view all enquiries across all agencies. This violates tenant isolation.

### 2.4 Form & Domain Logic Defects
- **Multi-City Routing Defect (Lines 492–512):**
  The Travel Studio offers `ROUND_TRIP`, `ONE_WAY`, and `MULTI_CITY`. When `MULTI_CITY` is selected, the form continues to display only a single departure and arrival airport field. No multi-leg UI exists.
- **IATA Code Conflicts:**
  - `LON` is used as a destination code (Line 207), but `LON` is an IATA metropolitan area code covering LHR, LGW, STN, LTN, LCY, and SEN. Flight tickets require individual airport IATA codes (e.g. LHR).
  - Domestic vs. International airport categorization needs normalization (e.g., Tokyo HND vs NRT).
- **Hardcoded Travel Dates (Lines 343–344):**
  Departure date is hardcoded to `2026-11-15` and return date to `2026-11-25`. These must be dynamically calculated (e.g., today + 7 days, today + 14 days).

### 2.5 Simulated vs. Real Features
- **Voyager AI (Lines 878–930):**
  Uses keyword matching (`query.includes('london')`) inside a `setTimeout(..., 600)`. It is not an LLM service.
- **Aircraft Radar (Lines 768–830):**
  Accurately disclaims that live telemetry is pending, but the "Verify Schedule" button merely displays a browser `alert()`. No request is queued or stored.
- **Journey Atlas 3D Globe (Lines 575–670):**
  The SVG fallback works reliably, but the Three.js 3D canvas is basic rotational geometry without raycasting hit detection or camera transitions between selected route nodes.

### 2.6 Navigation Breakages
- Navigation link `<a href="#sf-atlas">` (Line 233) has no matching anchor tag. The hero section has `id="sf-home"`.

---

## 3. Historical Claim vs. Code Reality Verification

| Technical Directive Claim | Historical Status Claimed | Verified Reality in Code | Severity |
| :--- | :--- | :--- | :--- |
| Phase 1: Source & Shell Reconstruction | **COMPLETE** | React prototype running via CDN script tags in browser; no Next.js project scaffolded. | High |
| Phase 2: Section Rejuvenation | **COMPLETE** | Section layout is visually complete, but features are largely decorative or in-memory. | Medium |
| Phase 3: Data & Enquiry Workflows | **COMPLETE** | No server validation, no database insertion, data stored only in `localStorage`. | Critical |
| Phase 4: 3D & Interactive Experiences | **COMPLETE** | Basic globe present, but Voyager AI is keyword script and Radar is an `alert()`. | Medium |
| Phase 5: Localization & SEO | **COMPLETE** | Basic bilingual toggle in React state; lacks URL-based routing (`/` vs `/en`) and localized SSR tags. | Medium |
| Phase 6: Operational Administration | **COMPLETE** | Admin desk is an unprotected frontend modal exposing PII without authentication. | Critical |

---

## 4. Immediate Remediation Action Plan
1. **Branch Isolation:** Safely isolate development on `feat/safaria-production-foundation`.
2. **Next.js Modular Monolith Scaffold:** Build full Next.js App Router application with TypeScript and compiled Tailwind.
3. **Database & API Security:** Create PostgreSQL migrations with strict UUIDs, status enums, server Route Handlers, and robust RLS.
4. **Dynamic Multi-City Engine:** Implement full multi-leg form with Zod schema validation.
5. **Role-Gated Admin Desk:** Protect administrative functions behind secure server session authentication.
