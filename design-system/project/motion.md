# Motion

Motion explains hierarchy and cause. It is never decoration for its own sake. One library owns each property:

| Owner | Controls | Never touches |
| --- | --- | --- |
| CSS transitions | hover, focus, colour, border (`dur-short`) | transforms set by JS |
| anime.js 4 (`Safaria.motion`) | hero sequence, staggered text and cards, counters, form steps, drawer and dialog | three.js objects |
| Motion 11 (`inView`, `scroll`) | when a reveal starts, scroll-linked parallax progress | any element anime.js is animating |
| three.js (`Safaria.globe`) | the canvas and its camera | DOM |

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `dur-micro` | 120ms | press, icon nudge |
| `dur-short` | 250ms | hover, focus |
| `dur-medium` | 600ms | card and section reveals |
| `dur-long` | 1100ms | hero entrance, image wipes |
| `dur-stagger` | 70ms | per-item delay |
| `dur-continuous` | 60s | one globe turn |
| `ease-out` | cubic-bezier(.22,1,.36,1) | entrances |
| `ease-in-out` | cubic-bezier(.65,0,.35,1) | drawers, steps |
| `ease-spring` | cubic-bezier(.34,1.56,.64,1) | ticks and chips only |

## Patterns

1. **Hero entrance** (about 1.4s in total, CTA visible by 700ms): the art fades in from 0 to 1 opacity → the h1 lines rise 24px with a 70ms stagger → the lead fades in → the gold CTA, then the outline CTA → chips → the globe starts turning. Content is never hidden before JavaScript runs: the hidden starting state is set only by the script that is about to animate it.
2. **Reveal on scroll**: `[data-sf-reveal]` elements rise 18px and fade in once, at `dur-medium`. Children of `[data-sf-stagger]` follow at `dur-stagger` intervals. The reveal starts when 15% of the element is visible.
3. **Image wipe** ("image-to-code"): figures marked `[data-sf-wipe]` reveal with `clip-path: inset(0 100% 0 0)` → `inset(0)` at `dur-long`, then hold a slow 1.06 → 1 scale (a Ken Burns settle).
4. **Parallax**: hero art and `[data-sf-depth]` layers move by at most 6% of their height, driven by Motion `scroll()`. Never apply it to text or forms.
5. **Counters**: `[data-sf-count]` animates only verified figures, such as the 32 enquiry destinations or the 72-hour trial. Never animate invented statistics.
6. **Magnetic CTA and card tilt**: on a pointer device only (`(hover:hover) and (pointer:fine)`), move at most 6px or tilt at most 4°, and reset on leave.
7. **Form steps**: the outgoing step fades out and moves 12px left, then the incoming step fades in. The progress bar width animates. Error messages appear without fading out and stay until fixed.
8. **Drawer and dialog**: these use `ease-in-out` at `dur-medium`. Focus moves into the panel and returns to the trigger. Esc closes.

## Rules

- Animate `transform` and `opacity` only, and add `will-change` only while an animation runs.
- Use one IntersectionObserver for all reveals and one rAF-throttled scroll handler. Never start the same animation twice (`data-sf-done`).
- Pause the globe and continuous loops when the tab is hidden or the element is off-screen.
- **Reduced motion:** reveals become a plain 0 → 1 fade over 120ms or appear instantly. There is no parallax, tilt or magnetic movement, and the globe renders one still frame. All content and functions stay.
- Never hijack scroll, never delay the CTA, and never animate layout properties (width/top) on more than one element at a time.
