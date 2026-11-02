// One-off: rasterises Natural Earth 110m land (world-atlas) into a 360x180 one-bit mask for the globe's dotted continents.
//   ESBUILD_DIR=<folder with node_modules/{world-atlas,topojson-client,d3-geo}> node ghl-block/v3/make-land.js
// Output: ghl-block/v3/land.b64 (about 11 KB). Bit i = land at (lon = -180 + i%360 + .5, lat = 90 - floor(i/360) - .5), row-major from the north.
const fs = require("fs"), path = require("path");
const need = (m) => require(path.join(process.env.ESBUILD_DIR, "node_modules", m));
const topo = need("topojson-client"), { geoContains } = need("d3-geo");
const world = JSON.parse(fs.readFileSync(path.join(process.env.ESBUILD_DIR, "node_modules", "world-atlas", "land-110m.json"), "utf8"));
const land = topo.feature(world, world.objects.land);
const W = 360, H = 180, bytes = new Uint8Array(Math.ceil(W * H / 8));
let n = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const lon = -180 + x + 0.5, lat = 90 - y - 0.5;
  if (geoContains(land, [lon, lat])) { const i = y * W + x; bytes[i >> 3] |= 1 << (i & 7); n++; }
}
fs.writeFileSync(path.join(__dirname, "land.b64"), Buffer.from(bytes).toString("base64"));
console.log("land cells", n, "of", W * H, "→ land.b64", Buffer.from(bytes).toString("base64").length, "chars");
