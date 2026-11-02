The sticky site header. It becomes `sf-compact` after 24px of scroll, and below 900px the links move into a drawer.

- **Consumer provides:** `header.sf-header` with the brand, `nav.sf-nav` (`aria-current="page"` on the active link), the WhatsApp chip, the gold CTA, and `.sf-burger`. Also provide `nav.sf-drawer` and `.sf-veil` as siblings.
- Mount it with `Safaria.Header.mount(header, { drawer, veil })`. The drawer traps nothing, closes on Esc, the veil, or a link click, and hands focus back to the burger.
- Navigation has 8 links at most: Home, Air tickets, Services, Destinations, B2B, Corporate, About, Contact.
- **Don't:** hide the quote CTA on mobile. Below 768px the contact dock carries it.
