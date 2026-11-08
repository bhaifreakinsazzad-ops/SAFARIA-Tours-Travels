import { test, expect } from "@playwright/test";

test.describe("SAFARIA Tours & Travels — Accessibility (a11y) & Bilingual Parity", () => {
  test("Verifies HTML lang attributes and bilingual route parity", async ({ page }) => {
    // 1. Bengali canonical root
    await page.goto("http://localhost:3000/");
    const rootHtml = page.locator("html");
    await expect(rootHtml).toHaveAttribute("lang", "bn");
    await expect(page.locator("h1")).toContainText("সঠিক ফ্লাইটে");

    // 2. English route
    await page.goto("http://localhost:3000/en");
    await expect(page.locator("h1")).toContainText("Global Travel");
  });

  test("Verifies viewport meta tag and responsive layout at mobile width", async ({ page }) => {
    // Set mobile viewport (iPhone 14 / standard mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");

    // Check viewport meta tag
    const metaViewport = page.locator("meta[name='viewport']");
    await expect(metaViewport).toHaveAttribute("content", /width=device-width/);

    // Verify no horizontal overflow beyond viewport width
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allowance for scrollbar pixel sub-rounding
  });

  test("Verifies Form controls have accessible labels and keyboard focus", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    const leadInput = page.locator("#lead-passenger-name");
    await expect(leadInput).toBeVisible();

    const leadLabel = page.locator("label[for='lead-passenger-name']");
    await expect(leadLabel).toBeVisible();
    await expect(leadLabel).toContainText("প্রধান যাত্রীর পুরো নাম");

    const phoneInput = page.locator("#phone-number");
    await expect(phoneInput).toBeVisible();
    const phoneLabel = page.locator("label[for='phone-number']");
    await expect(phoneLabel).toBeVisible();

    // Verify focus can be received
    await leadInput.focus();
    await expect(leadInput).toBeFocused();
  });

  test("Verifies modal dialogs declare role='dialog' and aria-modal='true'", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Open Tracking Modal
    const trackBtn = page.getByRole("button", { name: /ট্র্যাক রেফারেন্স/i }).first();
    await trackBtn.click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");

    // Close modal via accessible keyboard Escape
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
});
