The structured flight enquiry, the main conversion point. It has three steps: Route, Travellers, Contact.

- `Safaria.FlightQuote.mount(el, { source, onStart, onSubmit(q, text) })`. Without `onSubmit` it ends in the handoff screen: an enquiry summary with WhatsApp (prefilled), Call, SMS and Copy.
- `onSubmit` must return a Promise from the real GHL form or webhook post. "Enquiry received" shows only if it resolves.
- Validation covers required fields, dates not in the past, return on or after departure, origin and destination differing, at most one infant per adult, and a phone number with country code. Errors are a `danger` icon plus text with `role="alert"`. Focus moves to the first invalid field.
- Use `Safaria.FlightQuote.summary(q)` and `.links(text)` to reuse the agent-ready text anywhere.
- **Don't:** collect passport numbers or scans, or say "booked" or "confirmed". The WhatsApp link only opens a draft, which the visitor sends.
