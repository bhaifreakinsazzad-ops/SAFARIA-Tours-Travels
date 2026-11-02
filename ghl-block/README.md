# SAFARIA v2: GoHighLevel install guide

**Paste this one:** `safaria-v2-block.min.html` (55.6 KB, about 18 KB gzipped). It's the production build: minified CSS and JS, with only the `SAFARIA_CONFIG` settings left readable so you can edit them in the builder. `safaria-motion-block.html` (about 76 KB) is the same code in readable form, for reviewing or editing.

The block adds the v2 motion, 3D and component layer to the existing SAFARIA page (`#safaria-site` 3.2.x). It doesn't change the site's markup. **To roll back, delete the element.**

## Install

1. **Back up first.** In GHL, duplicate the page (Funnels/Websites → page → ⋮ → Clone) and test on the clone.
2. On the clone, add a **Custom JS/HTML** element **below** the existing SAFARIA code element, in the same section or the one after.
3. Paste the whole of `safaria-motion-block.html` into it and save.
4. Edit `window.SAFARIA_CONFIG` near the top of the pasted code:
   - `phone`: **confirm the official number.** The live site uses **+8801641178437** and the brief says **+8801674178437**. Only the optional dock and quote use this value; the site's existing links are untouched.
   - `globe`: three.js route overlay on the hero (desktop and tablet only). Default `true`.
   - `reveal`, `pointer`: scroll reveals and hover polish. Default `true`.
   - `dock`: mobile WhatsApp/Call/Quote bar. Default `false`. Turn it on only if the page has no bottom bar of its own.
   - `quoteMount`: a CSS selector for an empty `<div>` where the 3-step flight quote should render, for example `"#sf-quote-v2"`. Default `null`.
5. Preview on desktop and on a phone, then publish the clone and swap it in as the live page.

## What it does on the live page

| Feature | Where | Safeguards |
| --- | --- | --- |
| Hero entrance (anime.js 4) | title, lead, CTAs, chips | Runs only if the script arrives within 0.9s, so it never flashes visible content. CTAs show by about 700ms, with a timer guard |
| Scroll reveals (Motion 11 `inView`) | headings, service list, why grid, steps, prices | Below the fold only, never inside forms or dialogs. Content is restored if the observer is unavailable |
| Image wipe + Ken Burns | `.sf-service-image`, `.sf-agency-art` | Transform and clip-path only |
| Parallax (Motion `scroll`) | `.sf-lagoon` | Moves at most 5% of its height |
| Magnetic CTA, card tilt | hero gold CTA, `.sf-destination-card` | Fine pointers only. Skipped if the card already has a transform |
| three.js route overlay | over the globe painted in the hero art | Lazy-loaded when idle, desktop and tablet only. Hides the site's 2D `#sf-globe` only once WebGL runs, and labelled "Illustrative routes" |
| Analytics hooks | existing `wa.me` and `tel:` links | Pushes `safaria_whatsapp_click` and `safaria_call_click` to `dataLayer`. Clicks are never counted as bookings |

Everything respects `prefers-reduced-motion` **and** the site's own motion toggle (`data-motion="paused"`). In either case the block does nothing visible and downloads none of the libraries.

## Connecting the v2 flight quote to GHL (optional)

The site already has its own travel form (`#sf-travel-form`). Keep it as the primary form until the v2 quote is wired up. To use the v2 quote:

```html
<div id="sf-quote-v2"></div>
<script>
  window.SAFARIA_CONFIG = Object.assign(window.SAFARIA_CONFIG || {}, {
    quoteMount: "#sf-quote-v2",
    onQuoteSubmit: function (q, text) {
      // POST to a GHL Inbound Webhook (Automation → Workflow → trigger "Inbound Webhook"). Use the trigger's URL.
      return fetch("https://services.leadconnectorhq.com/hooks/REPLACE_WITH_YOUR_WEBHOOK", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ summary: text }, q))
      }).then(function (r) { if (!r.ok) throw new Error("webhook " + r.status); });
    }
  });
</script>
```

Put this **above** the block. "Enquiry received" shows only when the webhook returns 2xx. Otherwise the visitor gets the WhatsApp/Call/SMS handoff with their details filled in.

**Suggested GHL custom fields** (check what already exists before creating new ones): Enquiry Type, Trip Type, Origin, Destination, Departure Date, Return Date, Adults, Children, Infants, Cabin Class, Preferred Airline, Baggage, Enquiry Source, Assigned Agent. In the workflow, map `q.*` to these fields, create or update the contact, add the tag `flight-quote-v2`, create an opportunity in "Flight Quotes → New", and notify the agent.

## Still to do (needs credentials, decisions or GHL access)

- Confirm the official phone number (see above).
- Create the inbound webhook, custom fields, pipelines (flight quotes, the 11 B2B stages) and workflows inside GHL. This needs account access, so test it on the clone.
- **AI assistant (Puter.js):** not included yet. Puter's model is "user pays": each visitor has to sign in to Puter. Decide whether that's acceptable, or use a server-side model behind a GHL webhook instead.
- **Live aircraft tracker:** not included. It needs a licensed provider (AeroDataBox, FlightAware AeroAPI, Aviationstack paid tiers) with a server-side key. OpenSky's terms restrict commercial use. Until then, keep any tracker visual labelled "illustrative".
- ViBE Trippin' URL, verified social profiles, and policy pages (Privacy, Terms, Refunds, Disclaimer).

## Rebuild after editing the design system

```bash
node ghl-block/build.js
```

To test locally, decode the saved page into a folder, then run `node ghl-block/test/make.js <decoded-folder>` and start the `safaria-block-test` preview. `site.html` is the page as saved (motion paused), and `site-motion.html` simulates a visitor with motion on.
