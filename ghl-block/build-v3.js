// Builds the SAFARIA v3 single-file GHL block from the design system + ghl-block/v3 sources.
//   node ghl-block/build-v3.js            (needs esbuild: set ESBUILD_DIR to a folder that has node_modules/esbuild)
// Outputs: ghl-block/safaria-v3-block.html (readable CSS/JS layout, unminified)
//          ghl-block/safaria-v3-block.min.html (production, minified; SAFARIA_CONFIG stays editable)
//          ghl-block/test/v3.html (the block inside a deliberately "hostile" theme page, for CSS isolation tests)
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.resolve(__dirname, ".."), DS = path.join(ROOT, "design-system", "project"), V3 = path.join(__dirname, "v3");
const read = (p) => fs.readFileSync(p, "utf8");
let esbuild;
try { esbuild = require(path.join(process.env.ESBUILD_DIR || "", "node_modules", "esbuild")); } catch (e) { esbuild = require("esbuild"); }
const ID = "#safaria-v3";

/* ---- CSS ---- */
const tokens = read(path.join(DS, "tokens.css")).split("\n").filter((l) => !/^\.[a-z]/.test(l)).join("\n")
  .replace(':root, [data-theme="night"] {', ID + " {")
  .replace('[data-theme="day"] {', ID + '[data-theme="day"], ' + ID + ' [data-theme="day"] {')
  .replace(/^:root \{/m, ID + " {").replace(/^\/\*.*\*\/\n/, "");
const bundleCss = read(path.join(DS, "components", "bundle.css")).replace(/@import[^;]+;\s*/, "")
  .replace(/\[data-theme="day"\] :where\(\.sf-scope\)/g, ID + '[data-theme="day"]')
  .replace(/\[data-theme="day"\] :where\(/g, ID + ' [data-theme="day"] :where(')
  .replace(/:where\(#safaria-site, \.sf-scope\)/g, ID).replace(/:where\(\.sf-scope\)/g, ID);
const keyframes = read(path.join(V3, "keyframes.css"));
const local = ID + " {\n" + read(path.join(V3, "styles.css")) + "\n}";
const lowerCss = (css, minify) => esbuild.transformSync(css, { loader: "css", minify, target: ["chrome90", "safari14", "firefox90"], legalComments: "none" }).code.trim();
const allCss = tokens + "\n" + bundleCss + "\n" + keyframes + "\n" + local;
const cssMin = lowerCss(allCss, true), cssPretty = lowerCss(allCss, false);

/* ---- markup, i18n tables ---- */
const markup = read(path.join(V3, "markup.html")).trim();
const appSrc = read(path.join(V3, "app.js")), globeSrc = read(path.join(V3, "globe.js")), runtimeSrc = read(path.join(DS, "components", "bundle.js"));
const bnAll = Object.assign({}, require("./v3/bn.source.json"), require("./v3/bn.extra.json"));
const used = new Set([...(markup + appSrc).matchAll(/["']([A-Za-z0-9]+)["']/g)].map((m) => m[1]));
const bn = {}; Object.keys(bnAll).forEach((k) => { if (used.has(k)) bn[k] = bnAll[k]; });
const need = new Set([...markup.matchAll(/data-(?:i|ip|ia)="([^"]+)"/g)].map((m) => m[1]));
[...appSrc.matchAll(/\bt\("([^"]+)"/g)].forEach((m) => need.add(m[1]));
[...appSrc.matchAll(/\["((?:q|a)\d+)"/g)].forEach((m) => need.add(m[1]));
["all", "savedOnly", "domestic", "southAsia", "southeastAsia", "middleEast", "eastAsia", "europe", "northAmerica", "oceania", "africa"].forEach((k) => need.add(k));
const missing = [...need].filter((k) => !(k in bn));
if (missing.length) console.warn("WARNING: no Bengali for:", missing.join(", "));
const qbn = require("./v3/qbn.json");
const j = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

/* ---- images (embedded, lazy-applied by app.js) ---- */
const img = {};
for (const [k, f] of [["logo", "Brand/safaria-logo.webp"], ["hero", "Imagery/hero-globe-dhaka.webp"], ["lagoon", "Imagery/lagoon.webp"], ["agency", "Imagery/agency-art.webp"], ["istanbul", "Imagery/istanbul-sunset.webp"]])
  img[k] = "data:image/webp;base64," + fs.readFileSync(path.join(DS, "assets", f)).toString("base64");

/* ---- scripts ---- */
const app = appSrc.replace("/*__BN__*/{}", () => j(bn)).replace("/*__QBN__*/{}", () => j(qbn));
const minJs = (s) => esbuild.transformSync(s, { minify: true, target: "es2020", legalComments: "none" }).code.trim();
const prettyJs = (s) => esbuild.transformSync(s, { minify: false, target: "es2020", legalComments: "none" }).code.trim();
for (const [n, s] of [["runtime", runtimeSrc], ["globe", globeSrc], ["app", app]]) if (/<\/script|<!--/i.test(s)) throw new Error(n + " contains a script terminator");
if (/<\/style/i.test(cssMin + cssPretty)) throw new Error("css contains </style");

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600&display=swap";
const today = new Date().toISOString().slice(0, 10);
const cfg = `<script>
  /* Edit these. Everything else is generated. */
  window.SAFARIA_CONFIG = {
    phone: "+8801674178437",   /* OPEN ITEM: the previous site used +8801641178437. Confirm the official WhatsApp/call number */
    email: "safariatoursandtravels@gmail.com",
    vibeUrl: "https://trippin.vibing.world/",   /* OPEN ITEM: confirm the official ViBE Trippin' address */
    lang: "bn",          /* default language: "bn" or "en" */
    globe: true,         /* interactive three.js globe */
    motion: true,        /* anime.js and Motion enhancements */
    dock: true,          /* mobile WhatsApp / Call / Quote bar */
    webhooks: {          /* GHL Inbound Webhook URLs. Leave "" until the workflow exists: the visitor then gets the WhatsApp/Call/SMS handoff */
      flight: "", studio: "", corporate: "", agency: "", partner: "", tracker: ""
    }
  };
</script>`;
const head = (kind) => `<!-- SAFARIA v3 · full-site block (${kind}) · build ${today}
     Paste into ONE GoHighLevel "Custom JS/HTML" element on a CLONE of your page. It replaces the old SAFARIA 3.2 block and the v2 motion block (delete those two elements on the clone).
     Rollback: delete this element and restore the old ones. Install guide: ghl-block/README-v3.md -->
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">`;
const landB64 = fs.readFileSync(path.join(V3, "land.b64"), "utf8").trim();
const imgScript = (pretty) => `<script id="safaria-v3-img">window.__SF_LAND="${landB64}";window.__SF_IMG=${pretty ? JSON.stringify(img, null, 1).replace(/(data:image\/webp;base64,.{40})[^"]+/g, "$1…") : JSON.stringify(img)};</script>`;

const full = (pretty) => [
  head(pretty ? "readable" : "minified"),
  `<style id="safaria-v3-css">${pretty ? "\n" + cssPretty + "\n" : cssMin}</style>`,
  markup, cfg,
  imgScript(false),
  `<script id="safaria-v3-runtime">${pretty ? "\n" + prettyJs(runtimeSrc) + "\n" : minJs(runtimeSrc)}</script>`,
  `<script id="safaria-v3-globe">${pretty ? "\n" + prettyJs(globeSrc) + "\n" : minJs(globeSrc)}</script>`,
  `<script id="safaria-v3-app">${pretty ? "\n" + prettyJs(app) + "\n" : minJs(app)}</script>`
].join("\n") + "\n";

const outPretty = full(true), outMin = full(false);
fs.writeFileSync(path.join(__dirname, "safaria-v3-block.html"), outPretty);
fs.writeFileSync(path.join(__dirname, "safaria-v3-block.min.html"), outMin);
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + " KB";
console.log("safaria-v3-block.html", kb(outPretty), "| min", kb(outMin), "· gzip ≈", (zlib.gzipSync(outMin).length / 1024).toFixed(0) + " KB", "| code without images ≈", kb(outMin.replace(/data:image\/webp;base64,[A-Za-z0-9+/=]+/g, "")));

/* ---- hostile-theme test page: simulates a page-builder theme that styles bare elements ---- */
fs.mkdirSync(path.join(__dirname, "test"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "test", "v3.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SAFARIA v3 test host</title>
<script>if(/[?&]nogl=1/.test(location.search)){var _gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t){return /webgl/.test(t)?null:_gc.apply(this,arguments)};window.WebGLRenderingContext=undefined}
if(/[?&]motion=1/.test(location.search)){var _mm=matchMedia.bind(window);window.matchMedia=function(q){var r=_mm(q);return /prefers-reduced-motion/.test(q)?{matches:false,media:q,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:r}}</script>
<style>/* mimics a page-builder theme */ body{margin:0;font:14px/1.4 Roboto,Arial,sans-serif;color:#222;background:#fff} h1,h2,h3,h4{font-family:Roboto,Arial,sans-serif;color:#222;font-weight:700;margin:0 0 16px} p{color:#333;margin:0 0 16px} a{color:#0645ad;text-decoration:underline} button,input,select,textarea{font-family:Roboto,Arial;border-radius:0} ul,ol{margin:0 0 16px;padding-left:24px} img{border:0} *{box-sizing:content-box}</style></head><body>
<div class="c-custom-code">
${outMin}
</div></body></html>`);
