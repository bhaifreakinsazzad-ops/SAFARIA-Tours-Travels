# SAFARIA — Seasonal Landing Page + Universal Marketing Unified Upgrade

**Record date:** 2026-11-14  
**Basis:** Owner-supplied handwritten Universal and Seasonal photos; current SAFARIA `main` branch; owner decisions (50/50 B2C/B2B, 24/7 staffed support, supplier contracts not finalized).  
**Delivery status:** Implementation committed on a review branch; **not independently production-tested**.

## 1. Faithful extraction: second handwritten note

The page is labeled `SEASONAL`. Under it, diagonally handwritten and partly crossed/underlined text appears to contain:

| Written phrase (best reading) | Confidence | Implementation |
|---|---|---|
| Landing Page | high | Dedicated `/seasonal` route, reusable within existing Next.js application |
| Interactive & Responsive | medium | Interactive B2C/B2B selection, clickable offer cards |
| Mobile Responsive | high | Fluid Tailwind layout, responsive images, 44px+ controls |
| Free Customized Domain | medium | **Unconfirmed commercial note**. No free domain claim, purchase or configuration implemented |
| Hosting | high | Deploy under existing SAFARIA hosting; no new hosting promise |
| Additional lower-right words | low | Unclear; not converted into features or claims |

**Critical source distinction:** There are **no named seasonal travel packages, dates, fare amounts, discount percentages, eligibility terms, supplier authorizations or seasonal event names** in this second photograph. Specific seasonal campaign topics below are **marketing inferences derived from SAFARIA's existing catalog**, not transcribed supplier offers.

The first handwritten Universal page remains authoritative for the trust and service themes already normalized in `src/data/universal-marketing.ts`.

## 2. What is new and how it merges with the previous revision

The previous Universal-and-B2B work was already merged into `main` through PR #29 and PR #30. This extension is intentionally additive and based on the **actual latest `main`**. It preserves all existing creative assets, original 26-item catalog, 3D Atlas, PWA, bilingual UX, privacy boundaries, B2B desk infrastructure and WhatsApp enquiry integrations.

| New asset/code | Purpose |
|---|---|
| `src/app/seasonal/page.tsx` | Landing page, canonical SEO metadata and share preview |
| `src/components/seasonal-landing-client.tsx` | Premium responsive seasonal landing page with audience selection and enquiry interactions |
| `src/data/seasonal-campaigns.ts` | Central bilingual campaign registry, mapped to existing offers |
| `src/components/universal-offers-strip.tsx` | Link added to the new page from homepage, without removing existing offers |
| `src/app/sitemap.ts` | Adds seasonal landing page to sitemap |
| `tests/unit/seasonalCampaigns.test.ts` | Regression protection for destination IDs, assets, audience pathways, and claims |

The new landing page is published on the existing canonical domain path:

`https://safaria.vibing.world/seasonal`

**No new domain registered, no hosting purchased, no financial or backend changes.** A later branded subdomain must only be configured with documented ownership, DNS control, TLS and proper canonical/redirect/analytics behavior.

## 3. Intent segmentation — conversion system

The campaign presents two selectable journeys using the owner's **50% B2C / 50% B2B** initial marketing allocation.

### B2C / Traveller journey

- Four editorial topics: Domestic travel, Saudi routes, student travel and Business Class.
- Uses SAFARIA's existing locally hosted destination and category images.
- Each campaign card maps to a previously supported offer ID. Buttons open the **existing route enquiry dialog**, preserving form validation and WhatsApp draft / Send requirements.
- Hero CTA opens `fare-options` enquiry. Secondary CTA links to the existing Travel Studio.
- Claims are enquiry-first; prices, availability and ticketing require supplier confirmation.

### B2B / Agency journey

- Four editorial topics: managing fare requests, 24/7 staffed follow-up, passenger data checks and partnership pre-registration.
- Links to the existing `/b2b#b2b-subscription-enquiry` process.
- Promotes an operational workflow preview and pre-registration, **not** instant wholesale supply, guaranteed margin or active subscription.
- Actual commercial rates, supplier inventory, airline authorization and booking remain pending.

### Behaviour and experience

- Both audiences can switch with keyboard-accessible buttons (`aria-pressed`).
- Existing bilingual site state persists during in-app navigation.
- `?audience=b2b` selects agency view on the seasonal page without new backend dependencies.
- Each tile has `data-campaign-id` for later consent-aware instrumentation; no tracking pixel is automatically added.
- Images are served from previously reviewed `public/marketing/` files, avoiding missing assets and unlicensed new stock.
- Real headlines, body copy, buttons and disclaimers remain HTML, not baked into images.

## 4. Proposed universal + seasonal brand campaign system

**Brand thesis:** SAFARIA makes travel enquiries and agency workflows feel better organized, more transparent and professionally supported.

**Creative split:** Use one shared visual grammar — Emerald `#041713`, Forest `#062B27`, Champagne Gold `#CFB57C`, Ivory `#F3F0E7`, Navy `#10243A`, genuine SAFARIA logo. Separate emotional content for two customer groups.

- **B2C emotion:** confidence, calm departure, next-chapter excitement, clear rules, respectful support.
- **B2B emotion:** efficiency, retained control, partner professionalism, simpler follow-up, credible operation.
- **Always:** realistic humans and geography; zero fake testimonials, fabricated ticket screens, unverified logos, invented flight prices, guaranteed instant quotes or guaranteed commissions.
- **Support:** Owner confirms staffed 24/7 contact. Advertising may say this for questions and follow-up; do not imply airlines or visa offices are available 24/7 or that refunds are guaranteed.

## 5. Nano Banana Pro creative production: global instruction

Use each individual prompt below **together with** this common master brief:

> Create a professional photographic advertisement for SAFARIA Tours & Travels, a Bangladesh-founded premium travel planning and B2B agency support brand. Brand colors Emerald #041713, Forest #062B27, Champagne Gold #CFB57C, Ivory #F3F0E7, restrained Navy #10243A. Match the supplied official SAFARIA logo and current website screenshot. Prioritize authenticity over artificial cinema: natural South Asian representation, real facial anatomy, believable terminal architecture, accurate destination characteristics, comfortable lens geometry, genuine light, subtle editorial grain, calm premium composition, no stock-photo cliché, no exaggerated lens flares or floating money. For website assets deliver **text-free imagery** suitable for HTML overlay. For social media add text later in an editable design tool. Never invent an airline mark, flight price, promotional entitlement, guaranteed outcome, customer quote, commission or active discount. Protect 35–45% quiet negative space for headline and CTA; keep faces away from crop margins. Render at the largest available resolution and export editorial-safe versions with expected crop.

### Seasonal website imagery

**SW01 — B2C Seasonal Hero — 1600×900 / 16:9 / mobile derivative 900×1200**

Prompt: "Natural Bangladesh-origin traveller in a modern international airport concourse calmly looking at a journey plan, warm sunrise shining through realistic terminal windows, authentic faces and understated travel attire, slightly distant aircraft parked outside, dark emerald architectural framing, soft ivory reflections and subtle champagne gold ambient light, refined luxury documentary aesthetic, strong space on the left for headline, no text, no airline logo, no fictional boarding pass." 

Website placement: `/seasonal` hero for B2C. Current asset fallback: `/marketing/web/travel-studio.jpg`.

**SW02 — B2B Seasonal Hero — 1600×900 / 16:9 / mobile derivative 900×1200**

Prompt: "Believable independent Dhaka travel-agency workspace with two professional Bangladeshi staff reviewing general fare-enquiry notes, realistic modern but modest work environment, authentic desk and laptop with unreadable screens, deep emerald wall, warm overhead light, subtle champagne-gold accents, confident non-staged expression, elegant negative space on left, editorial realism, no text, no fictional dashboard, no corporate logos."

Placement: `/seasonal?audience=b2b`. Current fallback: `/marketing/web/b2b-hero.jpg`.

### B2C social creatives — four primary cards

**SS01 — Domestic Escape / 1080×1350.** Prompt: "Photorealistic Cox's Bazar coastline viewed from a beautiful but believable low-rise terrace in late afternoon, natural beach geometry, authentic Bangladesh coastal atmosphere, refined emerald shadows, golden sunlight and ivory sky, no fantasy architecture, editorial travel advertisement, generous upper-left text space." Overlay headline: **"ছুটির গন্তব্য ঠিক করেছেন?"** Support: "ডোমেস্টিক ফ্লাইটের কোটেশন জানতে SAFARIA-তে অনুরোধ করুন।" CTA: **"কোটেশন চান"** → `/seasonal`.

**SS02 — Saudi Traveller / 1080×1350.** Prompt: "Documentary portrait of a Bangladeshi expatriate adult in a contemporary airport terminal with a practical cabin bag, looking forward to an upcoming journey, subtly visible credible airport wayfinding shapes without readable made-up labels, restrained gold light, emerald shadow palette, warm human expression, no identifiable airline insignia, no religious sacred-site fakery, ample clean headline space." Headline: **"সৌদি রুটে যাত্রার পরিকল্পনা?"** Support: "জেদ্দা, রিয়াদ, মদিনা ও দাম্মাম রুটের অপশন যাচাই করুন।" CTA: **"রুট জানুন"** → `/seasonal`.

**SS03 — Student Journey / 1080×1350.** Prompt: "Authentic Bangladeshi student preparing at a well-lit international departure lounge with one ordinary suitcase and university folder, natural youthful emotion, contemporary clothing, clean realistic architecture, emerald and gold brand toning, no fake airline/student benefit badge, no invented boarding pass, upper-left headline-safe region." Headline: **"নতুন সেমিস্টার, নতুন যাত্রা।"** Support: "স্টুডেন্ট ফেয়ার ও ব্যাগেজ শর্ত যাচাই করুন।" CTA: **"অপশন জানুন"** → `/seasonal`.

**SS04 — Premium Travel / 1080×1350.** Prompt: "Beautifully photographed generic premium-cabin environment with realistic seat proportions, soft natural window daylight, one sophisticated adult traveller from a discreet side-rear angle, understated night emerald upholstery, cream tones and champagne metal trim, no imitation of branded airline product or unavailable aircraft model, rich texture, negative space for concise editorial headline." Headline: **"আরামদায়ক দীর্ঘ যাত্রা?"** Support: "Business Class বিকল্পের কোটেশন জানতে চান।" CTA: **"প্রিমিয়াম অপশন"** → `/seasonal`.

### B2B social creatives — four primary cards

**SS05 — Agency Workload / 1080×1350.** Prompt: "Genuine small independent travel agency in Dhaka, operator facing several enquiry notes and one phone, plausible workload without staged chaos, dark green office interior and natural daylight, believable aged documents without sensitive real information, strong negative space, premium trustworthy documentary style, no text or airline logos." Headline: **"পিক সিজনে রিকোয়েস্ট সামলাচ্ছেন?"** Support: "SAFARIA-এর সংগঠিত FareDesk™ ওয়ার্কফ্লো দেখুন।" CTA: **"ডেমো জানতে চান"** → `/seasonal?audience=b2b`.

**SS06 — Staffed Support / 1080×1350.** Prompt: "Respectful Bangladeshi travel support professional reviewing general customer requests at night in a quiet real office, warm monitor glow, dark emerald background, measured confident expression, editorial candid realism, no fake live airline tickets or impossible red emergency graphics, no readable monitor text." Headline: **"রাতেও যোগাযোগ প্রয়োজন?"** Support: "SAFARIA-এর ২৪/৭ সাপোর্ট টিমের সাথে কথা বলুন।" CTA: **"B2B আগ্রহ জানান"** → `/seasonal?audience=b2b`. Caption must clarify airline actions depend on supplier rules.

**SS07 — Verified Workflow / 1080×1350.** Prompt: "Professional travel-operations agent carefully comparing two generic passenger information sheets beside a laptop in natural daylight, real Bangladesh travel-office setting, subtle gold pen, emerald surface, sensitive document fields visually unreadable, hands realistic, minimal elegant visual composition, no guarantee seal or fictional error-free badge." Headline: **"নাম আর ডকুমেন্ট আগে যাচাই।"** Support: "ডেটা চেক ওয়ার্কফ্লো সম্পর্কে জানুন।" CTA: **"ওয়ার্কফ্লো ডেমো"** → `/seasonal?audience=b2b`.

**SS08 — Partnership Pre-Registration / 1080×1350.** Prompt: "Two independent Bangladeshi agency entrepreneurs discussing a future partnership across a well-lit office desk, sincere natural hand gestures without staged handshake if awkward, modest contemporary setting, dark emerald details, champagne-gold daylight reflections, credible professional trust, no money piles, no fictional airline letter, no text." Headline: **"এজেন্সি পার্টনারশিপে আগ্রহী?"** Support: "SAFARIA-এর B2B প্রি-রেজিস্ট্রেশনে আগ্রহ জানান।" CTA: **"আগ্রহ নিবন্ধন"** → `/seasonal?audience=b2b`.

### Production dimensions / accessibility

- Website hero: 1600×900 with mobile 900×1200 crop. Optimize to WebP/AVIF with visually acceptable quality and ideally sub-300KB per hero derivative when feasible.
- Social feed master: 1080×1350; adapt to 1080×1080 square and 1080×1920 story. Recompose rather than simply crop text off-screen.
- Open Graph: 1200×630. Use site-generated HTML text or a separately verified share image.
- Keep official logo distinct and unmodified; set HTML text overlay in CSS/React so Bengali copy remains accessible and sharp.
- Before committing generated assets, inspect real people, airport architectural credibility, trademark rights, headline legibility, responsive crops, color continuity, and whether any visual implies an unapproved supplier endorsement.
- Preserve file naming: `public/marketing/seasonal/sw01-b2c-hero.webp`, `sw02-b2b-hero.webp`, `ss01-domestic.webp` through `ss08-partnership.webp`. Existing assets remain in use until these specific files are created and QA passes. Do **not** create broken links to planned files.

## 6. Acquisition and testing

**Owner-selected starting spend split:** 50% B2C / 50% B2B. Do not infer equal acquisition costs or assume a conversion rate.

**Example campaign URLs:**
- `/seasonal?utm_source=facebook&utm_medium=paid_social&utm_campaign=safaria_seasonal_b2c&utm_content=ss01_domestic`
- `/seasonal?audience=b2b&utm_source=facebook&utm_medium=paid_social&utm_campaign=safaria_seasonal_b2b&utm_content=ss05_agency_workload`

Do not rely on URL parameters alone as a completed tracking system. UTM captures referral context only when analytics is responsibly configured with the appropriate consent and privacy policy.

**Weekly metrics:** qualified traveller enquiry, itinerary completeness, actual WhatsApp Send verification when possible, first-human-response time, eligibility for follow-up; separately qualified agency registrations, verified legal business profile, demonstration requests/completions and authorized commercial follow-ups. Never report a WhatsApp draft click as a confirmed enquiry, booking or paid member.

**Initial learning cycle:** Use two creative angles per audience at a time; compare leading indicators after enough qualified leads accumulate. Start with non-transactional organic posting and moderated ads. A/B test the hero CTA and the first card message, not a dozen unrelated changes simultaneously. Move budget according to qualified leads, not vanity clicks.

## 7. Domain, hosting and operational interpretation

The handwritten note mentions `Free Customized Domain` and `Hosting`. Treat these as infrastructure ideas only; **there is no evidence that SAFARIA owns, can gift, or has registered any domain at zero cost**.

**Implemented now:** `/seasonal` hosted on the canonical SAFARIA site, no new billing or domain dependencies. In a future separate release, the team may choose a branded path or a verified subdomain such as `offers.safaria.vibing.world` if DNS, security certificate, hosting routing and canonical strategy are confirmed.

**Not implemented:** white-label landing pages for third-party agencies, resold domains, hosting packages, free domain giveaways, seasonal ticket checkout, live fare inventory, supplier-branded promotions.

## 8. Release gates

1. Verify existing Universal and B2B revisions are present on `main` and preserved.
2. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run verify:purge`, `npm run build`.
3. Test `/seasonal` at 360, 390, 768 and 1280px with Bengali and English language, both segment tabs and keyboard input.
4. Click each B2C campaign and confirm the exact existing offer ID opens in the working enquiry dialog.
5. Click each B2B CTA and confirm `/b2b#b2b-subscription-enquiry` scroll/lead flow works.
6. Confirm source image paths load (current `/marketing/` assets only), no mobile horizontal overflow or large CLS.
7. Verify `/sitemap.xml`, seasonal canonical and social sharing metadata.
8. Confirm 24/7 staffing coverage, legal/agency licensing and support escalation policy before publishing that staffing message.
9. Keep supplier fares, airline partnerships, commission promises, free-domain claims and seasonal prices **unpublished** until written approvals exist.
10. Merge only after review, verification, and branch reconciliation with the latest `main`.

## 9. Remaining ambiguities (optional, not blockers)

- Does `Free Customized Domain` refer to SAFARIA-owned campaign subdomains or a future landing-page product for partner agencies?
- Which exact calendar season or festival will have **written supplier offers**, if any?
- The bottom handwritten item is unclear and may be a repeated mention of hosting/landing-page functionality. No guessed feature is implemented.
