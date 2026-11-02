# SAFARIA v4: scroll-driven motion layer on the v3 site

**Paste:** `safaria-v4-block.min.html` (or use `delivery/safaria-v4-copy.html` → Copy all code). Replaces the v3 element; v3 files remain as rollback. Install steps and `SAFARIA_CONFIG` are unchanged from `README-v3.md`.

## What is new
- **Journey section (`#sf-journey`)**: a pinned stage where scrolling picks Dubai → London → New York → Sydney. A second three.js globe turns to each route and flies the plane along it, scrubbed by scroll. Routes are labelled illustrative.
- **Hero**: character-by-character headline reveal (word-by-word in Bengali), and a scroll scrub (copy lifts and fades, globe zooms and spins, art drifts). The globe now has a starfield and `setScroll/zoom/scrub` APIs.
- **Scroll engine** (`v4/fx.js`): one rAF-throttled handler writes CSS variables (`--hp`, `--ip`, `--on`, `--steps-p`, `--sv`).
- **Text**: section headings reveal word by word; lead paragraphs light up word by word as you scroll.
- **Cards**: grid-staggered entrance (anime.js grid stagger), pointer spotlight, tilt, button ripples, magnetic gold CTAs.
- **Extras**: destination marquee that skews with scroll speed, parallax images, drifting orbs, "how it works" gold line tied to scroll, side section rail (desktop), cursor glow (fine pointers only).
- **Mobile**: no rail, cursor or tilt; journey shows one stop at a time under a smaller globe; lower point counts.
- **Reduced motion / no WebGL**: journey becomes a static list; nothing is hidden; WAAPI fallbacks if anime.js fails to load.

## Rebuild
```bash
ESBUILD_DIR=<folder with node_modules/esbuild> node ghl-block/build-v4.js
node ghl-block/delivery/make-v4.js
```
Sources: `ghl-block/v4/{markup.html,styles.css,fx.css,fx.js,app.js,globe.js,...}`. Test page: `test/v4.html` (`?motion=1` forces motion).

## Verified / not verified
Headless Edge, desktop 1360 and mobile 390: no page errors, no horizontal scroll, journey stops advance with scroll, steps line completes, reduced motion static. **Not tested:** inside real GHL Preview (sticky stage needs no `overflow:hidden` ancestor), Safari/Firefox, real phones, Lighthouse. Page weight grew about 12 KB (code) plus a second WebGL context while the journey is on screen.
