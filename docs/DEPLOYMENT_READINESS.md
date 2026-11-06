# SAFARIA Next.js deployment readiness

## Production status — 6 November 2026

- Source: `https://github.com/bhaifreakinsazzad-ops/SAFARIA-Tours-Travels`, branch `main`.
- Host: Vercel team `notrealengine`, project `safaria-tours-travels`, configured as Next.js on Node 24.
- Public URL: `https://safaria.vibing.world/`. The `safaria` CNAME points to `cname.vercel-dns.com`; Vercel reports the domain correctly configured. HTTPS GET returned 200 with the SAFARIA title and Vercel response headers.
- Browser checks passed against the deployed Vercel URL (Atlas, 26 offers, 33 destinations, forms) and the public custom domain (metadata, language layouts, WhatsApp drafts, and legacy endpoint check). Vercel reported no runtime errors at verification time.
- Supabase is not connected because this release uses client-side drafts and visitor-initiated WhatsApp enquiries; it has no enquiry database or server credentials.

## Implemented and checked

- The Next.js source contains the owner-supplied canonical root `https://safaria.vibing.world/`, contact `+8801674178437`, and agency prices ৳5,999 monthly / ৳69,999 annual in one config file.
- The purge gate rejects the old page path, form shortcut, phone and price values from `src/`. Browser QA checks that the page makes no requests to legacy form or page endpoints.
- Travel Studio, agency application and route quotation prepare encoded WhatsApp drafts only. A visitor must press Send; there is no GHL submission or success claim.
- Bengali and English fonts are self hosted through `next/font`. The hero logo and skyline use optimized Next.js images, and OG/Twitter share the local `public/images/social-share.jpg` asset.
- `robots.txt` and `sitemap.xml` point to the canonical root. The production build completes without warnings.
- Local Lighthouse scores (Edge, production build): mobile **91 performance / 100 accessibility / 100 best practices / 100 SEO**; desktop **99 / 100 / 100 / 100**. Both runs reported zero layout shift and no run warnings. Scores can differ on the deployed host and real devices.
- `npm audit --omit=dev --audit-level=high` found zero production dependency vulnerabilities during this audit.

## Release boundary

The public site is live. Browser device profiles emulate iPhone and Pixel behavior; actual iOS Safari, Android WhatsApp delivery, and supplier responses remain unverified. The visitor must still press Send in WhatsApp for an enquiry to reach SAFARIA.

The owner-supplied pricing, 0% SAFARIA markup qualification, 72-hour trial and customer data handling still need the operator's approved written terms before a public commercial launch. The form does not activate a subscription or trial.

## Verification commands

Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify:purge`, `npm run verify:atlas`, `npm run verify:phase23`, and `npm run verify:phase45` from `web/`, with `npm run start` running for browser checks. Phase 4/5 screenshots and Lighthouse JSON reports are local in `qa-phase45/`.

Playwright's iPhone and Pixel profiles verify viewport, user agent and WhatsApp URL formatting. They do not replace a real iOS Safari or Android WhatsApp send test.

