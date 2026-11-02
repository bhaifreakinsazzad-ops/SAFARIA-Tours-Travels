// Builds ghl-block/safaria-motion-block.html from the design system sources.
// Run with: node ghl-block/build.js
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DS = path.join(ROOT, "design-system", "project");
const read = (p) => fs.readFileSync(p, "utf8");

// Tokens: scoped to #safaria-site so nothing leaks into the GHL theme. The generic
// type-style classes (.body, .button, .caption…) are dropped.
const tokens = read(path.join(DS, "tokens.css"))
  .split("\n")
  .filter((l) => !/^\.[a-z]/.test(l))
  .join("\n")
  .replace(':root, [data-theme="night"] {', "#safaria-site {")
  .replace('[data-theme="day"] {', '#safaria-site[data-theme="day"], #safaria-site [data-theme="day"] {')
  .replace(/^:root \{/m, "#safaria-site {")
  .replace(/^\/\*.*\*\/\n/, "");

const css = read(path.join(DS, "components", "bundle.css")).replace(/@import[^;]+;\s*/, "");
const polish = `
/* v2 polish on existing site parts (id specificity, additive only) */
#safaria-site .sf-button:active:not([data-sf-magnetic]) { transform: scale(.98); }
#safaria-site .sf-orbit .sf-globe3d canvas { opacity: 1; }
#safaria-site .sf-orbit .sf-illustrative { bottom: 8px; right: 12px; }
`;
const js = read(path.join(DS, "components", "bundle.js"));
const enh = read(path.join(__dirname, "src", "enhance.js"));
for (const [n, s] of [["bundle.js", js], ["enhance.js", enh]]) if (/<\/script|<!--/i.test(s)) throw new Error(n + " contains a script terminator");
if (/<\/style/i.test(css + tokens)) throw new Error("css contains </style");

const out = `<!-- SAFARIA v2 · motion, 3D and component layer · build ${new Date().toISOString().slice(0, 10)}
     Paste into ONE GoHighLevel "Custom JS/HTML" element placed BELOW the existing SAFARIA site block.
     Removing this element restores the site exactly as it was. Install guide: ghl-block/README.md -->
<style id="safaria-v2-css">
${tokens}
${css}
${polish}
</style>
<script>
  /* Edit these. Everything else is generated. */
  window.SAFARIA_CONFIG = {
    phone: "+8801674178437",   /* OPEN ITEM: live site shows +8801641178437. Confirm the official number */
    globe: true,
    reveal: true,
    pointer: true,
    dock: false,
    quoteMount: null
  };
</script>
<script id="safaria-v2-runtime">
${js}
</script>
<script id="safaria-v2-enhance">
${enh}
</script>
`;
fs.writeFileSync(path.join(__dirname, "safaria-motion-block.html"), out);
console.log("safaria-motion-block.html", (out.length / 1024).toFixed(1) + " KB");

// Production build: same block, minified. Needs esbuild; pass its folder in ESBUILD_DIR.
// The SAFARIA_CONFIG script stays readable so it can be edited inside the site builder.
if (process.env.ESBUILD_DIR) {
  const esbuild = require(path.join(process.env.ESBUILD_DIR, "node_modules", "esbuild"));
  const minJs = (s) => esbuild.transformSync(s, { minify: true, target: "es2020", legalComments: "none" }).code.trim();
  const minCss = esbuild.transformSync(tokens + css + polish, { loader: "css", minify: true, target: ["chrome90", "safari14", "firefox90"] }).code.trim();
  const runtime = minJs(js), enhance = minJs(enh);
  for (const s of [runtime, enhance]) if (/<\/script|<!--/i.test(s)) throw new Error("minified output contains a script terminator");
  const cfg = out.match(/<script>\n  \/\* Edit these[\s\S]*?<\/script>/)[0];
  const min = `<!-- SAFARIA v2 · production block (minified) · build ${new Date().toISOString().slice(0, 10)} · paste BELOW the existing SAFARIA code element. Delete this element to roll back. -->
<style id="safaria-v2-css">${minCss}</style>
${cfg}
<script id="safaria-v2-runtime">${runtime}</script>
<script id="safaria-v2-enhance">${enhance}</script>
`;
  fs.writeFileSync(path.join(__dirname, "safaria-v2-block.min.html"), min);
  console.log("safaria-v2-block.min.html", (min.length / 1024).toFixed(1) + " KB", "· gzip ≈", (require("zlib").gzipSync(min).length / 1024).toFixed(1) + " KB");
}
