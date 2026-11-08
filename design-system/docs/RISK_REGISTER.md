# SAFARIA Tours & Travels — Comprehensive Risk Register
**Document ID:** RSK-20261108-01  
**Version:** 1.0.0  
**Date of Record:** 2026-11-08

---

| Risk ID | Category | Risk Description | Likelihood | Impact | Severity | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-001** | Legal / Reg | Agency operating before trade license & business registration finalized | High | Critical | **CRITICAL** | Disable live ticketing, paid card settlement, and auto-issuance. Operate strictly as pre-booking quotation intake desk. | Executive / Architect |
| **RSK-002** | Security | Unprotected admin modal exposing PII (customer names, phones, trade licenses) | High | Critical | **CRITICAL** | Remove unauthenticated client-side admin modal. Enforce server-side session authentication with role verification. | Lead Engineer |
| **RSK-003** | Data Loss | Flight quotation requests stored only in browser `localStorage` | High | High | **HIGH** | Build resilient PostgreSQL schema with server Route Handlers. Show success only after database transaction commits. | Full-Stack Lead |
| **RSK-004** | Security | Overly permissive RLS (`TO authenticated USING (true)`) in earlier SQL draft | Medium | Critical | **HIGH** | Write fine-grained RLS checking user organization memberships and roles. Prohibit anonymous selects. | DB Architect |
| **RSK-005** | Financial | Misleading customers or partners regarding "0% Markup" | Medium | High | **HIGH** | Prominently display disclosure: "0% SAFARIA markup applies to eligible net airfares. Airline base fares, government taxes, and carrier fees remain payable." | Product / Legal |
| **RSK-006** | Third-Party | Outage or missing credentials for GHL / Resend / WhatsApp | High | Medium | **MEDIUM** | Implement durable database write first; decouple CRM and notifications via an outbox queue with exponential retry. | DevOps / Architect |
| **RSK-007** | UX / Quality | Multi-City flight requests broken or truncated | High | Medium | **MEDIUM** | Build full dynamic multi-leg form with Zod schema validation enforcing chronological dates and non-identical airports. | Frontend Lead |
| **RSK-008** | Performance | WebGL Three.js causing battery drain or crashes on mobile devices | Medium | Low | **LOW** | Lazy-load Three.js, implement SVG fallback, and respect `prefers-reduced-motion`. Pause loop when canvas is off-screen. | Frontend Lead |
