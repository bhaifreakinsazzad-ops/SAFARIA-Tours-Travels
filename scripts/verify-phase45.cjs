/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { chromium, devices } = require("playwright");

const origin = process.env.SAFARIA_URL || "http://localhost:3000";
const bannedRequest = /home-301198|trippin\.vibing\.world|forms\.gle|docs\.google\.com\/forms|8801641178437/i;

async function main() {
  const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : "chromium", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto(origin, { waitUntil: "networkidle" });
    assert.equal(await page.title(), "SAFARIA Tours & Travels | Your Gateway to Global Travel");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://safaria.vibing.world");
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute("content"), "https://safaria.vibing.world/images/social-share.jpg");
    assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute("content"), "summary_large_image");
    assert.ok(await page.locator('link[rel="preload"][as="font"]').count() >= 2);
    assert.equal(await page.locator('img[src^="data:"]').count(), 0);
    assert.equal(await page.locator('.hero-skyline img').count(), 1);
    const robots = await page.request.get(`${origin}/robots.txt`);
    const sitemap = await page.request.get(`${origin}/sitemap.xml`);
    assert.equal(robots.ok(), true);
    assert.equal(sitemap.ok(), true);
    assert.match(await sitemap.text(), /https:\/\/safaria\.vibing\.world\//);
    assert.deepEqual(requests.filter((url) => bannedRequest.test(url)), []);
    await page.close();

    for (const width of [320, 390, 768, 1440]) {
      const browserPage = await browser.newPage({ viewport: { width, height: 900 } });
      await browserPage.goto(origin, { waitUntil: "networkidle" });
      await browserPage.evaluate(() => {
        window.__unexpectedCls = 0;
        new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__unexpectedCls += entry.value; }).observe({ type: "layout-shift", buffered: false });
      });
      const bnHeight = await browserPage.evaluate(() => parseFloat(getComputedStyle(document.body).lineHeight));
      await browserPage.getByRole("button", { name: "EN", exact: true }).click();
      assert.equal(await browserPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `EN overflow at ${width}`);
      const enHeight = await browserPage.evaluate(() => parseFloat(getComputedStyle(document.body).lineHeight));
      assert.ok(bnHeight > enHeight, `Bengali line height should be larger at ${width}`);
      await browserPage.getByRole("button", { name: "বাংলা", exact: true }).click();
      assert.equal(await browserPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `BN overflow at ${width}`);
      assert.equal(await browserPage.locator('.hero-cta').evaluate((element) => { const box = element.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth; }), true);
      await browserPage.waitForTimeout(550);
      assert.ok((await browserPage.evaluate(() => window.__unexpectedCls)) <= 0.001, `Unexpected CLS at ${width}`);
      await browserPage.close();
    }

    const date = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    for (const deviceName of ["iPhone 13", "Pixel 7"]) {
      const context = await browser.newContext({ ...devices[deviceName] });
      const devicePage = await context.newPage();
      await devicePage.goto(origin, { waitUntil: "networkidle" });
      await devicePage.locator(".destination-button").first().click();
      await devicePage.getByRole("dialog").locator('input[type="date"]').first().fill(date);
      await devicePage.getByRole("dialog").locator('input[autocomplete="name"]').fill("Device Test");
      await devicePage.getByRole("dialog").locator('input[type="tel"]').fill("+8801700000000");
      await devicePage.getByRole("dialog").getByRole("checkbox").check();
      await devicePage.getByRole("dialog").locator('button[type="submit"]').click();
      const handoff = devicePage.getByRole("dialog").getByRole("link", { name: /WhatsApp/ });
      await handoff.waitFor({ state: "visible" });
      const href = (await handoff.getAttribute("href")) || "";
      assert.match(href, /^https:\/\/wa\.me\/8801674178437\?text=/, deviceName);
      assert.match(decodeURIComponent(href.split("?text=")[1]), /Device Test/);
      assert.match(decodeURIComponent(href.split("?text=")[1]), /supplier confirmation/);
      await context.close();
    }
    console.log(JSON.stringify({ status: "pass", canonical: "https://safaria.vibing.world/", emulatedDevices: ["iPhone 13", "Pixel 7"] }));
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
