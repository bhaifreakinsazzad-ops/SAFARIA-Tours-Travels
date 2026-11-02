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
