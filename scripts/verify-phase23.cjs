/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

async function main() {
  const output = process.env.SAFARIA_QA_DIR || path.join(__dirname, '..', 'qa-phase23');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : 'chromium', headless: true });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('WebGL')) errors.push(message.text()); });
  await page.goto(process.env.SAFARIA_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
  await page.locator('.hero').screenshot({ path: path.join(output, 'hero-desktop.png') });
  for (const [id, selector] of [['sf26-offers', '.offer-card'], ['sf-destinations', '.explorer-card'], ['sf-travel-form', '.studio-shell'], ['sf-agency', '.agency-form']]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.locator(selector).first().waitFor({ state: 'visible' });
  }
  assert.equal(await page.locator('.offer-card').count(), 26);
  assert.equal(await page.locator('.explorer-card').count(), 33);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  for (const group of await page.locator('.offer-group').all()) { await group.scrollIntoViewIfNeeded(); await page.waitForTimeout(1100); }
  await page.locator('#sf26-offers').screenshot({ path: path.join(output, 'offers-desktop.png') });
  await page.locator('#sf-destinations').screenshot({ path: path.join(output, 'destinations-desktop.png') });
  await page.locator('#sf-travel-form').screenshot({ path: path.join(output, 'studio-desktop.png') });
  await page.locator('#sf-agency').screenshot({ path: path.join(output, 'agency-desktop.png') });

  await page.locator('.offer-card').nth(9).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.equal(await page.locator('.enquiry-dialog select').first().inputValue(), 'COUNTRY:China');
  assert.equal(await page.locator('.enquiry-dialog input').first().inputValue(), 'China Southern');
  await page.locator('.enquiry-dialog .dialog-close').click();

  const london = page.locator('.destination-card-wrap').filter({ hasText: 'LON' });
  await london.locator('.favorite-button').click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.destination-card-wrap').filter({ hasText: 'LON' }).locator('.favorite-button').getAttribute('aria-pressed'), 'true');
  await page.locator('.explorer-filters button').last().click();
  assert.equal(await page.locator('.explorer-card').count(), 1);
  await page.locator('.explorer-filters button').first().click();
  await page.locator('.explorer-search input').fill('Toronto');
  assert.equal(await page.locator('.explorer-card').count(), 1);
  await page.locator('.explorer-card').click();
  await page.locator('.destination-detail').waitFor({ state: 'visible' });
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.locator('.destination-detail .button').click();
  assert.equal(await page.locator('.enquiry-dialog select').first().inputValue(), 'YTO');
  await page.locator('.enquiry-dialog .dialog-close').click();

  await page.locator('#sf-travel-form button[type=submit]').click();
  await page.locator('.studio-panel h3').filter({ hasText: 'রুট ও তারিখ' }).waitFor();
  await page.locator('#sf-travel-form button[type=submit]').click();
  assert.equal(await page.locator('[data-travel-field=destination]').getAttribute('aria-invalid'), 'true');
  await page.locator('[data-travel-field=destination]').selectOption('KUL');
  const departure = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const returning = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  await page.locator('[data-travel-field=departure]').fill(departure);
  await page.locator('[data-travel-field=returnDate]').fill(returning);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-travel-field=destination]').inputValue(), 'KUL');
  assert.equal(await page.locator('[data-travel-field=departure]').inputValue(), departure);
  await page.locator('#sf-travel-form button[type=submit]').click();
  await page.locator('.studio-panel h3').filter({ hasText: 'যাত্রী' }).waitFor();
  await page.locator('#sf-travel-form button[type=submit]').click();
  await page.locator('.magic-draft').click();
  await page.waitForTimeout(500);
  assert.match(await page.locator('.studio-fields textarea').inputValue(), /ঢাকা/);
  await page.locator('#sf-travel-form button[type=submit]').click();
  await page.locator('[data-travel-field=fullName]').fill('Test Traveller');
  await page.locator('[data-travel-field=phone]').fill('+8801700000000');
  await page.locator('[data-travel-field=consent]').check();
  await page.evaluate(() => { window.open = (url) => { window.__draftUrl = url; return null; }; });
  await page.locator('#sf-travel-form button[type=submit]').click();
  const travelUrl = await page.evaluate(() => window.__draftUrl);
  assert.match(travelUrl, /^https:\/\/wa\.me\/8801674178437\?text=/);
  assert.match(decodeURIComponent(travelUrl.split('text=')[1]), /ঢাকা/);
  assert.match(decodeURIComponent(travelUrl.split('text=')[1]), /Kuala Lumpur/);

  await page.locator('.plan-toggle button').last().click();
  assert.match(await page.locator('.price-display').innerText(), /৬৯,৯৯৯/);
  assert.match(await page.locator('.savings-badge').innerText(), /১,৯৮৯/);
  await page.locator('#sf-agency-form button[type=submit]').click();
  assert.equal(await page.locator('[data-agency-field=agencyName]').getAttribute('aria-invalid'), 'true');
  await page.locator('[data-agency-field=agencyName]').fill('Example Agency');
  await page.locator('[data-agency-field=location]').fill('Dhaka');
  await page.locator('[data-agency-field=businessStatus]').selectOption('established');
  await page.locator('[data-agency-field=requirement]').selectOption('air');
  await page.locator('[data-agency-field=fullName]').fill('Agency Owner');
  await page.locator('[data-agency-field=phone]').fill('+8801700000000');
  await page.locator('[data-agency-field=email]').fill('owner@example.com');
  await page.locator('[data-agency-field=consent]').check();
  await page.locator('[data-agency-field=trialConsent]').check();
  await page.locator('#sf-agency-form button[type=submit]').click();
  const agencyUrl = await page.evaluate(() => window.__draftUrl);
  assert.match(agencyUrl, /^https:\/\/wa\.me\/8801674178437\?text=/);
  assert.match(decodeURIComponent(agencyUrl.split('text=')[1]), /69999/);
  assert.match(decodeURIComponent(agencyUrl.split('text=')[1]), /verification and fair use/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.locator('.hero').screenshot({ path: path.join(output, 'hero-mobile.png') });
  await page.locator('.atlas-enable-3d').click();
  await page.locator('.atlas-canvas').waitFor({ state: 'visible' });
  await page.locator('.hero').screenshot({ path: path.join(output, 'hero-mobile-3d.png') });
  for (const [id, selector] of [['sf26-offers', '.offer-card'], ['sf-destinations', '.explorer-card'], ['sf-travel-form', '.studio-shell'], ['sf-agency', '.agency-form']]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.locator(selector).first().waitFor({ state: 'visible' });
  }
  for (const group of await page.locator('.offer-group').all()) { await group.scrollIntoViewIfNeeded(); await page.waitForTimeout(1100); }
  await page.locator('#sf26-offers').screenshot({ path: path.join(output, 'offers-mobile.png') });
  await page.locator('#sf-destinations').screenshot({ path: path.join(output, 'destinations-mobile.png') });
  await page.locator('#sf-travel-form').screenshot({ path: path.join(output, 'studio-mobile.png') });
  await page.locator('#sf-agency').screenshot({ path: path.join(output, 'agency-mobile.png') });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ status: 'pass', offers: 26, destinations: 33, whatsapp: '8801674178437', errors }));
  await browser.close();
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
