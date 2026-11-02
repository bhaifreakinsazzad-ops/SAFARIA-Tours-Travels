The shared motion engine. anime.js 4 drives the DOM and Motion 11 decides when animations start. Web Animations is the fallback.

- Call `Safaria.use({ anime, motion })`, then `Safaria.Motion.init(root)` to activate `data-sf-reveal`, `data-sf-stagger`, `data-sf-wipe`, `data-sf-count`, `data-sf-depth`, `data-sf-magnetic` and `data-sf-tilt`. Init returns a cleanup function for parallax.
- `Safaria.Motion.animate(targets, { opacity, y, x, scale, clip }, { duration, delay, stagger, ease: "out"|"inOut"|"spring" })` returns a Promise and clears inline styles when it finishes.
- Each element is initialised once (`data-sf-done`). Everything respects `prefers-reduced-motion` and the site's own `data-motion="paused"` toggle.
- `data-sf-count` is only for verified numbers.
