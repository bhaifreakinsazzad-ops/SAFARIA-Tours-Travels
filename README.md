# SAFARIA Tours & Travels

The Bengali-first Next.js application lives here, alongside the existing GHL project in the parent directory. It contains the Journey Atlas, 26 campaign offers, 33-location explorer, Travel Studio, and agency application.

## Run locally

From this directory:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The scripts invoke Node entry points directly because the Windows parent directory contains `&`.

## Verify

```powershell
npm run typecheck
npm run lint
npm run build
npm run start
npm run verify:atlas
npm run verify:phase23
npm run verify:purge
npm run verify:phase45
```

The browser checks use Microsoft Edge on Windows and expect the local production server at `http://localhost:3000`.

## Content and behavior

- `src/data/destinations.json` and `src/data/offers.json` are generated from the user-provided CSV files. Run `npm run import:data` to refresh them from the source paths in `scripts/import-data.cjs`.
- The globe uses the local `earth-emerald.webp` texture, a Three.js `MeshStandardMaterial`, a gold Fresnel halo, animated dashed routes and travelling particles. On phones, the branded static globe appears first and visitors can enable live 3D; the route buttons work immediately. Run `npm run texture:globe` to recreate the texture from the Natural Earth derivative.
- Below-the-fold offer, explorer, studio and agency modules load as their sections enter the viewport. Their headings remain in the initial HTML.
- Favorites and the Travel Studio draft persist in this browser's local storage. The Studio includes a Clear draft button. Its “AI Draft My Trip” control creates a local template from the entered answers; it does not call an AI service.
- Quotation and agency forms open a WhatsApp draft to `+8801674178437`. The visitor must press Send. No enquiry storage, automated delivery, payment, subscription activation, inventory or booking confirmation is implemented.
- Agency pricing is configured as ৳5,999 monthly and ৳69,999 annual in this app. The old GHL project and historical handoff files in the parent directory retain their earlier values and are outside this app's scope.
- Site URL, WhatsApp contact and agency pricing are centralized in `src/config/constants.ts`. The final canonical root is `https://safaria.vibing.world/`, as supplied by the owner. OG artwork and page imagery are local files in `public/images/`; no inline base64 images or legacy form URLs are used by this app.

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md), [docs/PHASE_2_3_QA.md](docs/PHASE_2_3_QA.md), and [docs/DEPLOYMENT_READINESS.md](docs/DEPLOYMENT_READINESS.md).
