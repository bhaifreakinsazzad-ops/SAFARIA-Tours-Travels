The hero: the brand's emerald-and-gold Dhaka globe, brought to life by three.js, with an anime.js entrance for the copy.

- **Consumer provides:** a positioned container for the canvas, the hero image (it stays as the fallback), and copy elements tagged `data-sf-hero="line|lead|cta|chip|art"`.
- Load three@0.160.0 lazily, then call `Safaria.use({ THREE })` and `Safaria.HeroGlobe.mount(el, { distance, offsetX, caption })`. Mount returns `{ focus(code), reset(), destroy() }`, or `null` when WebGL is unavailable, Save-Data is on, or THREE is missing. In those cases keep the image at full opacity.
- When the globe mounts, dim the hero image (opacity 0.18 or lower) so the two don't double up.
- `Safaria.Motion.hero(root)` shows the CTAs within about 700ms. Under reduced motion it does nothing and the globe renders one still frame.
- **Must** keep the "Illustrative routes, not flight schedules" caption.
