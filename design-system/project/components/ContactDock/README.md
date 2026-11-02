The mobile-only contact bar: WhatsApp, Call, and a gold "Get a quote".

- `Safaria.ContactDock.render(navEl, { quoteHref })` uses `Safaria.config.phone` for both links and adds `data-sf-event` analytics hooks.
- It's fixed to the bottom below 768px, padded by `env(safe-area-inset-bottom)`. Leave about 80px of bottom padding on the page so the footer isn't covered.
