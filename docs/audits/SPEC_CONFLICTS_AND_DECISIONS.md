# SAFARIA Tours & Travels — Specification Conflicts & Architectural Decisions
**Document ID:** DEC-20261108-01  
**Author:** SAFARIA Principal Full-Stack Architect  
**Date of Record:** 2026-11-08

---

## 1. Identified Specification Conflicts

### Conflict 1: B2B Agency Subscription Pricing
- **Prototype (`safaria_platform_master_application.md`):** Lists Monthly Plan at **৳20,000/month** and Annual Plan at **৳130,000/year**.
- **Design System (`design-system/project/components/PricePlan/README.md`):** Lists Starter at **৳5,999/month** and Annual at **৳69,999/year**.
- **Resolution / Safe Default:** 
  Preserve the higher verified prototype figures (`৳20,000/mo` and `৳130,000/yr`) in a centralized `commercialConfig.ts` with an explicit `status: 'DRAFT_PENDING_APPROVAL'` flag. Display clear disclaimers that commercial subscription terms require formal partner agreement confirmation.

### Conflict 2: Official Phone Number
- **Prototype:** Uses `+8801674178437`.
- **Integrity Directive (`integrity.md` Line 28):** Flags an open item noting that the live site previously used `+8801641178437`.
- **Resolution / Safe Default:**
  Centralize in `lib/config/siteConfig.ts` as `+8801674178437` while highlighting this open verification item for business owner sign-off.

### Conflict 3: Canonical Domain Structure
- **Reference HTML:** Specifies `https://safaria.vibing.world`.
- **Historical GHL Setup:** Referenced `https://safaria.vibing.world/tours-and-travels`.
- **Resolution / Safe Default:**
  Standardize on `https://safaria.vibing.world` as root canonical. Issue an HTTP 308 permanent redirect from `/tours-and-travels` to `/` to avoid duplicate indexing.

### Conflict 4: Row Level Security Policy for Admins
- **Historical Technical Directive:** Proposed `TO authenticated USING (true)`.
- **Resolution:**
  Reject this permissive draft. In PostgreSQL / Supabase, enforce custom claims or membership tables (`public.organization_memberships` / `user_roles`) so that authenticated general users cannot query private admin or other agency records.

---

## 2. Business Compliance & Operational Boundaries
- **Business Registration:** SAFARIA registration is pending.
- **Operational Boundary:**
  1. Full B2C flight quotation request intake: **PRODUCTION-READY TARGET**.
  2. Full B2B agency partnership application intake: **PRODUCTION-READY TARGET**.
  3. Real-time ticket issuance, payment gateway collection, and automatic GDS bookings: **DISABLED BY DEFAULT** via server feature flags until official contracts, licences, and gateway accounts are confirmed by the owner.
