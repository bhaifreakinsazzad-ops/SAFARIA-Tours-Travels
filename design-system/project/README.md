SAFARIA Tours & Travels is a Bangladesh-based, full-service travel agency. Air ticketing is its main business, and it also offers visas, hotels, tours, corporate travel and a B2B agency programme. The interface should feel like a premium international travel platform: emerald night, champagne gold and warm ivory, cinematic imagery, and calm, purposeful motion. Every screen ends in one obvious next step, which is a structured enquiry handed to a human agent.

## Content fundamentals

- **Voice:** a calm, competent travel coordinator. Use second person ("Tell us where you're going"). Refer to the business as "we" or "SAFARIA". Don't hype.
- **Bilingual:** Bengali (`lang="bn"`) is the default and English is the toggle. Every visible string has both versions in `data-copy` keys. Bengali uses the `bn-*` styles. Never set Bengali at Latin leading.
- **Casing:** sentence case for headings and buttons ("Request a flight quote"). Eyebrows are uppercase and tracked at `eyebrow`.
- **No emoji** in UI copy. Use icons from the line set instead (see Iconography).
- **Enquiry, not booking.** Say "Request a quote", "Submit enquiry" or "A SAFARIA agent will confirm". Never say "Book now" or "Confirmed", and never imply live fares or inventory. The Integrity section lists every claim you must not make.
- **Real copy to reuse:** tagline "Your Gateway to Global Travel". B2B line "Your Agency. Our Travel Operations." Disclaimer "0% SAFARIA markup on eligible air tickets. Airfare, taxes and supplier charges remain payable."

## Visual foundations

**Colour.** The default theme is `night`. `surface-000` is the ground, `surface-100` is for alternating bands and `surface-200` is for raised cards. Body text is `ink` and supporting text is `ink-muted`. `gold` is an accent for rules, icons, numbers and one emphasised word. It is never used for a paragraph and should cover less than 10% of any viewport. The primary CTA is the gold gradient (`gold-hi` → `gold-lo`, 120deg) with `on-gold` label text. Secondary CTAs are outline buttons with a `line-strong` border. The `day` theme is for form shells, the Travel Studio and print. In that theme `emerald` is the primary button fill with `ivory` text. `navy` is reserved for corporate and aviation panels. Avoid neon, purple and any hue outside these tokens.

**Type.** Headings use `display-*` (Cormorant Garamond 500, -0.035em tracking). Running copy uses `body` and `lead` (Inter). Keep line length at 70 characters or fewer, and keep `lead` 470px wide or less. Card titles use `display-card`, not bold sans.

**Layout.** Content sits in `.sf-wrap` (`wrap-max`, `space-9` inset on desktop, `space-6` on tablet, `space-4` on phones). Sections are separated by a `line` hairline on top, not by shadows. Hero art is masked from the left (`mask-image: linear-gradient(90deg, transparent 20%, #000 43%)`) so the copy always sits on a flat ground.

**Imagery.** Use cinematic dusk photography in emerald, amber and gold, with the subject on the right and negative space on the left. Use the Imagery asset group. Every `<img>` needs meaningful alt text in the active language. Never hotlink third-party images, and never show airline, IATA or partner logos the business hasn't confirmed.

**Borders, radii, shadows.** Use 1px borders throughout: `line` for decorative dividers and `line-strong` for controls. Radii come from the token set: `radius-btn` for buttons, `radius-md` for cards and `radius-lg` for shells. Shadows only lift things that float: `shadow-menu`, `shadow-panel` and the gold button glow.

**States.** Hover changes the border and background over `dur-short`. Press scales to 0.98 over `dur-micro`. Focus is a 3px solid `focus` outline at a 5px offset, and it is never removed. Disabled elements drop to 45% opacity with `cursor: not-allowed`. Error is `danger` plus an icon and a message. Success is `success` plus a tick and words. Colour alone never carries a state.

**Motion.** The Motion section has the full rules. In short: transform and opacity only, `ease-out` for entrances, nothing that blocks the CTA, and a full fallback for `prefers-reduced-motion`.

**Mobile.** Every tap target is at least `touch-min` tall. The page uses a 16px gutter and never scrolls horizontally. A bottom contact dock (WhatsApp, Call, Quote) appears below 768px and respects `env(safe-area-inset-bottom)`. Hero art opacity drops to 0.62 on phones.

## Iconography

The site uses a 1.5px-stroke line icon set drawn inline as SVG (`.sf-icon`, 24px grid, `currentColor`). In service lists, icons are `gold`. Never mix filled and line icons. The bundle's `Safaria.icon(name)` returns these paths: plane, plane-up, plane-down, globe, passport, hotel, visa, briefcase, handshake, whatsapp, phone, sms, chevron, swap, check, alert, close, menu. The logo is the raster mark in **Brand → safaria-logo.webp** (gold ring, emerald S, plane). Show it at 56px in the header and footer. Don't recolour it, crop it or redraw it as an SVG.

## Using the system

- Scope everything under `#safaria-site`, with classes prefixed `sf-`. Never style `body`, `html` or bare tags outside the root.
- Load `tokens.css`, then `components/bundle.css`, then `components/bundle.js`. That gives you `window.Safaria`, with `Safaria.motion`, `Safaria.globe`, `Safaria.quote` and `Safaria.icon`.
- Animation libraries are optional, enhance the page only, and are pinned: anime.js 4.0.2, Motion 11.11.17 and three 0.160.0 from jsDelivr. The page has to work completely without any of them.
- The GoHighLevel drop-in block (`safaria-motion-block.html`) and its install guide live next to this system in the project folder.
