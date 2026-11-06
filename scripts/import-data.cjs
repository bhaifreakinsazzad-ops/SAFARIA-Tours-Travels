/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { parse } = require('csv-parse/sync');

const source = 'C:/Users/sazza/OneDrive/Desktop/SAFARIA';
const target = join(__dirname, '..', 'src', 'data');
mkdirSync(target, { recursive: true });

function load(name) {
  return parse(readFileSync(join(source, name), 'utf8').replace(/^\uFEFF/, ''), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
}

const destinations = load('safaria-destinations.csv').map((row) => ({
  code: row.code,
  city: row.city,
  country: row.country,
  region: row.region,
  lat: Number(row.lat),
  lon: Number(row.lon),
  origin: row.origin.toLowerCase() === 'true',
}));
const offers = load('safaria-offers.csv').map((row) => ({ ...row }));
if (destinations.length !== 33 || offers.length !== 26) throw new Error('Unexpected source record count');
if (destinations.some((item) => !Number.isFinite(item.lat) || !Number.isFinite(item.lon))) throw new Error('Invalid coordinates');

writeFileSync(join(target, 'destinations.json'), JSON.stringify(destinations, null, 2) + '\n');
writeFileSync(join(target, 'offers.json'), JSON.stringify(offers, null, 2) + '\n');
console.log(`Imported ${destinations.length} destinations and ${offers.length} offers`);
