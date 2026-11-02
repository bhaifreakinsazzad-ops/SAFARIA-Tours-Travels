Buttons and chips move a visitor to the next step. There is one gold primary per view.

- `.sf-button.sf-gold` is the primary action ("Request a flight quote"). Use one per section. Add `data-sf-magnetic` only on hero and section CTAs.
- `.sf-button.sf-outline` is the secondary action next to a gold button.
- `.sf-button.sf-emerald` is the primary action on `day` surfaces (forms, the Travel Studio).
- `.sf-chip[aria-pressed]` is for toggles and filters (trip type, region). Never use it for navigation.
- **Consumer provides:** the label in sentence case, plus an optional trailing `Safaria.icon("arrow")`.
- **Do:** keep height at `button-h` (or `touch-min` in tight headers), and show a loading label such as "Sending…" while disabled.
- **Don't:** stack two gold buttons, write "Book now" (we take enquiries), or remove the focus outline.
