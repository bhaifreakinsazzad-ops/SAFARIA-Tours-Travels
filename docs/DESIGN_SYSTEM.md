# SAFARIA design system

## Visual source

The approved desktop and mobile/modal concepts are in `design/`. They guide layout, color, type, surface treatment and responsive composition. The rendered interface uses HTML, CSS and Three.js; the concept images are not shipped as page artwork.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--sf-bg` | `#041713` | Page and dark hero base |
| `--sf-green` | `#062b27` | Emerald surfaces and text on ivory |
| `--sf-gold` | `#cfb57c` | Routes, borders, active states and primary actions |
| `--sf-ivory` | `#f3f0e7` | Main text and enquiry panel |
| `--sf-muted` | `#b1c3bc` | Supporting copy |
| `--sf-line` | `rgba(207,181,124,.28)` | Fine glass borders |
| `--sf-glass` | `rgba(6,43,39,.6)` | Atlas destination surface with 16px backdrop blur |

English display headings use Cormorant Garamond; UI uses Inter. Bengali display and UI copy use Noto Sans Bengali. Fonts are self-hosted by `next/font` at build time. The real SAFARIA logo is reused from the existing project.

## Component rules

- Gold buttons are the only primary action style. Header links and route chips use restrained gold hover/focus treatments.
- The hero uses open space, a single editorial message and the live globe. The existing artwork is cropped for the skyline only.
- Route nodes have CSS2D labels and tooltips. The route list is the equivalent keyboard and mobile control.
- Form inputs sit on ivory with dark emerald text, explicit labels, a visible focus ring and supplier-confirmation wording.
- Mobile shifts the hero to one column and presents the route dialog as a bottom sheet. Mobile 3D loads on request so the route list and static globe appear immediately. Reduced-motion and low-end mobile users retain the static SVG globe.
- Offer cards use glass surfaces, gold focus/hover boundaries, and Anime.js staggered entrance only when motion is allowed. All cards remain keyboard buttons.
- Destination cards use Motion layout transitions into a detail dialog. The search bar remains sticky, and favorites live in browser local storage.
- Travel Studio uses five Motion-animated steps and a Zustand draft persisted to local storage. The original 18 source fields are represented, with a conditional return date added for round trips.
- Agency pricing and forms use the same gold/ivory contrast. The 0% SAFARIA markup explanation is available beside the claim, with trial consent explicitly required.
- Below-the-fold modules use section placeholders and load on intersection, limiting initial JavaScript and layout work on mobile.

## Sources and product limits

Coordinates and paired route names came from the user-supplied `safaria-data.json`. Offers and destinations are imported directly from the two supplied CSV files into typed JSON. `DAC` is the origin record within the 33-location source. `FL` is a supplied region code for Florida, not an airport IATA code; UI labels these as codes rather than claiming every value is an airport code. The globe texture is a locally optimized, color-graded derivative of Natural Earth 1:50m Natural Earth I with Shaded Relief (`NE1_50M_SR`, version 3.2.0), from https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/. Natural Earth raster and vector data are public domain: https://www.naturalearthdata.com/about/.

Routes represent enquiry destinations. Country-wide campaign presets remain country-wide, with city to confirm, instead of choosing an arbitrary airport. They do not represent nonstop service, availability, inventory, fare or ticket confirmation. The app prepares a WhatsApp draft; the traveller must send it. The agency application does not activate a trial or subscription.
