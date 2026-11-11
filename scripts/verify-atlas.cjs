/* Browser checks for the phase-one Atlas. Run against a locally running app. */
/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const output = process.env.SAFARIA_QA_DIR || path.join(os.tmpdir(), "safaria-atlas-qa");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : "chromium"), headless: true });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    assert.match(await page.title(), /SAFARIA/);
    assert.match(await page.locator("h1").innerText(), /সঠিক ফ্লাইটে/);
    assert.equal(await page.locator(".destination-button").count(), 8);
    assert.equal(await page.locator("canvas").count(), 1);
    assert.equal(await page.locator(".atlas-node-label").count(), 9);
    await page.screenshot({ path: path.join(output, "desktop.png"), fullPage: true });
    const riyadhNode = page.locator(".atlas-node-label").filter({ hasText: "RUH" }).first();
    const nodeBounds = await riyadhNode.boundingBox();
    assert.ok(nodeBounds);
    await page.mouse.move(nodeBounds.x + nodeBounds.width / 2, nodeBounds.y + nodeBounds.height / 2);
    await page.waitForTimeout(200);
    const riyadhTooltip = riyadhNode.locator('.atlas-tooltip');
assert.match(await riyadhTooltip.innerText(), /রিয়াদ/);
    await page.screenshot({ path: path.join(output, "node-hover.png") });
    await page.mouse.click(nodeBounds.x + nodeBounds.width / 2, nodeBounds.y + nodeBounds.height / 2);
    await page.getByRole("dialog").waitFor({ state: "visible" });
    assert.equal(await page.getByRole("dialog").count(), 1);
    await page.getByRole("button", { name: "বন্ধ করুন", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.setViewportSize({ width: 1440, height: 300 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".atlas-stage").getAttribute("data-rendering"), "paused");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".atlas-stage").getAttribute("data-rendering"), "running");

    await page.getByRole("button", { name: "EN", exact: true }).click();
    assert.match(await page.locator("h1").innerText(), /Gateway to Global Travel/);
    await page.locator(".destination-button").filter({ hasText: "Riyadh" }).click();
    await page.getByRole("dialog").waitFor({ state: "visible" });
    assert.equal(await page.getByRole("dialog").count(), 1);
    assert.equal(await page.getByRole("dialog").locator("select").first().inputValue(), "RUH");
    await page.waitForFunction(() => document.activeElement?.getAttribute("type") === "date");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("type")), "date");
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(output, "modal.png") });
    const date = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    await page.getByRole("dialog").locator('input[type="date"]').first().fill(date);
    await page.getByRole("dialog").locator('input[autocomplete="name"]').fill("Atlas Test");
    await page.getByRole("dialog").locator('input[type="tel"]').fill("+8801700000000");
    let whatsappUrl = "";
    await context.route("https://wa.me/**", (route) => { whatsappUrl = route.request().url(); return route.abort(); });
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Continue to WhatsApp" }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState("domcontentloaded").catch(() => undefined);
    await page.waitForTimeout(100);
    assert.match(whatsappUrl || popup.url(), /^https:\/\/wa\.me\/8801674178437\?text=/);
    const message = decodeURIComponent((whatsappUrl || popup.url()).split("?text=")[1]);
    assert.match(message, /Dhaka \(DAC\) → Riyadh \(RUH\)/);
    assert.match(message, /Atlas Test/);
    assert.match(message, /supplier confirmation/);
    await popup.close();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.deepEqual(errors, []);

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await mobile.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.getByRole("button", { name: "মেনু খুলুন" }).click();
    assert.equal(await mobile.getByRole("navigation").getByRole("link", { name: "জার্নি অ্যাটলাস" }).isVisible(), true);
    await mobile.locator(".mobile-menu-toggle").press("Escape");
    assert.equal(await mobile.locator(".mobile-menu-toggle").getAttribute("aria-expanded"), "false");
    await mobile.screenshot({ path: path.join(output, "mobile.png"), fullPage: true });
    await mobile.locator(".destination-button").filter({ hasText: "রিয়াদ" }).click();
    await mobile.getByRole("dialog").waitFor({ state: "visible" });
    assert.equal(await mobile.getByRole("dialog").count(), 1);
    await mobile.waitForTimeout(300);
    await mobile.screenshot({ path: path.join(output, "mobile-modal.png") });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.close();

    for (const width of [320, 768]) {
      const responsive = await browser.newPage({ viewport: { width, height: 900 } });
      await responsive.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
      assert.equal(await responsive.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `horizontal overflow at ${width}px`);
      await responsive.close();
    }

    const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
    await reduced.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    assert.equal(await reduced.locator("canvas").count(), 0);
    assert.equal(await reduced.locator(".atlas-fallback").isVisible(), true);
    assert.equal(await reduced.locator(".destination-button").count(), 8);
    await reduced.close();

    const blocked = await browser.newPage();
    await blocked.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (["webgl", "webgl2", "experimental-webgl"].includes(type)) return null;
        return original.call(this, type, ...args);
      };
    });
    await blocked.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    assert.equal(await blocked.locator(".atlas-fallback").isVisible(), true);
    assert.equal(await blocked.locator(".destination-button").count(), 8);
    await blocked.close();

    const lowEnd = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await lowEnd.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, get: () => 2 }));
    await lowEnd.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "networkidle" });
    assert.equal(await lowEnd.locator("canvas").count(), 0);
    assert.equal(await lowEnd.locator(".atlas-fallback").isVisible(), true);
    await lowEnd.close();

    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(process.env.SAFARIA_URL || "http://localhost:3000", { waitUntil: "domcontentloaded" });
    assert.match(await noJs.locator("h1").innerText(), /সঠিক ফ্লাইটে/);
    assert.equal(await noJs.locator(".atlas-fallback").isVisible(), true);
    await noJs.close();
    console.log(JSON.stringify({ status: "pass", routeCount: 8, whatsappNumber: "8801674178437", screenshots: output, errors }));
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
