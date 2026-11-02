// Builds delivery/safaria-ghl-block.html: the copy page with the exact production block embedded.
const fs = require("fs"), path = require("path");
const code = fs.readFileSync(path.join(__dirname, "..", "safaria-v2-block.min.html"), "utf8");
const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = fs.readFileSync(path.join(__dirname, "page.template.html"), "utf8")
  .replace("__SIZE__", (Buffer.byteLength(code) / 1024).toFixed(1) + " KB")
  .replace("__DATE__", new Date().toISOString().slice(0, 10))
  .replace("__CODE__", () => esc);
fs.writeFileSync(path.join(__dirname, "safaria-ghl-block.html"), html);
// Round-trip check: unescaping the embedded text must give back the exact block.
const back = html.split('aria-label="Full GHL block code">')[1].split("</textarea>")[0].replace(/&lt;/g, "<").replace(/&amp;/g, "&");
console.log("embedded", back === code ? "IDENTICAL" : "MISMATCH", (html.length / 1024).toFixed(1) + " KB page");
