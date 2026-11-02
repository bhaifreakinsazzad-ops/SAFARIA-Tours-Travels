# SAFARIA v3: full-site GoHighLevel block

**Paste this one:** `safaria-v3-block.min.html` (737 KB: about 220 KB code, the rest is five embedded WebP images). Or open `delivery/safaria-v3-copy.html` and press **Copy all code**. `safaria-v3-block.html` is the same block with readable CSS/JS.

v3 **replaces** the old SAFARIA 3.2 code element and the v2 motion overlay (`safaria-v2-block.min.html`). It renders the whole site from the design system under `#safaria-v3`; nothing outside that root is styled. The v2 files stay in the repo as the rollback.

## Install (about 10 minutes)

1. **Clone the page** in GHL (Sites → Websites → page ⋮ → Clone) and work on the clone.
2. On the clone, delete the old 3.2 code element and the v2 element, add **one Custom JS/HTML** element, paste the block, save.
3. Edit `window.SAFARIA_CONFIG` at the top of the pasted code (see below).
4. Use **Preview**, not the builder canvas (GHL does not run custom scripts in the canvas). Check desktop and phone, then publish the clone.
5. Rollback: delete the v3 element and restore the old ones.

### `SAFARIA_CONFIG`

| Key | Default | Meaning |
| --- | --- | --- |
| `phone` | `+8801674178437` | WhatsApp, call and SMS number everywhere. **Open item:** the previous site used `+8801641178437`. Confirm which is official before publishing. |
| `email` | `safariatoursandtravels@gmail.com` | Email link and handoff |
| `vibeUrl` | `https://trippin.vibing.world/` | ViBE Trippin' link. **Open item:** confirm the official address |
| `lang` | `"bn"` | First-visit language (a visitor's choice is remembered on their device) |
| `globe`, `motion`, `dock` | `true` | 3D globe, anime.js/Motion enhancements, mobile contact dock |
| `webhooks.{flight,studio,corporate,agency,partner,tracker}` | `""` | GHL Inbound Webhook URLs. Empty means the visitor gets the WhatsApp/Call/SMS handoff. "Enquiry received" shows **only** when a webhook returns 2xx |
| `onSubmit(type, data, text)` | none | Optional function that returns a Promise; use it instead of `webhooks` for custom delivery |

## What is in the block

Header with language switch, drawer, sticky/compact states and scroll progress → hero (anime.js entrance, interactive 3D globe, route "boarding pass") → quick enquiry → destinations (search, region filters, saved list, all 8 domestic and 25 international, New York and Florida separate) → services → Travel Studio → corporate → B2B agency programme (৳20,000 / ৳130,000 / 72-hour trial with all caveats, application form) → ViBE Trippin' → why SAFARIA and process timeline → 3-step flight quote (primary conversion) → budget estimate, pre-booking checklist, flight-status question → Partner Hub → FAQ (13) → footer with the four entity credits and policy notes. Every form is an **enquiry**, never a booking.

## Systems

- **Design tokens:** `design-system/project/tokens.css`, scoped to `#safaria-v3`. Night is the page; `data-theme="day"` is used for form shells.
- **Motion ownership:** CSS = hover/focus. anime.js 4.0.2 (through `Safaria.Motion`) = hero sequence, staggers, counters, form steps, stamps. Motion 11.11.17 = `inView` start times and scroll progress. three.js 0.160.0 = the canvas only. Libraries load from pinned jsDelivr URLs; with none of them the Web Animations API is used and the page is fully usable.
- **3D:** one renderer. Dotted Earth (about 30,000 candidate points sampled onto a 1° land mask, so continents show), atmosphere, one buffer of 32 illustrative route arcs with a shader pulse, markers, a plane flying the selected route, drag-to-rotate, click or tap to pick. Rendering pauses off-screen and when the tab is hidden; `pagehide` disposes everything. Mobile caps pixel ratio at 1; devices with 2 or fewer cores or 2 GB or less skip 3D. Reduced motion, no WebGL and Save-Data show the still globe or the painted hero art. Routes are labelled **illustrative** and are not flight schedules.
- **Language:** English lives in the markup, Bengali in an embedded table (`data-i` keys). The flight quote's built-in English is translated at runtime. Agent-facing summaries stay in English.
- **Analytics (dataLayer only):** `safaria_flight_form_started`, `…_submitted` (with `delivered: true/false`), `…_whatsapp_click`, `…_call_click`, `…_quote_click`, `…_b2b_application_submitted`, `…_b2b_apply_click`, `…_b2b_demo_click`, `…_corporate_enquiry_submitted`, `…_studio_enquiry_submitted`, `…_partner_enquiry_submitted`, `…_destination_selected`, `…_lang_changed`. Clicks are never counted as bookings.

## GHL setup you still need to do (needs your account)

1. **Inbound Webhook workflows**, one per form (trigger "Inbound Webhook"). Paste each URL into `webhooks`. The payload is `{ type, summary, source, …fields }`. Flight fields: `trip, from, to, depart, ret, adults, children, infants, cabin, airline, baggage, name, phone, email, notes`.
2. **Custom fields** (check what exists first): Enquiry Type, Trip Type, Origin, Destination, Departure Date, Return Date, Passenger Breakdown, Cabin Class, Preferred Airline, Agency Name, Corporate Name, Enquiry Source, Assigned Agent, Lead Status.
3. **Pipelines:** "Flight Quotes" and the B2B pipeline: New Agency Lead → Initial Contact → Verification Pending → Qualified Agency → Trial Requested → Trial Active → Subscription Offered → Payment Pending → Active Partner → Follow-Up Required → Closed / Not Qualified. Never mark an agency verified or subscribed automatically from a form submission.
4. **Notification** to the assigned agent. Do not claim a WhatsApp/SMS was delivered unless the provider confirms it.

## Not included, and why

- **AI assistant (Puter.js):** Puter's model is "user pays": each visitor signs in to Puter. That needs a business decision; alternatively use a server-side model behind a GHL webhook. Nothing is faked.
- **Live aircraft tracker:** needs a licensed provider (AeroDataBox, FlightAware AeroAPI, paid Aviationstack) with a server-side key; OpenSky's terms restrict commercial use. The page says live tracking is not connected and never simulates aircraft.
- **Policy pages:** Privacy, Terms, Cancellation/Refund and Travel Disclaimer appear as in-page notes. The final refund policy is marked "being confirmed". Real pages and registration/licence claims need your verification.
- **Reviews, statistics, airline/IATA badges, 24/7 or price guarantees:** none are published. Hero figures are only the verified counts (8, 25, 72).
- "Free" is dropped from the Bengali trial heading (the brief says only "72 hours"). Restore it only if the trial is genuinely free.

## Quality notes

Tested in the Browser pane (Chromium, hostile page-builder theme in `test/v3.html`): no console errors; no horizontal scroll at 375 px; all five forms validate, produce the structured summary and the WhatsApp/Call/SMS handoff; language switch retranslates the quote and dock; reduced motion shows the still globe with nothing left hidden; no-WebGL shows the painted hero; copy page round-trips byte-for-byte. **Not yet tested:** inside the real GHL page (script execution in Preview, webhooks, sticky header inside GHL sections), Safari/Firefox, real phones, a Lighthouse run. Do these on the clone before publishing.

## Rebuild

```bash
ESBUILD_DIR=<folder containing node_modules/esbuild> node ghl-block/build-v3.js
node ghl-block/delivery/make-v3.js
```

Sources: `ghl-block/v3/{markup.html,styles.css,keyframes.css,app.js,globe.js,bn.extra.json,qbn.json,land.b64}`, plus `design-system/project/{tokens.css,components/bundle.*}` and `v3/bn.source.json` (Bengali copy extracted from the live 3.2 site). `v3/make-land.js` regenerates the land mask. `test/serve.js` serves `test/v3.html` (add `?motion=1` to force motion, `?nogl=1` to simulate no WebGL).
