/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");

async function generate() {
  const source = path.join(__dirname, "..", "src", "app", "icon.png");
  const publicDir = path.join(__dirname, "..", "public");

  if (!fs.existsSync(source)) {
    console.error("Source icon not found at", source);
    process.exit(1);
  }

  // Generate 192x192 PNG
  await sharp(source)
    .resize(192, 192, { fit: "contain", background: { r: 3, g: 20, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));

  // Generate 512x512 PNG
  await sharp(source)
    .resize(512, 512, { fit: "contain", background: { r: 3, g: 20, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));

  // Generate 512x512 maskable PNG with 15% safe padding
  await sharp(source)
    .resize(360, 360, { fit: "contain", background: { r: 3, g: 20, b: 18, alpha: 1 } })
    .extend({
      top: 76,
      bottom: 76,
      left: 76,
      right: 76,
      background: { r: 3, g: 20, b: 18, alpha: 1 },
    })
    .png()
    .toFile(path.join(publicDir, "icon-maskable-512.png"));

  // Generate 180x180 apple-touch-icon
  await sharp(source)
    .resize(180, 180, { fit: "contain", background: { r: 3, g: 20, b: 18, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));

  console.log("PWA icon assets generated successfully in public/");
}

generate().catch(console.error);
