# SAFARIA — B2B Membership Immediate Launch Runbook (Bangla)
Date: 2026-11-11
Status: MARKETING/ENQUIRY READY; LIVE PAYMENTS AND TICKETING REMAIN SAFETY-LOCKED.

## Decision
B2B Partner Network; monthly ৳৫,৯৯৯ and annual ৳৬৯,৯৯৯, sourced from src/config/constants.ts. Trial ৭২ ঘণ্টা only after manual verification. 0% SAFARIA markup is conditional on eligible ticketing, supplier authority, and legal review; ticket prices, taxes and supplier charges still apply.

## Start today — 8 actions
1. Review and merge this PR only after normal code/security review and deployment confirmation. Landing path: /b2b.
2. Publish /b2b to SAFARIA audience; until deployment use only the enquiry script below.
3. Assign one named partnership-desk owner to +8801674178437 and connect an authorized WhatsApp Business profile.
4. Prepare a business-owned merchant/bank account; do NOT publish an unverified personal payment number.
5. Create the GHL pipeline: New → Contacted → Qualified → Verification Pending → Demo → Terms Sent → Payment Pending → Active → Renewal Due → Renewed / Cancelled.
6. For every enquiry, log organization, named contact, phone, source, intended plan, next action, due date and privacy consent.
7. Manually verify agency trade and MoCAT credentials as applicable before granting any privileged partner access or trial.
8. Confirm current Bangladesh travel-agency regulation and ticketing/resale authority with counsel; execute supplier agreements. Ticketing and paid checkout remain disabled until these gates pass.

## Ready social/WhatsApp outreach
"আপনার ট্রাভেল এজেন্সির Fare Request, Booking Follow-up ও After-Sales কাজ কি এখনও ছড়িয়ে-ছিটিয়ে চলছে? SAFARIA Agency Partner Network—একটি সংগঠিত B2B workflow, request tracking এবং documented support। মাসিক সদস্যপদ ৳৫,৯৯৯; বার্ষিক ৳৬৯,৯৯৯। যোগ্য এজেন্সির জন্য যাচাইসাপেক্ষে ৭২ ঘণ্টার demo/trial। সদস্যপদ ও সেবার শর্ত জানতে লিখুন: https://safaria.vibing.world/b2b"

## Manual onboarding SOP
ENQUIRY RECEIVED → REGISTER LEAD → CHECK COMPANY AND REGISTRATION DETAILS → PROVIDE WRITTEN SCOPE & TERMS → DOCUMENT APPROVAL → ISSUE INVOICE FROM VERIFIED BUSINESS → CONFIRM PROVIDER/BANK PAYMENT INDEPENDENTLY → APPROVE PLAN WITH START/END DATES → ENABLE ONLY ENTITLED ACCESS → NOTIFY PARTNER → TRACK RENEWAL → RECONCILE.

Payment proof screenshot alone is NOT payment confirmation.
A trial is NOT free ticketing, and an enquiry is NOT a booking.
Do not accept passport scans or NID scans via public web forms or unapproved storage.
Do not open paid features automatically on application submission.

## Agent onboarding data
Agency ID, agency legal name, authorized person, company phone, email, district, trade/MoCAT identifiers and expiry when required, verification source, plan, agreed scope, invoice ID, payment receipt and bank settlement references, paid amount, start/end dates, usage, contract version, consent timestamp, owner, audit log.

## Source-of-truth / GHL boundaries
- SAFARIA Postgres holds agency verification, invoices, verified payments, entitlements, subscription expiry and access decisions.
- GHL holds lead pipeline, communications, reminders, conversion source and non-sensitive CRM metadata.
- Never allow a GHL tag or WhatsApp message alone to turn on paid agency access.

## External gates for live subscription charging
- Legal entity and regulatory approvals appropriate to services.
- Signed B2B membership agreement and refund/cancellation terms.
- Merchant approval, bank/processor confirmation and correct tax/VAT treatment.
- Secure backend payment verification; idempotent webhooks; audit trails and financial reconciliation.
- Live production DB/RLS/tenant boundaries and verified role-based access.
- Bookable supplier/GDS authorization before any actual air-ticket ticketing or guaranteed fare claim.

## Payment setup
Use an approved company payment channel only. If gateway is integrated, create server-side invoice, redirect to hosted checkout, validate provider IPN+order amount/currency/merchant reference, store transaction idempotently, then mark paid. Never trust a browser success redirect alone.

## Regression checks to run on this PR
npm run typecheck
npm run lint
npm run verify:purge
npm test
npm run build

## Launch success condition
Safe: /b2b marketing page live; WhatsApp enquiry opens with accurate plan and fields; verified agency leads are manually tracked.
Not yet safe without external approvals: automatic paid activation, GDS issuance, undocumented 0% ticket margin guarantee, business registration claims.
