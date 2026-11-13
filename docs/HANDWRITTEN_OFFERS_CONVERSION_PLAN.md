# SAFARIA — Universal Offers & Conversion Creative Implementation

**Source:** SAFARIA handwritten campaign planning photo supplied by the owner, 2026-11-14.  
**Status:** Frontend enquiry gateway implemented on an isolated review branch. Media prompts are production briefs; **images have not been generated or uploaded**.  
**Scope:** Public homepage CTA improvements, reusable data, and paid/organic creative strategy. Existing 26 offers, booking restrictions, and route logic are preserved.

## 1. Faithful transcription and uncertainty

The visible note is headed **UNIVERSAL** and contains:

1. BEST FARE – BEST DEAL
2. NO HIDDEN CHARGE
3. REFUND / RE-ISSUE / VOID
4. AFTER SALES SUPPORT (24/7)
5. SALAM AIR (REMITTANCE OFFER)
6. CHINA SOUTHERN (EXTRA BAGGAGE)
7. MALAYSIAN STUDENT FARE
8. TURKISH / SINGAPORE / QATAR / EMIRATES
9. BUSINESS CLASS
10. HIGHEST COMMISSION

The bottom also shows **SEASONAL**, but no legible offer details are included beneath the heading.

Uncertain relationships: "Highest Commission" appears beneath the premium airlines and Business Class; its actual scope is not defined. "Remittance Offer" may refer to a commercial arrangement rather than a publicly available passenger discount. Do not assume either one is active.

## 2. Mapping into the existing SAFARIA catalog — avoid duplicate offers

| Handwritten idea | Existing destination in the app | User-facing message | Publishing status |
|---|---|---|---|
| Best Fare / Best Deal | `fare-options` | Compare fares, route, baggage, transit and terms | Enquiry-safe |
| No Hidden Charge | `transparent-pricing` | Request a breakdown of fares, taxes and fees | Enquiry-safe; no absolute zero-fee promise |
| Refund / Re-Issue / Void | `refund` | Ask about change/refund process and applicable conditions | Enquiry-safe |
| After-sales support (24/7) | `after-sales` | Contact staffed 24/7 support for enquiries and follow-up | Owner-confirmed staffing; supplier actions not guaranteed |
| SalamAir remittance offer | `salamair` | Check applicable SalamAir itineraries and fare rules | Enquiry-safe; **remittance offer requires proof** |
| China Southern extra baggage | `china-southern` | Check student baggage eligibility | Enquiry-safe; **route, fare and verification apply** |
| Malaysian student fare | `malaysia-student` | Check student fare and baggage conditions | Enquiry-safe; authorization and eligibility needed |
| Turkish/Singapore/Qatar/Emirates | `premium-airlines` | Preferred-airline fare enquiries | Enquiry-safe; no partner logos or affiliation |
| Business Class | `business-class` | Ask about premium cabin availability and conditions | Enquiry-safe |
| Highest Commission | `/b2b#b2b-subscription-enquiry` | Ask about documented commission and partnership terms | **No highest/guaranteed commission claim** |
| Seasonal | None | Collect campaign brief before adding offers | No live promotion |

See `src/data/universal-marketing.ts` for canonical consumer-facing Bangla/English text.

## 3. UI implementation

- `src/components/universal-offers-strip.tsx` adds four core benefits, four specialized campaign entry points and an agency partnership CTA.
- `src/components/site-experience.tsx` mounts it **after FlightRouteCanvas and before the existing OffersBento**.
- Every consumer CTA calls `onSelect(offerId)`, reusing the existing route/offer enquiry dialog.
- Agency CTA goes to `/b2b#b2b-subscription-enquiry`.
- `data-campaign-id` on click targets enables future, consent-aware funnel instrumentation. It does **not** represent analytics already configured.
- No new backend call, payment, booking, airfare inventory, guarantee, airline affiliation or fare amount is introduced.
- All cards use native buttons with visible text, keyboard focus and mobile-responsive layout.
- Source catalog remains at **26 offers**, not 26 plus duplicate campaign entries.

## 4. Funnel architecture — separate audiences

### B2C visitor
Creative → homepage / direct offer enquiry → route/date/passenger details → WhatsApp draft → visitor presses Send → manual quote follow-up.

**Important:** Tracking an outbound WhatsApp click is not tracking a sent message, confirmed booking or sale.

### Student and parent
Student problem creative → directly open `china-southern` or `malaysia-student` enquiry → verify dates, student status, destination, fare bucket and applicable baggage → written quotation.

### Premium cabin traveller
Quality and comfort creative → `business-class` enquiry → route and cabin requirement → availability/conditions confirmation.

### B2B agency
Pain-point creative → `/b2b` → six desks explained → verified partnership enquiry → manual credential review and commercial terms → membership only after authorized approval.

## 5. Nano Banana Pro universal visual rule

Attach the **real SAFARIA logo**, a screenshot of the current site and, when relevant, a genuine airline or destination reference. Maintain Emerald `#041713`, Forest `#062B27`, Champagne Gold `#CFB57C`, Ivory `#F3F0E7`, restrained Navy `#10243A`.

Use luxury documentary / editorial travel photography rather than generic AI visuals: natural human expression, correct South Asian representation, geographically accurate airports and destinations, subtle editorial grain, realistic camera optics and naturally lit skin. Design for one visual idea per artwork. No fake airline logos, invented flight prices, pseudo-UI, fake 5-star badges, fabricated testimonials or guaranteed outcomes.

**Website:** generate **text-free photography**; render all headings, CTAs, disclaimers and accessibility labels in HTML. Use 16:9, 1600×900 for wide hero imagery, 4:3 1200×900 for cards, 1200×630 for link preview. Preserve visual negative space.

**Social:** 1080×1350 (4:5) is the default feed master; derive 1080×1920 (9:16) story and 1080×1080 (1:1) square. Either create images without text and apply exact Bangla copy in the layout tool, or manually proofread generated typography at 100% size. Never burn small terms into decorative artwork.

## 6. Individual image production briefs

These are copy-ready **image-scene instructions**. Apply the universal visual rule above, then add the specified headline and CTA separately in a branded design overlay.

### W01 — Universal Trust, Website

**Output:** 1600×900 WebP, website hero-adjacent background `/images/campaigns/universal-trust.webp`.  
**Prompt:** "Create a photographic luxury travel editorial scene at a modern international airport with an authentic Bangladeshi traveller calmly reviewing travel documents beside panoramic terminal glazing, aircraft at a believable distance, champagne-gold sunrise glow on dark emerald structural glass, premium contemporary airline-ad atmosphere, impeccably natural skin and hands, precise airport architecture, 40% dark visually quiet negative space on the left, sophisticated restrained composition, no text, no logo, no airline insignia, photorealistic, not a digital illustration."  
**Overlay:** "সঠিক ফেয়ার। পরিষ্কার শর্ত। নির্ভরযোগ্য ফলো-আপ।"  
**CTA:** "কোটেশন অনুরোধ করুন" → existing enquiry.

### S01 — Fare Choices

**Output:** 1080×1350 (4:5), Meta feed, `s01-fare-choices.webp`.  
**Prompt:** "Candid documentary airport departure scene: a Bengali young professional with a compact carry-on studying two realistic flight itinerary printouts in a quiet upscale terminal lounge. Natural window light, subtle deep emerald palette in architecture, pale gold highlights, beautiful unforced human moment, realistic passport and paper shapes without visible personal data, top 35% clean space for large Bangla headline, ultra-premium editorial travel photography, no text or logos."  
**Headline:** "ভাড়া দেখবেন, শর্তও বুঝবেন।"  
**Support:** "ফেয়ার, ট্রানজিট ও ব্যাগেজ মিলিয়ে অপশন যাচাই করুন।"  
**CTA:** "ফেয়ার অপশন জানুন" → `fare-options`.

### S02 — Transparent Fare Breakdown

**Output:** 1080×1350, `s02-fare-clarity.webp`.  
**Prompt:** "Editorial tabletop photograph of two unlabeled realistic boarding-pass-size itinerary documents and a clean printed fare breakdown sheet, premium dark green desk, a human hand pointing gently at separate rows, sharp readable structure but no real names, no fake prices, subtle gold pen and natural daylight, minimalist composition with generous text overlay area. No money flying, no neon, no text or logos."  
**Headline:** "টিকিটের ভাড়া কত? চার্জ কত?"  
**Support:** "কনফার্ম করার আগে লিখিত ফেয়ার ব্রেকডাউন চান।"  
**CTA:** "চার্জ জেনে নিন" → `transparent-pricing`.

### S03 — AfterCare, Changes and Refunds

**Output:** 1080×1350, `s03-aftercare.webp`.  
**Prompt:** "Believable premium customer-support editorial portrait of a professional Bangladeshi travel coordinator helping a traveller review flight change details on a laptop across a desk, empathetic but not staged, soft office daylight, emerald textured background, gold accessories used sparingly, screen intentionally out of focus with no invented brand UI, ample dark negative space for headline, photorealistic. No headset call-centre cliché, no text."  
**Headline:** "টিকিটের পরেও প্রশ্ন আছে?"  
**Support:** "Refund, Re-Issue ও Void-এর শর্ত জানতে অনুরোধ করুন।"  
**CTA:** "সহায়তা চান" → `refund` or `after-sales`.  
**Updated decision:** Owner confirms 24/7 staffing. Say "24/7 staffed support for questions and follow-up" only; do not guarantee airline action or a specific response-time SLA.

### S04 — China Southern Student Baggage

**Output:** 1080×1350, `s04-china-student.webp`.  
**Prompt:** "Authentic Bangladeshi university student in a bright airport check-in area beside one neatly packed large suitcase, holding a generic admission envelope with no real personal information, optimistic natural expression, subtle modern architectural references to international travel, genuine documentary portrait, dark emerald/soft gold color-grade, polished premium advertising photography, clear upper image area for copy, no airline logo, no text, no visible baggage weight promise."  
**Headline:** "চীনে পড়তে যাচ্ছেন?"  
**Support:** "China Southern-এর স্টুডেন্ট ব্যাগেজ সুবিধার যোগ্যতা যাচাই করুন।"  
**CTA:** "ব্যাগেজ নিয়ম জানুন" → `china-southern`.

### S05 — Malaysia Student Travel

**Output:** 1080×1350, `s05-malaysia-student.webp`.  
**Prompt:** "Natural photograph of two Bangladeshi students preparing for university travel at a bright modern airport, smart modest casual clothes, travel bags, unmistakably realistic human hands and faces, subtle Malaysian terminal architecture details without invented signage, morning sunlight, warm editorial storytelling, emerald airport glass/soft gold color grading, no text, no airline branding, spacious composition for headline."  
**Headline:** "মালয়েশিয়ায় নতুন অধ্যায়?"  
**Support:** "যোগ্য স্টুডেন্ট ফেয়ার ও ব্যাগেজ অপশন যাচাই করুন।"  
**CTA:** "স্টুডেন্ট ফেয়ার দেখুন" → `malaysia-student`.

### S06 — SalamAir / Expat Fare Enquiry

**Output:** 1080×1350, `s06-salamair-expat.webp`.  
**Prompt:** "Emotionally grounded airport family reunion moment: a Bangladeshi expat traveller with cabin bag greeting family at the arrivals terminal, believable expressions, modern airport environment, documentary-style mid-range photo with natural skin texture and dignified presentation, restrained emerald and warm gold tonal balance, headline negative space, no airline logos, no fake ticket, no text."  
**Headline:** "বিদেশযাত্রার ফেয়ার আগে যাচাই করুন।"  
**Support:** "SalamAir-এর প্রযোজ্য রুট ও শর্ত সম্পর্কে জানুন।"  
**CTA:** "ফেয়ার যাচাই করুন" → `salamair`.  
**Restriction:** Do not mention a special "remittance offer" until official written terms are supplied.

### S07 — Premium / Business Class

**Output:** 1080×1350, `s07-business-class.webp`.  
**Prompt:** "Extremely realistic premium long-haul business-class cabin photography with elegant seat geometry, soft ambient warm light, deep midnight emerald textiles, ivory trim, brushed champagne metal, one adult traveller photographed discreetly from behind looking out of an aircraft window, luxury magazine aesthetic, accurate aircraft interior engineering, no imitation of a specific airline cabin, spacious area for copy, no text or logos."  
**Headline:** "আপনার পরের যাত্রা, আরও পরিশীলিত।"  
**Support:** "পছন্দের এয়ারলাইনে Business Class কোটেশন চান।"  
**CTA:** "Business Class জানুন" → `business-class`.  
**Restriction:** Do not claim partnerships with Turkish, Singapore, Qatar or Emirates.

### S08 — B2B Commission / Agency Partnership

**Output:** 1080×1350, `s08-agency-partner.webp`.  
**Prompt:** "Authentic Bangladesh-based boutique travel agency workspace in Dhaka with two professional adult agency operators, one discussing a structured travel quotation with the other, realistic laptop and desk without fabricated SaaS screen, polished commercial documentary style, elegant deep emerald walls, subtle champagne gold trim, confident collaborative human emotion, negative space for bold Bangla message, no unreal luxury office, no text or airline logos."  
**Headline:** "কমিশনের পাশাপাশি দরকার পরিষ্কার হিসাব।"  
**Support:** "SAFARIA B2B পার্টনারশিপ ও কমিশনের শর্ত জানতে আবেদন করুন।"  
**CTA:** "এজেন্সি পার্টনারশিপ" → `/b2b#b2b-subscription-enquiry`.  
**Restriction:** Do not advertise "highest commission" without verified competitor comparison and signed supplier terms.

### S09 — AfterCare Carousel Explainer

**Output:** three separate 1080×1350 frames with consistent real-life supporting photographs, `s09-aftercare-01` through `03.webp`.  
**Prompt:** "Create a restrained premium three-image editorial photo series with identical emerald/gold brand grading showing (1) traveller discovering schedule change on a phone, (2) advisor confirming change and refund conditions against documents, (3) traveller receiving a clear written follow-up. Realistic Bangladeshi people and genuine travel environments, no fake UI, no invented fees, no promised approval, no text."  
**Frame captions:** "পরিবর্তন দরকার?" / "শর্ত আগে জানুন" / "ফলো-আপের অনুরোধ করুন".  
**CTA:** "Refund / Re-Issue সহায়তা" → `refund`.

### S10 — Universal Fare + Care Collection Cover

**Output:** 1080×1350, `s10-universal-cover.webp`.  
**Prompt:** "Luxury travel brand campaign key visual, an elegant modern terminal concourse with one single realistic aircraft viewed through a tall glass wall at blue hour, illuminated gold light lines naturally embedded in the architecture, extremely dark refined emerald foreground with large protected copy area, photographic realism, no vectors, no layered random icons, no fictitious airline branding, no text."  
**Headline:** "SAFARIA UNIVERSAL"  
**Support:** "Fare Options · Clear Charges · After-Sales Enquiries"  
**CTA:** "ভ্রমণের কোটেশন চান" → homepage.

## 7. Confirmed GTM decisions — 2026-11-14

These are direct owner selections, not market research findings:

- **Audience mix: 50% B2C / 50% B2B** (option 1C). Split any approved test spend and lead-handling capacity 50/50. This is a starting hypothesis, not proof that the two audiences will have equal acquisition costs.
- **24/7 staffed customer-support operation** (option 2A), confirmed by the owner. Allowed public wording: `24/7 staffed support / ২৪/৭ সাপোর্ট টিম` for enquiries and follow-up. Do **not** claim guaranteed 24/7 airline action, refunds, reissues, emergency waiver resolution or specific response times without separate evidence.
- **Supplier agreements still under negotiation** (option 3D). Therefore airline inventory, fare guarantees, confirmed ticketing, actual commissions, airline sponsorship, package margins and automated payments must not be advertised as live. Treat B2C as an enquiry/interest funnel and B2B as early partner registration, not completed ticketing transactions or active guaranteed memberships.

### Funnel emphasis

**B2C (50% of testing):** Fare clarity, transparent charge breakdown, student travel eligibility, Business Class options and 24/7 support contacts. CTA: `কোটেশন / অপশন জানতে অনুরোধ করুন`. Until verified supplier fulfillment exists, qualify interest without promising a fare or confirmed seat.

**B2B (50% of testing):** Agencies struggling with dispersed fare requests, inconsistent follow-up, payment reconciliation and after-sales workflows. CTA: `এজেন্সি পার্টনারশিপে আগ্রহ জানান`. Emphasize six desk workflow demos, 24/7 staffing and a verification-first commercial process. Avoid implying live reseller inventory, agent commissions or guaranteed monetary outcomes.

### Six additional B2B Nano Banana Pro briefs

Each prompt inherits the global SAFARIA creative rules and 1080×1350 feed crop. Place copy and CTA as editable overlay after generating text-free photorealistic imagery. Derive 1080×1920 story and 1080×1080 square variants after proofing.

**S11 — Lost Requests (B2B)**: "A believable owner of a small Dhaka travel agency at a dark emerald-toned desk, carefully reviewing several printed travel request forms beside a phone, natural daylight, real workspace not a luxury call center, one human face showing quiet concentration, elegant photography with negative space in upper third, no readable private details or fictitious digital UI, no logos, no text." Headline: `কোটেশন রিকোয়েস্ট হারিয়ে যায়?` Supporting: `SAFARIA-এর সংগঠিত B2B ওয়ার্কফ্লো দেখুন।` CTA: `ডেমোর আগ্রহ জানান` → `/b2b`.

**S12 — Fee Clarity (B2B)**: "Close editorial shot of a travel-agency operator reviewing generic supplier cost and service fee sheets on a desk, no numerical rates, no fictional profits, subtle champagne-gold pen, emerald and ivory tones, premium product documentary photo, no text." Headline: `ফেয়ার আর চার্জের হিসাব পরিষ্কার?` Supporting: `Cost, fee এবং margin tracking-এর ওয়ার্কফ্লো দেখুন।` CTA: `B2B জানুন` → `/b2b`.

**S13 — 24/7 Contact (B2B)**: "A genuine Bangladeshi travel support coordinator working at night in a realistic modest office, warm monitor glow and understated emerald backdrop, authentic professional environment, calm focused demeanor, no airline screens or impossible emergency rescue imagery, enough negative space for typography, no text." Headline: `রাতেও যোগাযোগের প্রয়োজন?` Supporting: `SAFARIA-এর ২৪/৭ সাপোর্ট টিমের সাথে কথা বলুন।` CTA: `পার্টনারশিপ জানুন` → `/b2b`. Disclaimer in accompanying caption: airline decisions and supplier hours vary.

**S14 — Six Desks Preview (B2B)**: "Premium understated editorial scene of an authentic travel-agency manager explaining a desktop operations dashboard to a colleague, monitor deliberately blank/unreadable to avoid invented SaaS capabilities, neutral contemporary workspace, dark emerald/ivory/gold grading, cinematic realism, no text." Headline: `এজেন্সির কাজ, একসাথে সংগঠিত।` Supporting: `SAFARIA-এর ৬টি অপারেশনাল ডেস্কের ডেমো সম্পর্কে জানুন।` CTA: `ডেমোতে আগ্রহ জানান` → `/b2b`.

**S15 — Non-IATA Enquiry (B2B)**: "Authentic independent travel-agency owner in a Bangladesh shopping district, seated in their neat small office, travel brochures and unlabeled laptop, understated human dignity, warm real sunlight, realistic street-through-window hints, emerald/ivory color grading, clear upper headline area, no airline logos, no text." Headline: `নিজস্ব GDS নেই?` Supporting: `ওয়ার্কফ্লো ডেমোতে আগ্রহ জানাতে GDS লাগবে না।` CTA: `B2B আগ্রহ নিবন্ধন` → `/b2b`. Clarification: this does not imply ticketing rights.

**S16 — Partnership Pre-Registration (B2B)**: "Editorial handshake across the desk between two professional Bangladeshi travel entrepreneurs, realistic office, no branded uniforms, contracts turned face down, natural skin tones and documentary composition, premium emerald-green and gold palette, honest collaborative atmosphere, no fake seals, no text." Headline: `SAFARIA B2B পার্টনারশিপ` Supporting: `এখন আগ্রহ নিবন্ধন করুন; শর্ত চূড়ান্ত হলে জানানো হবে।` CTA: `আগাম নিবন্ধন` → `/b2b#b2b-subscription-enquiry`.

### 14-day balanced organic and paid-test sequence

| Day | Audience | Asset | Objective | Destination |
|---|---|---|---|---|
| 1 | B2C | S10 | Trust and brand recall | `/` |
| 2 | B2B | S11 | Agency problem recognition | `/b2b` |
| 3 | B2C | S01 | Fare-option enquiries | `/#sf-universal` |
| 4 | B2B | S12 | Cost clarity | `/b2b` |
| 5 | B2C | S02 | Fee transparency | `/#sf-universal` |
| 6 | B2B | S13 | Support differentiation | `/b2b` |
| 7 | B2C | S03 | Aftercare interest | `/#sf-universal` |
| 8 | B2B | S14 | Six desks / demo interest | `/b2b` |
| 9 | B2C | S04 | China student interest | `/#sf-universal` |
| 10 | B2B | S15 | Independent agency accessibility | `/b2b` |
| 11 | B2C | S05 | Malaysia student interest | `/#sf-universal` |
| 12 | B2B | S16 | Partner preregistration | `/b2b` |
| 13 | B2C | S07 | Business Class enquiry interest | `/#sf-universal` |
| 14 | B2B | S08 | Agency partnership | `/b2b` |

Review lead quality weekly and reallocate only after sufficient qualified-lead data. An outbound WhatsApp draft is not a confirmed customer message. If any campaign induces fare purchase expectations that cannot yet be fulfilled, stop that campaign until supplier and licensing gates clear.

### Success metrics (separate B2C / B2B dashboards)

1. Reach, landing-page views and outbound CTA clicks by campaign ID/UTM.
2. **B2C**: enquiries actually submitted; valid routes/dates; response acknowledgment; quote provided only where authorized; eventually completed bookings when real.
3. **B2B**: verified agency leads, complete profile, demonstration requested/completed, written commercial terms issued after agreements, activated members only when payments and access controls are live.
4. Operating metric: record 24/7 request timestamps and real first-human-response distribution before publishing any response-time SLA.
5. Calculate `Cost Per Qualified Lead = Ad Spend / Qualified Leads`, not ad spend divided by clicks.

## 8. Launch checklist and measurable funnel

1. Supply legally usable original logo and approved real destination/airport photos.
2. Generate W01 and S01–S10 with Nano Banana Pro. Review human anatomy, geography, aircraft details and rights.
3. Compress resulting photos to reasonable responsive WebP sizes. Generate separate mobile crops; maintain image aspect ratio and avoid layout shifts.
4. Do **not** add a photo URL to the live site until the corresponding file exists in `public/images/campaigns`.
5. Confirm business entity, supplier ticketing authority, commission agreements and actual support coverage before upgrading claim strength.
6. Use unique campaign URLs with UTMs, e.g. `?utm_source=facebook&utm_medium=paid_social&utm_campaign=sf_universal_202611&utm_content=s01_fare_choices`.
7. Obtain consent and configure a privacy-compliant measurement setup before collecting lead-level analytics. Count click to enquiry, WhatsApp draft open, verified submitted lead, valid quote, booking, revenue separately.
8. Add explicit lead-source fields to CRM only after data-policy and production verification. Never infer sent WhatsApp messages from outbound clicks.
9. QA Bangla and English text at 360/390/768/1280px widths, keyboard interaction, focus visibility and mobile scroll.
10. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run verify:purge`, `npm run build`, and browser checks on the full checkout of the PR branch.

## 9. Commercial verification notes

- **China Southern** publishes international student baggage rules with route, age, status, fare and document restrictions: https://www.csair.com/sg/en/tourguide/luggage_service/checked_luggage/value_declaration/ . No baggage amount may be promised generically.
- **Malaysia Airlines** describes MHexplorer student benefits and eligibility at https://www.malaysiaairlines.com/my/en/student-portal/mhexplorer-login.html . SAFARIA must confirm eligible distribution and route before selling or quoting program-specific benefits.
- **SalamAir** official promotions change frequently: https://www.salamair.com/en/promotion . The handwriting's remittance offer was **not independently confirmed** by the reviewed public sources; do not display it as active.
- **Turkish Airlines** student rules are described at https://www.turkishairlines.com/en-sg/student-flight-discount/ . Do not reuse the airline's brand marks without permission.

External airline documentation verifies that programs of this type exist, **not** that SAFARIA has a ticketing partnership, entitlement, guaranteed fare, commission or fulfillment capability.

## 10. Remaining evidence and launch gates

- Collect formal confirmation of the 24/7 staffing rota, escalation protocol and scope; owner reports it is staffed, but quantitative SLA is not independently validated.
- Obtain written supplier/airline authorization and public-offer approval before using airline-specific promotional fares, guaranteed refund results, volume allocation claims, commission rates or guaranteed rates.
- The handwritten SalamAir remittance benefit remains **unconfirmed**.
- The handwritten Seasonal header has no visible offer details, so no seasonal promotion was invented.
- The 50/50 test split applies to qualified-lead acquisition, not proof of equal unit economics.
- Pre-register B2B interest and offer appropriate workflow demos. Never activate paid membership or booking until regulatory, supplier, payment and privacy gates pass.
