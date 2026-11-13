# SAFARIA TOURS & TRAVELS
## WEBSITE-FIRST CREATIVE SYSTEM + NANO BANANA PRO MASTER PROMPT LIBRARY
**Creative edition:** 1.0 | **Source audit:** 13 November 2026 | **GitHub branch:** `main` | **Head:** `e493c46dc59db9752305181861a69a0cbda28aaa`

**Website:** https://safaria.vibing.world/  
**Agency landing:** https://safaria.vibing.world/b2b  
**Primary B2B contact path:** on-page application, then WhatsApp draft; submission or enquiry is NOT an issued ticket, paid subscription, or approved trial.

> **Deliverable scope:** Creative strategy, visual sourcing workflow, full generation prompts, exact placements and dimensions, 26-offer content matrix, paid/organic repurposing, production QA, and implementation handoff. Images are specifications to produce in Nano Banana Pro; this document does not represent already-generated media.

---

# 01 — WHAT THE SOURCE CODE ACTUALLY CONTAINS

Verified from the repository's current `main` source, not from hypothetical mock-ups:

- `src/components/site-experience.tsx`: homepage header and live Three.js/SVG Journey Atlas; decorative skyline image `public/images/skyline.webp`; `FlightRouteCanvas`; offers, destination explorer, travel studio, agency section, WhatsApp channel.
- `src/components/offers-bento.tsx` + `src/data/offers.json`: 26 separately named service offers, grouped into `flights`, `student`, `saudi`, `premium`, `care`, `services`. Current cards are mostly CSS/text rather than photographic.
- `src/components/destination-explorer.tsx` + `src/data/destinations.json`: 33 coded location entries, including 8 Bangladesh airports, without a real destination-image field/card photo system. Codes like `LON`, `YTO`, `NYC` and `FL` should not be represented as single airport IATA codes.
- `src/components/travel-studio.tsx`: staged travel enquiry form. It is not a real-time fare search or automated confirmed ticketing engine.
- `src/components/agency-portal.tsx`: homepage B2B promotion and eligibility/pricing explanation.
- `src/components/b2b-landing-client.tsx` + `src/components/b2b-three-hub.tsx`: separate agency acquisition funnel, four corridor hooks, 6 operational desks, pricing and manually reviewed pilot application.
- `src/config/constants.ts`: membership BDT 5,999/month, BDT 69,999/year; WhatsApp contact number +880 1674-178437; official channel configured; verify all pricing before paid publication.
- `docs/DESIGN_SYSTEM.md` and `design-tokens/DESIGN_TOKENS.json`: authoritative visual identity; local logo in `public/images/logo-inverted.webp`.
- `src/app/layout.tsx`: existing Open Graph artwork `public/images/social-share.jpg` at 1200×630; `/b2b` should receive a dedicated social preview asset if adding route-specific metadata.
- `docs/B2B_SUBSCRIPTION_LAUNCH_RUNBOOK_BN.md`: marketing/enquiry ready; live ticketing, payments and unverified unconditional guarantees remain restricted pending external approvals.

## Truth-first commercial copy rules

1. **Never say** “ticket confirmed,” “instant booking,” “live availability,” or “pay now” for a quotation CTA.
2. **Never show imaginary fares**, 100% refund guarantees, cheapest-price guarantees, airline partnerships or IATA accreditation.
3. **Never borrow the repository's hard-coded testimonials or 5-star ratings as proof** until each name, permission, service history and result is independently documented.
4. **Do not advertise** 10–15-minute quotation SLAs, 24/7 staffed support, zero penalties, percentage improvements, or 0% markup across all products without written substantiation. Conditional eligible-ticket 0% SAFARIA markup may be mentioned only after commercial/legal approval, with relevant exclusions adjacent.
5. The **72-hour pilot** is an **application subject to manual eligibility approval**. Never visually imply everyone gets automatic access.
6. For aviation imagery, show unbranded or appropriately licensed aircraft; do not add airline marks or “official partner” seals without rights.
7. All prices, routes and rules require operator review on publication day. On a branded ad, small disclaimer must remain readable: **“ফেয়ার, সিট ও শর্ত সংশ্লিষ্ট সরবরাহকারীর নিশ্চিতকরণ সাপেক্ষে।”**

---

# 02 — POSITIONING AND CREATIVE HIERARCHY

**Umbrella promise:** *Travel, coordinated with clarity.* / **“ভ্রমণের পরিকল্পনা, আরও স্পষ্টভাবে।”**

**B2C buyer:** Bangladesh-based domestic/international flyer, student, Saudi-bound expatriate, family traveller, business traveller. Motivations: dependable communication, clear quotations, understandable rules, supported planning. **CTA:** “ফ্লাইট কোটেশন চান” / “Request a quotation.” **Destination:** website flight quotation interaction, or the specific offer modal.

**B2B buyer:** Owner/operator of a small or growing Bangladesh travel agency. Motivations: fragmented sourcing, lost WhatsApp messages, booking status confusion, hidden charges, hard refund follow-ups, pressure to serve clients. **CTA:** “এজেন্সি পার্টনারশিপ সম্পর্কে জানুন” / “Explore agency partnership.” **Destination:** `/b2b`, not the generic homepage.

**Brand archetype:** understated premium global travel editorial meets a precise operations desk; recognizable Bangladesh roots, not a flashy OTA or discount bazaar.

**Compositional law:** One hero subject, one benefit, one CTA. Banners for the WEBSITE are usually **text-free photographic assets**; heading, price, button and disclosure remain HTML. Social posts get **short, intentionally typeset Bangla** and a composited authentic logo. Do not burn tiny terms inside AI-generated imagery.

**Visual grammar:** deep forest blacks, rich emerald midtones, champagne-gold route line (maximum 1–2 lines), ivory editorial negative space, warm natural skin tones, restrained navy for corporate, realistic documentary travel photography. No oversaturated neon, dollar-rain effects, holographic dashboards, futuristic spacecraft, fake city skylines, plastic skin, uncanny hands or cluttered collage panels.

**Brand tokens:** Emerald Night `#041713`, Forest `#062B27`, Champagne Gold `#CFB57C`, Ivory `#F3F0E7`, Navy `#10243A`; optional more luminous gold `#D6B779`. Types: Cormorant Garamond for English display, Noto Sans Bengali for Bangla, Inter for UI. **Logo is supplied; do not generate a new logo.**

---

# 03 — REFERENCE PACK / RESOURCES

**Mandatory reference inputs to upload in Nano Banana Pro where supported:**
1. Real logo: `public/images/logo-inverted.webp` (do not modify).
2. Brand's existing desktop concept: `design/atlas-desktop-concept.png`; mobile concept: `design/atlas-mobile-modal-concept.png` (use as brand/layout references, not to copy a fake rendered screenshot).
3. A desktop screenshot of the live `/` page and `/b2b` page, captured after checking the live URL. Keep screenshots as mood/layout reference only.
4. A legitimately licensed image of the destination, **or** an original owner-approved location photo when geographic truth is important.
5. Optional reference to current `public/earth-emerald.webp` to preserve the actual globe color/story.

**External sources:**
- Official Google Nano Banana Pro: https://deepmind.google/models/gemini-image/pro/
- Google's prompting guidelines: https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
- Unsplash commercial-use license: https://unsplash.com/license (review individual photo/person/trademark implications).
- Pexels commercial-use license: https://www.pexels.com/license/ (review model releases, trademark implications and endorsement restrictions).
- Wikimedia Commons licensing: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/licenses (per-image attribution and license requirements may apply).
- Natural Earth imagery for the existing globe: https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/ — already credited in repository docs.
- Bangladesh destination visual research: https://www.tourismbangladesh.com.bd/destinations (subject/location research, **not** an assumed image-reuse license).

**Research/search terms, not permission grants:** “Cox's Bazar beach aerial licensed”; “Sreemangal tea estate Bangladesh licensed”; “Dhaka airport departure hall licensing”; “Dubai skyline licensed editorial”; “Kuala Lumpur Petronas licensed”; “Saudi Jeddah aerial licensed”; “Bangladeshi travel agency operator workplace photography”; “passport counter travel flat lay stock”.

**Asset provenance ledger:** for every source store filename, image creator, URL, date downloaded, source license, attribution if needed, commercial restrictions, identity/logo releases if applicable, editor approval, and whether AI-modified. Do not use preview/watermarked/Getty/Pinterest images in commercial work without proper license.


## Nano Banana Pro production workflow (repeat for every asset)

1. Open Google's Gemini/AI Studio surface that exposes **Nano Banana Pro / Gemini 3 Pro Image**. Availability and export limits depend on the product/plan; confirm the selected model before each batch.
2. Upload the real SAFARIA logo, the relevant desktop/mobile brand concept, and — for destination photography — an authentic reference image you have the right to edit. Label each input by role, e.g., **Reference A = logo; B = website brand style; C = geographic subject**.
3. Paste the **global system prompt** in section 04, then one W/B/S asset brief. Keep WEBSITE MODE outputs text-free. Use explicit target aspect ratio: panoramic 3.16:1, 16:9, 4:3, 4:5, 1:1 or 9:16 as the brief dictates; if the current UI does not support an exact ratio, export a larger master and crop deliberately.
4. Explore 2–3 distinct scene compositions per brief: one human-centered, one architectural/documentary, one minimal/product-like, but select only the version faithful to the exact campaign concept. Do not accept repeated AI templates.
5. Choose the strongest realistic composition and run the **Realism** refinement in section 04. Correct geographic identity, skin/hands, interface hallucinations, typography and excessive visual effects.
6. For social, verify Bangla copy separately. Prefer a clean master image plus a typography/logo layer in a professional editor for pixel-perfect text. **Never use the text in AI art as the source of truth** for dates, price or eligibility.
7. Export a large archival PNG master, a compressed web rendition, and platform-specific recomposed social variants; record actual pixels and file size. Keep separate sources for editable headlines.
8. Check against the current website at mobile 360–430px, tablet and desktop, including dark text contrast, hover/focus, reduced motion and speed. Attach the image to the correct offer, destination or B2B desk, then publish only after operator sign-off.

**Default framing:** WEB = text-free environmental/editorial photography; SOCIAL = headline + one supporting line + one CTA + official logo; OG = logo + extremely short title + distinct B2C/B2B context.

---

# 04 — COPY/PASTE: GLOBAL NANO BANANA PRO SYSTEM PROMPT

**Use before every individual brief below.** Paste the SYSTEM PROMPT followed by the selected W/B/S brief. Upload logo and screenshots when relevant.

> You are SAFARIA Tours & Travels' senior visual creative director, commercial travel photographer, editorial art director and high-end image-production specialist. Design ONE premium, believable, conversion-focused marketing visual for a Bangladesh-founded global travel company. The brand already exists: do NOT redesign the official SAFARIA logo or invent competing logos. Treat the provided SAFARIA logo and website screenshots as authoritative references for identity and color. Art direction: dark emerald #041713, deep green #062B27, champagne gold #CFB57C, warm ivory #F3F0E7, restrained navy #10243A; subtle filmic color grading, natural human expressions, truthful location features, understated luxury, architectural clarity. Make the image sophisticated enough for a premium airline-concierge website, not a generic travel-agency sale template. Distinguish photographed reality from interface graphics. Compose intentionally around the real website's HTML text and buttons; never obstruct the interactive 3D globe. Maintain natural lens perspective, correct anatomy, true-to-life airports/architecture/geography, and authentic Bangladeshi subjects where people are featured. No invented airline affiliation, no fake tickets, no random prices, no official accreditation marks. If instructed as WEBSITE MODE, return a **clean text-free artwork** with the specified clear copy-safe area; text will be added separately by developers. If instructed as SOCIAL MODE, place only the exact verified headline, subline, CTA and brand logo supplied, with meticulous, legible Bangla typography (Noto Sans Bengali-like); no extra slogans, no new claims. Render a clean editorial result at the requested orientation, preferably highest available resolution. Treat the output as a real commercial brand asset, not an AI showcase.

**Negative guidance to append:** No random typography; no impossible airport runway/aircraft; no inaccurate sacred site; no distorted passport or counterfeit visa; no duplicated people; no warped logo; no giant 3D plane covering faces; no neon cyan/purple, chrome gradients, overloaded cards or decorative icons; no tiny illegible disclaimer; no altered airline logo; no fake “verified partner,” “IATA,” “guaranteed” or reviews.

**Exact-logo instruction:** If the generator cannot faithfully place the provided logo, create a clean area for it; composite the real original logo afterward in an image editor. Never accept a misspelled/replicated AI wordmark.

**Typography instruction:** For Bangla-language SOCIAL exports, proofread every character after export. If one glyph is wrong, produce a text-free background and place authentic font-rendered type in Figma/Canva/Photoshop. Do not approve the generated image based only on aesthetics.

**Standard iteration commands:**
- **Realism:** “Keep composition and brand palette unchanged. Remove CGI gloss and synthetic texture; introduce natural shadow transitions, real photographic skin texture, believable depth of field, authentic local detail.”
- **Simplify:** “Remove 40% of decorative objects. One headline hierarchy, one primary subject, one CTA zone, maximum negative space. All brand elements remain intact.”
- **Correct brand:** “Only recolor the grade/surfaces to exact SAFARIA brand tokens. Lock subjects and composition. Do not change logo, faces, text or geography.”
- **Responsive extension:** “Extend the environment naturally into a [4:5 / 9:16 / 21:9] canvas without stretching the subject. Preserve the same subject, lighting, logo and facts. Reserve the specified safe text zone.”

---

# 05 — WEBSITE ASSET MASTER PROMPTS

All WEB images should default to **TEXT-FREE** unless explicitly identified as Open Graph artwork. The site should continue rendering headings and CTAs natively, with localized, accessible HTML copy.

## W01 — Homepage: The SAFARIA Departure Atmosphere
**Place:** Existing `.hero-skyline` in `src/components/site-experience.tsx`, currently `/images/skyline.webp`; complement, DO NOT replace the 3D Journey Atlas.  
**Export:** panoramic 2400×760 (approximately 3.16:1), WebP; mobile alt crop 1080×520.  
**Prompt:**
> WEBSITE MODE. Create a subtle, low-contrast panoramic background plate of a real-feeling Dhaka airport-side city horizon just before sunrise. A few distant silhouettes of terminal structures, soft layered urban haze and gold illumination near the horizon, extremely understated; no readable brand marks, no airliner placed in the foreground. 75% dark emerald atmospheric negative space across the upper frame so the website's Cormorant/Noto heading stays clear. The bottom third gently carries the skyline silhouette. Premium understated film photography with desaturated green/blue blacks and one natural warm highlight. Image is a background **behind** an interactive animated globe and editorial left-hand hero; do not paint text, buttons, maps, route badges or a globe into the file.

## W02 — Homepage Flight Corridor: Journey Is in Motion
**Place:** Optional low-contrast atmospheric artwork behind `FlightRouteCanvas` (do not replace aircraft route interactions).  
**Export:** 2000×800, WebP.  
**Prompt:**
> WEBSITE MODE. Filmic twilight aerial view of a real airport runway edge and faraway city, photographed from an elevated observation position, atmospheric depth and restrained gold taxiway glints. Architectural rather than promotional. Horizon occupies upper third, 70% emerald shadow for overlaid functional flight-route UI. Never render specific flight number, departure time, live-tracking panel, radar blips, air-traffic data or boarding pass. Seamless crop across 16:9 and 21:9; avoid visible passengers or logos.

## W03 — Service Category: Flights / Clear Fare Enquiry
**Place:** `OffersBento` `flights` category editorial card.  
**Export:** 1200×900 (4:3), WebP.  
**Prompt:**
> WEBSITE MODE. Photorealistic travel editorial close-up of a generic white-and-charcoal airplane wing viewed from an airport window, morning apron light, gentle champagne-gold sunlight reflected in the glass, subtle emerald shadows. Focus on quiet anticipation and clarity, not discount urgency. Deep green safe space in bottom left for HTML copy. No readable flight numbers, airline insignia, invented fare charts or text.

## W04 — Service Category: Student Journeys
**Place:** `OffersBento` `student` category; use for China/Malaysia student section variant.  
**Export:** 1200×900, WebP.  
**Prompt:**
> WEBSITE MODE. Natural documentary-style photograph of a Bangladeshi university student in their early 20s, modest modern travel clothes, seated in a bright airport lounge with carry-on suitcase and a closed passport wallet beside them, looking toward the departures windows with quiet optimism. Genuine skin and fabric texture; understated bags, no visible boarding passes or institutional logos. Warm morning light, soft green-toned foreground, aspirational but not staged. Compose with 35% dark negative space for an optional HTML title and eligibility note. Avoid implying extra baggage is guaranteed.

## W05 — Service Category: Saudi & Expat Travel
**Place:** `OffersBento` `saudi` category.  
**Export:** 1200×900, WebP.  
**Prompt:**
> WEBSITE MODE. Emotionally restrained, documentary-real scene of a Bangladesh-origin expat traveller at the departures hall, adult man with neatly kept modest travel clothes and carry-on, communicating warmly with family over a mobile phone without readable screen. A softly blurred terminal background conveys the Dhaka-to-Gulf corridor, while subtle warm lights bring humanity. Maintain premium dark emerald/gold grade. Single subject with calm positive expression; no airline branding, no promise about price, refunds or work permits. Blank lower band for native site text.

## W06 — Service Category: Premium & Business Travel
**Place:** `OffersBento` `premium` category.  
**Export:** 1200×900, WebP.  
**Prompt:**
> WEBSITE MODE. Sophisticated wide-angle commercial aviation photograph of a generic premium aircraft cabin, elegant charcoal seating with natural warm brass-like accents, polished but realistic textures, gentle morning window light, no passengers in focus. No logos, no fictional airline class names. Architectural composition aligned to the right, 40% deep shadow on left for HTML heading; quiet premium travel mood, not exaggerated gold luxury.

## W07 — Service Category: After-Sales / Care
**Place:** `OffersBento` `care` category.  
**Export:** 1200×900, WebP.  
**Prompt:**
> WEBSITE MODE. Authentic Bangladeshi travel support specialist in a calm modern agency workspace, reviewing an itinerary on a laptop while listening attentively on a headset, the screen turned away/unreadable. Soft natural side light, dark forest-green environment, a gold notebook edge. Convey accountable communication, patient support and follow-up rather than mythical instant refunds. Natural small-office realism; no high-tech hologram and no 24/7 icons. Negative space on left for HTML copy.

## W08 — Service Category: Tours, Hotels & Transfers
**Place:** `OffersBento` `services` category.  
**Export:** 1200×900, WebP.  
**Prompt:**
> WEBSITE MODE. Elevated hospitality travel editorial: refined but realistic hotel lobby window overlooking a destination city, a discreet leather weekender and simple travel notebook on a table, car pickup point visible far outside; layered natural daylight, subtle emerald and ivory styling. Communicate holistic trip coordination without pretending any hotel or driver booking is confirmed. No hotel or vehicle brand marks; intentional clean upper-left region for HTML heading.

## W09 — Destination Card: Cox’s Bazar (CXB)
**Place:** `DestinationExplorer`, CXB card and CXB detail dialog after adding an image field.  
**Export:** 1200×1500 portrait master, 1600×900 wide detail, WebP.  
**Prompt:**
> WEBSITE MODE. Accurate-feeling fine-art travel photograph of Cox’s Bazar, Bangladesh, from an elevated coastal vantage: long pale sandy shoreline, soft blue-green Bay of Bengal, breaking parallel surf lines and real coastal vegetation, late-afternoon clear haze, no manufactured Maldives turquoise, no mountains or skyscrapers, no fantasy islands. Authentic geographic character is more important than cinematic effects. Compose a simple horizon in upper third and contrast-rich left-bottom area for the site's destination code and title. No text or watermark.

## W10 — Destination Card: Sylhet / Sreemangal (ZYL)
**Place:** Destination explorer ZYL; use true Sylhet-region reference photograph.  
**Export:** 1200×1500 portrait, 1600×900 detail.  
**Prompt:**
> WEBSITE MODE. Realistic Bangladesh travel photography of rolling tea gardens in the Sylhet/Sreemangal region, rich but natural tea-green hedgerows, winding path, distant mist-softened low hills and gentle dawn cloud, documentary rather than invented Alpine mountain peaks or Chinese terraces. Understated luxurious color treatment, subtle golden rim light, accurate Bangladeshi vegetation, natural weather. Leave an uncluttered area for native destination text, no captions painted into image.

## W11 — Destination Card: Jeddah & Riyadh Corridor
**Place:** JED/RUH destination tiles; create one accurate variant for EACH city, not a blended generic Saudi skyline.  
**Export:** 1200×1500 each.  
**Prompt:**
> WEBSITE MODE. Create a photorealistic editorial destination photograph of [JEDDAH OR RIYADH], Saudi Arabia. Use a user-supplied licensed reference photograph to preserve the city's identifiable real skyline, materials and geography. Late golden hour, elegant contemporary cityscape, authentic desert-climate light, understated deep emerald color grade. No invented landmark, no misleading pilgrimage monument, no airline branding, no fake ticket or price. Keep substantial clean lower-third negative space for SAFARIA's actual location text.

## W12 — Destination Card: Dubai / Kuala Lumpur / China
**Place:** DXB, KUL, CAN or BJS cards; generate separate images with location references.  
**Export:** 1200×1500 each.  
**Prompt:**
> WEBSITE MODE. Premium authentic photograph of [EXACT CITY, COUNTRY], centered on one geographically recognizable REAL landmark verified by the reference image. Realistic urban haze, natural atmospheric perspective and the city's actual climate; quiet editorial grading of emerald night, warm ivory architectural highlights and subtle gold. Avoid fantasy skyline stitching and duplicate landmarks. Crop for portrait destination tile; keep title-safe negative space. Do not embed flight route, airport code, fare or words in the picture.

## W13 — Travel Studio: The Planning Moment
**Place:** Beside/below `TravelStudio` five-step form, preferably a subtle side editorial panel.  
**Export:** 1000×1350 portrait, optional 1920×900 wide.  
**Prompt:**
> WEBSITE MODE. Beautifully honest overhead-to-45-degree travel-planning photograph on an ivory café/worktable: real notebook with blank pages, closed passport cover without visible identity, compact camera, pen, smartphone face-down, and softly blurred airfield window beyond. Golden morning light; premium emerald accent from a desk accessory. Composition calm and tactile, not busy. No readable passport numbers, fake itineraries, brand logos, QR codes or screenshots. Reserve half the image area as clean photo texture so form content remains legible if layered by the website.

## W14 — B2B Hero: The Agency Control Desk
**Place:** `/b2b` hero, art positioned RIGHT or in a lower responsive secondary panel; keep current H1 and CTA HTML.  
**Export:** 2000×1100 landscape, 1080×1350 mobile crop.  
**Prompt:**
> WEBSITE MODE. Premium realistic Bangladesh B2B agency operations scene, not a call-center cliché: two adult travel professionals in a modern but believable small office in Dhaka, calmly comparing supplier quotations on laptops and paper checklists. Laptop screens intentionally unreadable and free of fabricated dashboards. One professional hands a written quotation document to the other; feeling of efficient teamwork. Soft lateral window light, deep green surfaces and restrained gold line accents. Subject cluster in right half; left half fades to dark emerald copy-safe zone. No airline, GDS or government logos; no made-up results, testimonials, live fare prices or financial guarantees.

## W15 — Six Operational Desks: Unified System Map
**Place:** `/b2b` intro above the six desks, optional website infographic illustration with labels built in HTML.  
**Export:** 1600×1000, WebP or clean SVG rebuilt by designer.  
**Prompt:**
> WEBSITE MODE. Design an editorial abstract information architecture illustration, no text: six distinct compact matte-emerald operational modules arranged in two neat rows around one central warm-gold network line, each represented by a unique SIMPLE conceptual motif: quotation document, booking reference, ledger, follow-up timeline, verification check, partner growth chart. Authentic functional diagram, flat-to-2.5D, sharp geometry, subtle soft shadows, quiet luxurious fintech/travel-SaaS aesthetic. Plenty of negative space. No fabricated UI screenshot, no numbers, no text, no chrome/neon/glow. Six modules exactly, not five or seven.

## W16 — FareDesk™: Requests Become Structured
**Place:** First desk card / B2B explainers.  
**Export:** 1000×750, WebP.  
**Prompt:**
> WEBSITE MODE. Visual still-life of three unbranded quotation sheets with clean blank form grids, organized on a dark emerald travel agent desk, a simple neutral route line linking origin and destination on a miniature paper map, warm angled daylight. Show the ACT of comparing route, fare rules and baggage information, never an actual invented wholesale fare amount or SLA. 40% negative space, gold hairline, high-end business editorial photography.

## W17 — BookingDesk™: Nothing Falls Through
**Place:** Second B2B desk card.  
**Export:** 1000×750.  
**Prompt:**
> WEBSITE MODE. A well-organized generic travel booking workflow photographed like a premium editorial desk: blank numbered request slips, neatly arranged status folders and a business laptop turned away. Evoke traceability, identity checks and clear task ownership. Matte emerald surface, crisp ivory paper, restrained gold tabs; no passport identities, no legitimate-looking PNR, no confirmed-ticket seal, no airline brand. Strong compositional order and simple empty header-safe zone.

## W18 — ClearMargin™: Every Charge in View
**Place:** Third B2B desk card.  
**Export:** 1000×750.  
**Prompt:**
> WEBSITE MODE. Tactile editorial still life of an anonymized invoice-style breakdown sheet on emerald desktop, with ruled blank line items, an unobtrusive calculator and a pencil; concept of transparent cost analysis and reconciliation. Do not render actual fare numbers, revenue figures, currency totals, claims of guaranteed profit or an operative finance screen. Champagne-gold precision details, human-scale realistic lighting and a clean composition.

## W19 — AfterCare Desk™: Follow-Up That Is Documented
**Place:** Fourth B2B desk card.  
**Export:** 1000×750.  
**Prompt:**
> WEBSITE MODE. Candid realistic office close-up of a Bangladesh travel support person making a supplier follow-up call while reviewing a simple printed case timeline with unreadable entries. Expression is focused and reassuring, not celebratory. Natural textured clothing and lighting, matte green desk partition, gold paper clip. Theme: a clearly tracked refund/change enquiry. Absolutely no “instant approved refund” proof, call-center wall screen, 24/7 signage or misleading finished result.

## W20 — Verified Workflow™: Verify Before Issuance
**Place:** Fifth B2B desk card.  
**Export:** 1000×750.  
**Prompt:**
> WEBSITE MODE. Privacy-preserving symbolic photograph of a closed generic passport holder, a blank passenger detail checklist with an understated physical checkmark, and a careful agent's hand aligning two sheets. High fidelity paper texture, premium emerald/ivory and warm gold. No actual readable passports, visa stamps, government seals, fictional successful audits or guarantees that airline penalties are impossible.

## W21 — PartnerGrowth™: A Clearer Agency Operation
**Place:** Sixth B2B desk card.  
**Export:** 1000×750.  
**Prompt:**
> WEBSITE MODE. Realistic strategic business planning scene: small independent Bangladesh agency owner reviewing a simple blank quarterly planning chart on paper with a colleague. Modern office, excellent natural skin realism, subdued navy-green with restrained champagne-gold accent. Communication and retention, not fictitious escalating commission rates or numeric growth promises. Keep 40% of composition uncluttered for native title and CTA.

## W22 — B2B Pilot/Membership: Invitation to Explore
**Place:** `/b2b` pilot/plan section; only after checking exact terms and active eligibility.  
**Export:** 1600×900.  
**Prompt:**
> WEBSITE MODE. Minimal quiet premium still life: an elegant dark emerald folder with the actual SAFARIA monogram added later, a single blank ivory onboarding checklist and a subtle gold clocklike arc suggesting a short supervised evaluation period. No literal fake approval stamp, no credit card, no payment success, no subscription activation and no free-ticket representation. Wide empty left area for native HTML heading “৭২ ঘণ্টার যাচাইসাপেক্ষ পাইলট” and application CTA. Sophisticated product photography, not loud price promotion.

## W23 — Trust/Contact Band: Speak With a Person
**Place:** Above website WhatsApp CTA or at the end of `/b2b`, not as a permanent obstructive floating banner.  
**Export:** 1600×600.  
**Prompt:**
> WEBSITE MODE. An understated human-centered editorial image: professional Bangladeshi travel coordinator in a quiet small office at afternoon light, viewed from a slight angle, holding a phone and ready to discuss a travel enquiry. Genuine warm expression, subtle emerald room, naturally gold light. Subject on right third, 65% pristine dark-emerald text space on left. No brand phone-screen UI, no chat-bubble forest, no fake WhatsApp verified check, no claim that any booking is already complete.

## W24 — B2C Social Preview / Open Graph
**Place:** Replace/upgrade `public/images/social-share.jpg` referenced in `src/app/layout.tsx` after approval.  
**Export:** 1200×630 JPG or PNG; do not rely on smaller body text.  
**Prompt:**
> SOCIAL MODE. Create a share-preview composition at exactly 1200×630, deeply premium Emerald Night background with one breathtaking realistically observed airport-dawn/travel-horizon photograph on right and controlled negative space on left. Only use the authentic supplied SAFARIA logo, and the exact large text “Your Gateway to Global Travel.” Secondary small line optional “Tours & Travels”. No additional claims, fare, phone or tiny CTA; every word must read correctly as a small sharing preview. Gold accent no more than 10% of image. Design should visually connect to the actual 3D globe brand, without depicting a duplicate live globe UI.

## W25 — B2B Social Preview / Open Graph
**Place:** `/b2b` route-specific Open Graph/Twitter sharing image; add route metadata.  
**Export:** 1200×630.  
**Prompt:**
> SOCIAL MODE. Exact 1200×630 B2B premium social-preview artwork: truthful Bangladesh independent travel-agency work environment photographed on right, deep emerald left, one elegant six-node gold workflow line behind the scene. Brand logo exact. Large Bangla headline: “আপনার এজেন্সি। আরও গোছানো অপারেশন।” Smaller supporting words: “Fare • Booking • After-Sales”. No numerical SLAs, no markup promise, no fabricated testimonials. One elegant small CTA line “safaria.vibing.world/b2b”. Proofread each Bengali character.

---

# 06 — SOCIAL PROMOTIONAL POSTER / FLYER MASTER PROMPTS

**Social default:** 1080×1350 vertical feed (4:5); also export 1080×1080 for grid and 1080×1920 for stories, each as a freshly recomposed variant rather than a stretched crop. For 9:16 allow generous clear upper/lower regions for platform overlays. Prefer no more than 12–16 Bangla headline words and one CTA. If generation produces imperfect Bengali, use text-free output and typeset externally.

For all briefs S01–S12 append the SYSTEM PROMPT and request SOCIAL MODE, adding the supplied original SAFARIA logo intact. Use dark emerald/gold/ivory; one visual focal point; no logos of airlines unless licensed. Website URLs printed in images are support elements; actual CTA on social platform must link/click through to the right landing destination.

## S01 — B2C: Flight Quote, Not a Guess
**Segment:** General airline/travel enquiries | **Link:** `/` then quotation interaction.
**Text exactly:**
- Headline: “ফ্লাইটের ভাড়া জানতে চান?”
- Subline: “রুট, ব্যাগেজ ও শর্তসহ কোটেশন অনুরোধ করুন।”
- CTA: “কোটেশন চান”
**Prompt:**
> Create a 4:5 premium travel editorial flyer with a believable close-up airport-window view, restrained airplane silhouette beyond the glass, rich dark emerald left copy panel and naturally lit sky on right. Gold accent divides copy from photography. Typography visually dominant but not enormous, aligned left, with the exact supplied Bangla copy and official SAFARIA logo; one gold CTA pill. Nothing resembling a final price or booking confirmation.

## S02 — B2C: Domestic Cox’s Bazar
**Segment:** Domestic leisure | **Link:** Cox's Bazar offer modal from homepage.
**Text exactly:**
- Headline: “ঢাকা থেকে কক্সবাজার?”
- Subline: “আপনার তারিখে ফ্লাইটের কোটেশন জানুন।”
- CTA: “ফেয়ার চেক করুন”
**Prompt:**
> Editorial aerial photo art direction of authentic Cox's Bazar Bangladesh surf and sandy shoreline, desaturated greens with warm sand, clean upper-left emerald overlay, a thin champagne-gold route arc from DAC to CXB with small truthful code labels only. Compose a travel magazine cover, not a neon beach-poster sale. Large exact Bangla text on solid copy-safe area; supplied logo and restrained gold CTA. No fabricated taka amount or “lowest fare” stamp.

## S03 — B2C: Students Going Abroad
**Segment:** Student flyers to China/Malaysia and others | **Link:** student offer modal.
**Text exactly:**
- Headline: “বিদেশে পড়তে যাচ্ছেন?”
- Subline: “যোগ্য স্টুডেন্ট ফেয়ার ও ব্যাগেজ শর্ত যাচাই করুন।”
- CTA: “বিস্তারিত জানুন”
**Prompt:**
> Candid aspirational image of a Bangladesh university student looking out an airport terminal window with a rolling suitcase and simple document pouch, natural human realism. Clean emerald text column on left, subtle gold airport wayfinding line, warmly balanced skin tones, premium student-lifestyle photography. Exact supplied Bangla hierarchy and original logo. No guaranteed extra baggage, no university acceptance seal or airline partnership logo.

## S04 — B2C: Saudi Expat Travel Enquiries
**Segment:** Bangladesh–Saudi flyers | **Link:** Saudi fare offer modal.
**Text exactly:**
- Headline: “জেদ্দা • রিয়াদ • মদিনা • দাম্মাম”
- Subline: “সৌদি রুটে আপনার ফ্লাইট কোটেশন চান।”
- CTA: “রুট জানান”
**Prompt:**
> Premium 4:5 Saudi expat-travel flyer, realistic warm airport hall and a single Bangladesh-origin traveller carrying a compact bag, a tasteful four-city typographic list at left in exact supplied Bangla. Subtle graphic flight route line, emerald shadows, golden departure-board atmosphere, accurate restraint. Never depict imaginary airline tickets, lowest-fare guarantee, visa acceptance or an airline endorsement.

## S05 — B2C: Umrah Coordination
**Segment:** Faith-aware traveller, family | **Link:** Umrah enquiry offer modal.
**Text exactly:**
- Headline: “ওমরাহ যাত্রার পরিকল্পনা?”
- Subline: “ভ্রমণ-সমন্বয় ও প্রযোজ্য শর্ত জানতে যোগাযোগ করুন।”
- CTA: “তথ্য চান”
**Prompt:**
> Respectful and geographically authentic pilgrimage travel editorial using a genuinely licensed Mecca or Madinah reference photo if one is supplied. Warm calm light, no manipulation of sacred architecture, no composite that falsely depicts proximity or access, no people with identifiable faces in worship close-up. Create elegant negative space for exact Bangla text and modest gold CTA; minimal embellishment, serious respectful tone. Do not claim visa or Umrah package confirmation.

## S06 — B2C: Business Travel
**Segment:** Corporate traveller & group coordinator | **Link:** corporate offer modal.
**Text exactly:**
- Headline: “টিম ট্রাভেল, আরও গোছানোভাবে।”
- Subline: “কর্পোরেট ও গ্রুপ ট্রাভেল কোটেশন অনুরোধ করুন।”
- CTA: “রিকোয়েস্ট পাঠান”
**Prompt:**
> Editorial premium airport lounge photograph of two Bangladesh business professionals with laptops closed, travelling together, calm credible attire, real natural lighting, navy and emerald styling with gold accent. Spacious left copy area and exact supplied Bangla copy. Convey coordination—not a false claim that particular airline seat blocks are already held.

## S07 — B2B: Six Operational Desks, One Entry
**Segment:** Agency owners | **Link:** `/b2b`.
**Text exactly:**
- Headline: “আপনার এজেন্সির জন্য ৬টি অপারেশনাল ডেস্ক”
- Subline: “Fare • Booking • Margin • After-Sales • Verification • Growth”
- CTA: “পার্টনারশিপ জানুন”
**Prompt:**
> Product-marketing flyer with ultra-clean 2×3 grid of six simple abstract photographic/symbolic motifs, one per real SAFARIA desk, subtle gold line through the system, dark emerald background and luxurious typography. No fake SaaS screenshots, no 100% guarantee or invented API integrations. Large exact headline, readable six category words, one gold CTA anchored bottom, actual brand logo top-left. Looks like modern premium enterprise software, not a generic travel pamphlet.

## S08 — B2B: WhatsApp Messages Get Lost
**Segment:** Agency owner pain point | **Link:** `/b2b`.
**Text exactly:**
- Headline: “WhatsApp-এ বুকিং রিকোয়েস্ট হারিয়ে যায়?”
- Subline: “গোছানো অনুরোধ ও স্ট্যাটাস ট্র্যাকিং নিয়ে কথা বলুন।”
- CTA: “সমাধান জানুন”
**Prompt:**
> Split-emotion business editorial creative: left quarter contains blurred disorganized generic message sheets (NOT a real WhatsApp screenshot), right half shows one crisp blank numbered request card and neatly arranged task list on a believable Bangladesh agency desk. Contrast busy-to-calm without clutter. Dark emerald, ivory and one champagne-gold route line. Exact Bangla headline and subline; original SAFARIA logo. No suggestion that a customer message is automatically received if the user has not pressed Send.

## S09 — B2B: Fare & Cost Transparency
**Segment:** Agency owner pain point | **Link:** `/b2b`.
**Text exactly:**
- Headline: “ফেয়ার কত? চার্জ কত?”
- Subline: “লিখিত কোটেশন ও খরচের ব্রেকডাউন নিয়ে আলোচনা করুন।”
- CTA: “B2B সুবিধা দেখুন”
**Prompt:**
> Crisp designerly real close-up of a blank transparent quotation breakdown with four visibly separate unfilled lines, beside a pen and calculator; deep emerald tabletop, restrained gold gridline. No readable fake taka figures, no simulated savings amount, no “0%” promise. Big two-part Bangla headline occupies the left third; exact copy and gold CTA, minimal high-value layout.

## S10 — B2B: Refund Follow-Up
**Segment:** Agency owner pain point | **Link:** `/b2b`.
**Text exactly:**
- Headline: “রিফান্ডের আপডেট কোথায়?”
- Subline: “ডকুমেন্টেড ফলো-আপ ও কেস ট্র্যাকিং নিয়ে জানুন।”
- CTA: “AfterCare দেখুন”
**Prompt:**
> Moody, calm service design advertisement in 4:5. A real adult Bangladesh travel operator reviewing a neutral case folder and support timeline, elegant directional window light. Simple gold progress-line motif with no fictitious completion checkmark. Premium large exact Bangla headline, subdued supportive subline and one CTA. No refund deadline, full-refund guarantee or fake airline waiver.

## S11 — B2B: Verified 72-Hour Pilot Application
**Segment:** Qualified agency lead | **Link:** `/b2b` application.
**Text exactly:**
- Headline: “৭২ ঘণ্টার পাইলট সম্পর্কে জানুন”
- Subline: “যোগ্য এজেন্সির জন্য যাচাইসাপেক্ষে আবেদন।”
- CTA: “আবেদন করুন”
**Prompt:**
> Ultra-minimal editorial product advertisement, elegant blank membership folder with gold-line SAFARIA visual theme, ivory desk surface and deep emerald background. Large “৭২ ঘণ্টা” numeral-text treatment is allowed only as exact verified wording. Support subline must be clearly readable adjacent, indicating eligibility verification. Original logo exact. No instant activation, free tickets, payment gateway or false membership certificate.

## S12 — B2B: Agency Partnership Lead Magnet
**Segment:** Small travel agency entrepreneurs | **Link:** `/b2b`.
**Text exactly:**
- Headline: “এজেন্সি চালান। ফলো-আপ গোছান।”
- Subline: “FARE • BOOKING • PAYMENT • REFUND”
- CTA: “SAFARIA B2B জানুন”
**Prompt:**
> Sophisticated portrait of the owner/operator of a small Bangladesh travel agency sitting at an organized desk, confident but genuine, simple clean background. Use shallow natural depth of field and editorial warm side-light. Text occupies clear left upper half. Thin champagne route line joins four word labels with excellent spacing and no diagram clutter. Exact Bangla copy, real SAFARIA logo, one CTA. No testimonial or claim of guaranteed growth.

---

# 07 — MAKE ALL 26 WEBSITE OFFERS INTO A COHERENT SOCIAL MEDIA SERIES

**Production method:** Generate one signature artwork for each of the six categories (W03–W08). Then use the corresponding S-category poster as a compositional starting point and **individually regenerate** each variant below with its specific one-line hook, visual object/location and CTA. The website offer text is authoritative; do not invent fare prices. All 26 use logo at the same corner, consistent gold CTA, consistent typography and minimal legal/disclaimer line in external caption where appropriate.

| ID in repo | Offer | Specific image direction | Exact short social hook | CTA |
|---|---|---|---|---|
| `fare-options` | Explore fare options | Window/flight information as abstract comparison | “আপনার রুটের ফেয়ার অপশন জানুন” | “কোটেশন চান” |
| `transparent-pricing` | Fare and charge breakdown | Clean blank itemized quotation | “ভাড়া, কর, চার্জ—আগে জানুন” | “বিস্তারিত চান” |
| `international` | International flights | Authentic departure lounge and world horizon | “আন্তর্জাতিক যাত্রার কোটেশন” | “রুট জানান” |
| `domestic` | Bangladesh domestic flights | Real Bangladesh landscape-to-runway contrast | “দেশের ভেতরেই নতুন গন্তব্য” | “ফেয়ার চেক করুন” |
| `one-way-return` | One-way and round-trip | Elegant two-line directional route concept | “One-Way নাকি Return?” | “অপশন জানুন” |
| `cox-bazar` | Dhaka to Cox’s Bazar | Authentic Cox’s Bazar coastline | “ঢাকা → কক্সবাজার” | “কোটেশন চান” |
| `student` | Student fare options | Bangladeshi student, suitcase, terminal | “স্টুডেন্ট ফেয়ার যাচাই করুন” | “তথ্য চান” |
| `baggage` | Student extra baggage | Real suitcase scale, unbranded | “স্টুডেন্ট ব্যাগেজ শর্ত জানেন?” | “যোগ্যতা দেখুন” |
| `china-student` | Flights for students to China | Student and genuine China destination reference | “চীনগামী শিক্ষার্থীদের ফ্লাইট” | “কোটেশন চান” |
| `china-southern` | China Southern student enquiries | Unbranded departure terminal; no airline logo without rights | “China Southern স্টুডেন্ট অপশন?” | “শর্ত যাচাই” |
| `malaysia-student` | Malaysia student travel | KL skyline reference plus student | “মালয়েশিয়ায় পড়তে যাচ্ছেন?” | “ফেয়ার জানুন” |
| `saudi-fare` | Saudi fare check | Gulf-bound traveller at airport | “সৌদি রুটের ফেয়ার চেক” | “তারিখ জানান” |
| `saudi-cities` | Jeddah/Riyadh/Madinah/Dammam | Four labels, ONE authentic airport image | “জেদ্দা • রিয়াদ • মদিনা • দাম্মাম” | “রুট জানান” |
| `salamair` | SalamAir Riyadh enquiries | Neutral aircraft/airport, no unlicensed SalamAir mark | “SalamAir Riyadh ফেয়ার?” | “যোগ্যতা/দাম চান” |
| `saudia-usbangla` | Saudia and US-Bangla options | Neutral airport terminal, no unauthorized carrier insignia | “Saudia / US-Bangla অপশন?” | “শর্ত ও ভাড়া চান” |
| `expat` | Expat travel enquiries | Bangladesh expat family travel moment | “প্রবাসী যাত্রার পরিকল্পনা?” | “কোটেশন চান” |
| `umrah` | Umrah travel assistance | Respectful real pilgrimage reference | “ওমরাহ যাত্রার সমন্বয়” | “তথ্য চান” |
| `premium-airlines` | Premium airline options | Unbranded refined airport lounge | “প্রিমিয়াম ফ্লাইট অপশন” | “বিস্তারিত জানুন” |
| `business-class` | Business class travel | Generic premium seat, logo-free | “Business Class ট্রাভেল” | “কোটেশন চান” |
| `corporate` | Corporate and group travel | Real business traveller duo | “কর্পোরেট ও গ্রুপ ট্রাভেল” | “রিকোয়েস্ট দিন” |
| `after-sales` | After-sales enquiries | Calm human travel support | “বুকিং-পরবর্তী প্রশ্ন?” | “যোগাযোগ করুন” |
| `refund` | Refund/Re-Issue/Void | Anonymized change/refund case desk | “Refund • Re-Issue • Void” | “নিয়ম জানুন” |
| `visa` | Visa assistance | Neutral travel document folder, no embassy stamp | “ভিসা সহায়তা সম্পর্কে জানুন” | “প্রক্রিয়া জানুন” |
| `hotel` | Hotel booking enquiries | Authentic boutique hotel visual | “হোটেল অপশন জানতে চান?” | “রিকোয়েস্ট দিন” |
| `tour` | Tours and packages | Real local landscape/photo | “ট্যুরের পরিকল্পনা করছেন?” | “প্যাকেজ জানতে চান” |
| `transport` | Airport/local transfers | Real unbranded airport pickup area | “এয়ারপোর্ট ট্রান্সফার লাগবে?” | “তথ্য চান” |

**Batch instruction for each individual row:**
> Using the official SAFARIA image style and the chosen category master reference, generate one NEW, distinct, realistic 1080×1350 social poster for the exact offer `[OFFER]`. Focus visual object `[IMAGE DIRECTION]`. Render only `[EXACT SHORT SOCIAL HOOK]` and `[CTA]`, plus the supplied official logo. Use generous negative space and a champagne-gold CTA strip. No invented fares or guarantees. Make this visually part of the same 26-piece SAFARIA collection, but not a duplicated scene.

**Important:** The table makes 26 individual production briefs, not one image containing all 26 offers. Render and export each separately.

---

# 08 — COMPLETE WEBSITE PLACEMENT + FILE PLAN

| Priority | Placement | Source component | Use creative | Recommended final output |
|---|---|---|---|---|
| P0 | Home skyline | `site-experience.tsx`, `.hero-skyline` | W01 | `public/marketing/web/home-skyline.webp` |
| P0 | B2C OG preview | `src/app/layout.tsx` | W24 | `public/images/social-share.jpg` replacement after review |
| P0 | B2B OG preview | `src/app/b2b/page.tsx` metadata | W25 | `public/marketing/social/b2b-og.jpg` |
| P0 | B2B hero | `b2b-landing-client.tsx` | W14 | `public/marketing/web/b2b-hero.webp` |
| P1 | Six service groups | `offers-bento.tsx` | W03–W08 | `/public/marketing/offers/offer-{category}.webp` |
| P1 | CXB + ZYL | `destination-explorer.tsx` | W09–W10 | `/public/marketing/destinations/{code}.webp` |
| P1 | 6 B2B desks | `b2b-landing-client.tsx` | W16–W21 | `/public/marketing/b2b/desk-{name}.webp` |
| P1 | Travel Studio | `travel-studio.tsx` | W13 | `/public/marketing/web/travel-studio.webp` |
| P2 | B2B system diagram | `b2b-landing-client.tsx` | W15 | `/public/marketing/b2b/six-desks.webp` |
| P2 | B2B pilot | `b2b-landing-client.tsx` | W22 | `/public/marketing/b2b/pilot.webp` |
| P2 | Contact CTA band | Homepage or `/b2b` bottom | W23 | `/public/marketing/web/contact-human.webp` |
| P2 | Other destinations | `destination-explorer.tsx` | W11–W12 variants | `/public/marketing/destinations/{code}.webp` |
| P3 | Flight Corridor atmospheric | `flight-route-canvas.tsx` | W02 | `/public/marketing/web/route-atmosphere.webp` |

**Developer integration directives:**
1. Preserve existing dynamic Atlas, navigation, `FlightRouteCanvas`, favorites, forms and JS behavior. **Do not put a static globe billboard over the interactive globe.**
2. Add a typed image map (`src/data/marketing-assets.ts`) keyed by offer `category` and destination `code`. Do not modify airport names or route semantics just to fit visual assets.
3. Add optional `image`/`altBn`/`altEn` fields to rendered service/destination cards; preserve text-first fallback if media is missing or slow. Extend the detail dialog with a larger destination rendition.
4. Use `next/image` responsive `sizes`, declared aspect ratio and below-the-fold lazy loading; prioritize only the actual LCP hero if an image is used there. Avoid eager-loading 33 destination assets or all 26 promotional variants on homepage.
5. Content headings, prices, application CTA, eligibility, legal notes and translations must remain HTML, not baked into background images. Render image alt as a factual description; decorative imagery can use empty alt.
6. Use a subtle CSS gradient scrim for 4.5:1+ readable body text and 3:1+ controls; test mobile, reduced motion, hover and keyboard focus.
7. Export optimized WebP/AVIF where appropriate; aim for small files, validate actual visual quality. As starting production budgets: large hero ~250–450 KB, desktop offer cards ~100–220 KB, destination tile ~80–180 KB, not hard quality guarantees. Keep 2K/4K masters archived independently.
8. Use true dedicated `og:image` for `/b2b`, and check preview cropping. Do not simply put a social poster in the homepage's 3D atlas slot.
9. Set event names for meaningful attribution: `quote_cta_click`, `offer_enquiry_open`, `agency_b2b_view`, `agency_lead_submit`, `whatsapp_draft_open`; only signal a successful contact after confirmed WhatsApp Send or actual acknowledged lead, never on draft-open alone.
10. Keep claims synchronized with legal/ops approvals. The real code includes hard-coded performance claims and named testimonials; review the site copy in parallel before using the pages for paid acquisition.

---

# 09 — FIRST 3 WAVES OF PRODUCTION / DISTRIBUTION

## Wave 1: Website trust and conversion foundation
**Build first:** W01, W03–W08, W09, W10, W13, W14, W24, W25.  
**Why:** cohesive homepage + B2B brand identity + real destination emotional appeal + correct previews.  
**QA:** actual phone/tablet layout, appropriate crop, real image alt, click path to correct enquiry, no data/privacy claims.

## Wave 2: B2B demand capture and educational organic posts
**Build next:** W15–W23, S07–S12.  
**Distribution:** Meta Page/Instagram carousel, LinkedIn for agency operators, official SAFARIA WhatsApp channel, targeted one-to-one consent-based agency outreach.  
**Message sequence:** pain → precise workflow → demonstration/process → partner application.  
**Sales path:** `/b2b` → intake/qualification → real operator follow-up → documented terms, no auto-activation.

## Wave 3: B2C campaign expansion
**Build:** S01–S06, then all 26 offer variants and additional priority destination assets.  
**Distribution:** feed 4:5, story 9:16, retargeting based on valid analytics/consent, share cards and website routes.  
**Message sequence:** destination or passenger problem → relevant enquiry offering → click CTA → quotation form/WhatsApp Send.

**No invented campaign benchmarks:** test multiple creative angles under actual spend and record CTR, landing-view rate, valid lead rate, agency qualification rate, cost per qualified lead and quote-to-confirmed-sale rate. Do not optimize to WhatsApp draft-open as if it were a confirmed conversation.

**Recommended experiments:** (a) photograph vs diagram, (b) pain-first vs solution-first headline, (c) person-at-work vs product still-life, (d) direct agency application vs educational CTA, (e) Bangla first vs bilingual. Change one hypothesis at a time and keep any rights/terms verified.


## Suggested 14-day first publishing sequence

| Day | Channel angle | Starting asset | Intended landing | Success event |
|---|---|---|---|---|
| 1 | New SAFARIA editorial brand introduction | W24 + W01 | `/` | landing view |
| 2 | Domestic flight enquiry | S02 | Cox's Bazar enquiry | valid quote request |
| 3 | General fare/charge clarity | S01 | quotation interaction | valid quote request |
| 4 | Travel agency pain: missing messages | S08 | `/b2b` | qualified lead |
| 5 | Six desks as one organized offer | S07 | `/b2b` | qualified lead |
| 6 | Study-abroad travel | S03 | student offer | valid quote request |
| 7 | Practical educational post: refund rules | S10 | `/b2b` | qualified lead |
| 8 | Saudi enquiry by route/date | S04 | Saudi offer | valid quote request |
| 9 | B2B quote breakdown concept | S09 | `/b2b` | qualified lead |
| 10 | Corporate travel coordination | S06 | corporate offer | valid quote request |
| 11 | Agency founder/operations story | S12 | `/b2b` | qualified lead |
| 12 | Umrah advisory, sober respectful | S05 | Umrah enquiry | qualified enquiry |
| 13 | Verified manual-pilot explanation | S11 | `/b2b` | eligible agency application |
| 14 | Review top-performing non-misleading angle; refine crop/copy | Best of S01–S12 | matching landing | qualified lead rate |

This is a **test cadence**, not a promise of reach or conversion. Pause if commercial approvals, permission to use people, or customer response capacity are missing.

---

# 10 — MASTER PROMPT FOR THE EXECUTING DESIGN AGENT

> Act as SAFARIA's Principal Creative Production Agent and website media integrator. Your authoritative source is the GitHub repository `bhaifreakinsazzad-ops/SAFARIA-Tours-Travels` on the current main branch, especially `design-tokens/DESIGN_TOKENS.json`, `docs/DESIGN_SYSTEM.md`, `src/components/site-experience.tsx`, `offers-bento.tsx`, `destination-explorer.tsx`, `travel-studio.tsx`, `agency-portal.tsx`, `b2b-landing-client.tsx`, `src/data/offers.json` and `src/data/destinations.json`. Read source files before generating. Preserve SAFARIA logo, destination routes, layout hierarchy, real Three.js interactions and live functional forms. Produce images with Nano Banana Pro using this creative pack, always confirming real rights and geographic accuracy. Begin with prioritized website media; create text-free web masters and carefully localized social versions. Name/export every asset as the map specifies, track rights, generate descriptive ALT, include WebP/OG exports and responsive crops, and put no invented prices or SLA guarantees on media. After generating, show a contact sheet and QA each image for text accuracy, anatomy, branding, geographic plausibility, design consistency and website crop. For website integration, edit only the relevant visual components, preserve existing functional routes, ensure no page-weight regression, and run existing typecheck, lint, build and project verification suites. Report actual delivered files, exact paths, relevant tests, preview links and remaining external approvals. Never state assets or tests are complete before they are produced and verified.

---

## Production definition of done

- [ ] Original SAFARIA logo preserved on all social creatives; exact font and brand palette checked.
- [ ] Every website master has a desktop + mobile crop; native HTML text remains visible at common widths.
- [ ] No image portrays invented city, invented flight data, airport-specific false codes, airline partner seal, ticket price or private passport information.
- [ ] Social copy proofread in Bangla; policy-sensitive disclaimers remain readable in caption/landing page.
- [ ] Source image rights logged and released for commercial reuse.
- [ ] Creative export names, dimensions and ALT recorded; stored in repository or approved CDN.
- [ ] Links tested from poster/CTA to accurate site route and working lead process.
- [ ] B2B testimonials and hard guarantees withheld until validated.
- [ ] Before launch, paid memberships, live ticket issuance and settlement only advertised according to actual approved operational readiness.
- [ ] Metrics review uses **qualified leads and acknowledged enquiries**, not imaginary bookings.

**End of master pack.**
