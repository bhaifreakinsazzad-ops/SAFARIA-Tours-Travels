The 32 enquiry destinations from Dhaka, with 7 domestic and 25 international.

- `Safaria.DestinationGrid.render(el, { region, limit, href(d), onSelect(code) })` writes `a.sf-destination-card` tiles and returns `{ filter(region) }`. The data is in `Safaria.destinations`.
- Feature cards with photos use `.sf-has-photo` with an `<img>` first and a dark gradient over it.
- Wire `onSelect` to `HeroGlobe.focus(code)` and to prefill the quote's To field.
- Florida is a state with several airports. New York, London, Tokyo, Beijing and Toronto use city codes.
- **Always** show the note "Destinations are enquiry options. Routes and airlines are confirmed in your quotation."
