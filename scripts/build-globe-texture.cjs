/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const { join } = require('node:path');

async function main() {
  const input = join(__dirname, '..', 'public', 'earth-natural.webp');
  const output = join(__dirname, '..', 'public', 'earth-emerald.webp');
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = Buffer.alloc(data.length);
  const width = info.width;
  const height = info.height;
  const stride = info.channels;
  const isLand = (index) => data[index + 1] > 64 && data[index + 1] > data[index] * 1.07;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * stride;
      const land = isLand(i);
      if (land) {
        const relief = Math.max(0, Math.min(1, (data[i + 1] - 65) / 125));
        const coastline = [x - 2, x + 2].some((nx) => nx >= 0 && nx < width && !isLand((y * width + nx) * stride)) ||
          [y - 2, y + 2].some((ny) => ny >= 0 && ny < height && !isLand((ny * width + x) * stride));
        result[i] = coastline ? 72 : Math.round(10 + 14 * relief);
        result[i + 1] = coastline ? 117 : Math.round(56 + 43 * relief);
        result[i + 2] = coastline ? 82 : Math.round(48 + 32 * relief);
      } else {
        const variation = (data[i + 1] % 9) / 9;
        result[i] = Math.round(4 + variation * 2);
        result[i + 1] = Math.round(22 + variation * 4);
        result[i + 2] = Math.round(27 + variation * 5);
      }
    }
  }
  await sharp(result, { raw: { width, height, channels: 3 } }).webp({ quality: 86, effort: 5 }).toFile(output);
  console.log(`Created ${output}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
