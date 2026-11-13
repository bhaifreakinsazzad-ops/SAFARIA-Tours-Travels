# SAFARIA — GHL WhatsApp-First Funnels & Automation Design

**Guardrail:** Implement GHL workflows only when a linked GHL location, connected WhatsApp sender and required approved message templates are available. The app must still capture valid leads if GHL is temporarily unavailable, through the existing outbox/retry pattern.

## Lead pipeline

`NEW → CONTACTED → QUALIFIED → VERIFICATION_PENDING → DEMO_BOOKED → TERMS_SENT → PAYMENT_PENDING → ACTIVE → RENEWAL_DUE → RENEWED / LOST`.

Use stable lead reference as external correlation ID. Recommended tags: `SAFARIA_B2B`, `PAIN_FARE`, `PAIN_BOOKING`, `PAIN_PAYMENT`, `PAIN_AFTERCARE`, `PAIN_TRUST`, `PAIN_GROWTH`, `INTEREST_MONTHLY`, `INTEREST_ANNUAL`, `INTEREST_DEMO`. Tags must **not** grant access.

## Event automations

| Event | Action | Do not claim |
| --- | --- | --- |
| Public lead saved | Outbox → GHL contact/upsert → new opportunity; assign partnership owner | WhatsApp sent |
| Visitor opens wa.me link | Frontend telemetry `WA_DRAFT_OPENED` | WhatsApp delivered |
| Actual inbound WhatsApp reply | GHL Customer Replied, Reply Channel WhatsApp → match reference → notify owner | Immediate payment or ticket issuance |
| Qualified lead | Offer next-step demo or short needs assessment | Automatic trial |
| Staff approves trial | Record 72h trial timestamps; start trial end reminders | Unlimited access |
| Verified paid membership | Staff approval activates entitlements; GHL status/notification | Browser alone authorizing payment |
| Renewal due | Scheduled consent-respecting reminder with verified dates | Paid renewal automatically |
| Refund/change request | Case queue notification with unique case reference | Guaranteed refund date |

## WhatsApp formatting

Use current configured number +8801674178437 from `src/config/constants.ts`.

Message skeleton:

```
SAFARIA B2B ENQUIRY
Ref: {{reference_or_draft}}
Agency: {{agency_name}}
Contact: {{contact_name}}
District: {{district}}
Need: {{pain_category}}
Interested plan: {{plan}}
Request: Please share the next steps for agency partnership.
```

`reference_or_draft` may be present only if server saved it. Never include full passport data, bank identifiers, sensitive PII or API secrets in WhatsApp query parameters.

## Current platform technical truth

As reviewed 11 Nov 2026, PR #14 `/b2b` public form sends a prefilled WhatsApp draft via `window.location.assign()`. It does **not** save the short lead to the server. `POST /api/agency` exists for full validated applications and persists to SAFARIA repository, but its fields and validation may be different. Do not claim short form persistence until built and tested. Existing GHL adapter does not prove live credentials are connected.

## External references

- HighLevel WhatsApp workflow integration: https://help.gohighlevel.com/support/solutions/articles/155000001624
- HighLevel WhatsApp action: https://help.gohighlevel.com/support/solutions/articles/155000003531-action-whatsapp
- HighLevel Forms through WhatsApp Flows: https://help.gohighlevel.com/support/solutions/articles/155000009130
- Business-initiated WhatsApp templates need approved templates outside the open service conversation window. Verify sender connections, message content, preview and matching fields before switching on outbound automation.
