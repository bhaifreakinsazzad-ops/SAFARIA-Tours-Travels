/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "src");
const configPath = path.join(root, "config", "constants.ts");
const files = [];
function collect(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const filename = path.join(dir, item.name);
    if (item.isDirectory()) collect(filename);
    else if (/\.(?:ts|tsx|css|json)$/.test(item.name)) files.push(filename);
  }
}
collect(root);
const forbidden = /home-301198|trippin\.vibing\.world|forms\.gle\/o5vTzTryLLAfEwjp6|8801641178437|৳২০,০০০|\b20000\b|৳১,৩০,০০০|\b130000\b/i;
for (const filename of files) {
  const content = fs.readFileSync(filename, "utf8");
  assert.equal(forbidden.test(content), false, `Legacy value found in ${filename}`);
  if (filename !== configPath) {
    assert.equal(content.includes("8801674178437"), false, `Contact number must come from config: ${filename}`);
    assert.equal(/\b(?:5999|69999)\b/.test(content), false, `Prices must come from config: ${filename}`);
    assert.equal(content.includes("vibing.world"), false, `Domain must come from config: ${filename}`);
  }
}
const config = fs.readFileSync(configPath, "utf8");
assert.match(config, /siteUrl:\s*"https:\/\/safaria\.vibing\.world"/);
assert.match(config, /whatsappNumber:\s*"8801674178437"/);
assert.match(config, /agencyMonthlyBdt:\s*5999/);
assert.match(config, /agencyAnnualBdt:\s*69999/);
assert.equal(/<form[^>]*action=|fetch\(["']https?:\/\//i.test(files.map((file) => fs.readFileSync(file, "utf8")).join("\n")), false);
console.log(JSON.stringify({ status: "pass", filesScanned: files.length, canonicalDomain: "safaria.vibing.world" }));
