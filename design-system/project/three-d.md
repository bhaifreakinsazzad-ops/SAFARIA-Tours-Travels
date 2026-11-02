# 3D: the global route globe

The hero already shows a glowing emerald Earth with gold arcs radiating from Dhaka (Imagery → hero-globe-dhaka). `Safaria.globe` turns that picture into a live, lightweight three.js scene. The original image stays as the fallback.

## Scene

- **One renderer per page.** The canvas is `pointer-events: none` behind the hero copy at `z-canvas`.
- **Earth** is drawn as about 4,000 gold points on a Fibonacci sphere (`THREE.Points`, one draw call) with an emerald `surface-100` core and a fresnel rim in `gold` at 35% opacity. It uses no textures.
- **Routes** are 32 quadratic-bezier arcs from Dhaka (23.84°N, 90.40°E) to every other enquiry destination: 7 domestic airports and 25 international cities. All arcs share one geometry buffer. A dash offset animates in the shader, so the route lines look like they are being drawn.
- **Labelling:** routes are *illustrative connections* and must carry the visible caption "Illustrative routes, not flight schedules".
- **Camera** sits at 2.8 units with FOV 35°. Pointer movement drifts the camera at most 4°. Choosing a destination card moves the camera to that city over `dur-long` with `ease-in-out` (the render loop eases toward the target, and anime.js only animates the surrounding DOM).

## Overlay mode (live site): image to code

On the live hero the painted Earth in `hero-globe-dhaka.webp` stays. `HeroGlobe.mount(host, { overlay: true, center: { lat: 14.4, lon: 86.7 }, fill: 0.8 })` draws only the route pulses and city markers. An invisible depth-only core hides arcs on the far side. The host square is placed over the painted globe, which was measured in the artwork at centre (1080, 418) and radius 404px out of 1536×1024. Its position follows the image's `object-fit` and `object-position` at every breakpoint, so Dhaka lands on the painted Dhaka hub. In overlay mode the globe doesn't sway or refocus, so it stays aligned.

## Budget and lifecycle

- three is lazy-imported (`three@0.160.0`, ES module from jsDelivr) only after the hero is in view and the browser is idle.
- DPR is capped at 1.5, or 1 on phones. On low-end devices (`navigator.hardwareConcurrency <= 4` or `deviceMemory <= 4`) the point count is halved.
- The scene renders only while visible (IntersectionObserver) and while `document.visibilityState === 'visible'`.
- `Safaria.globe.destroy()` disposes of the geometries, materials and renderer, removes the listeners and cancels the rAF.
- **Fallbacks:** without WebGL, with reduced motion, or with Save-Data on, the original hero image stays and no canvas is added. The destination grid is always plain HTML cards and links, and the globe is never needed to submit an enquiry.
