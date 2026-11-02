// Builds delivery/safaria-v4-copy.html: a page with one "Copy all code" button that carries the exact production block.
const fs = require("fs"), path = require("path");
const code = fs.readFileSync(path.join(__dirname, "..", "safaria-v4-block.min.html"), "utf8");
// "</script" would end the carrier <script type="text/plain">, so it is stored as "<\/script" and restored by the page before copying.
const stored = code.replace(/<\/script/gi, (m) => "<\\/" + m.slice(2));
const html = fs.readFileSync(path.join(__dirname, "page.v4.template.html"), "utf8")
  .replace("__SIZE__", (Buffer.byteLength(code) / 1024).toFixed(0) + " KB")
  .replace("__DATE__", new Date().toISOString().slice(0, 10))
  .replace("__CODE__", () => stored);
fs.writeFileSync(path.join(__dirname, "safaria-v4-copy.html"), html);
// Round-trip check: extract, un-escape exactly as the page does, compare byte for byte.
const back = html.split('<script type="text/plain" id="code">')[1].split("</script>")[0].replace(/<\\\/script/g, "</script");
console.log("embedded", back === code ? "IDENTICAL" : "MISMATCH", "·", (html.length / 1024).toFixed(0) + " KB page");
