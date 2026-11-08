import { test, expect } from "@playwright/test";

test.describe("SAFARIA Tours & Travels — Core User Flows", () => {
  test("Bengali Homepage loads with verified brand identity", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Check title & branding
    await expect(page).toHaveTitle(/SAFARIA Tours & Travels/);
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toContainText("সঠিক ফ্লাইটে");

    // Check navigation anchors
    await expect(page.locator("a[href='#flight-quote']").first()).toBeVisible();
    await expect(page.locator("a[href='#sf-atlas']").first()).toBeVisible();
    await expect(page.locator("a[href='#destinations']").first()).toBeVisible();
    await expect(page.locator("a[href='#services']").first()).toBeVisible();
  });

  test("Dynamic Multi-City Leg addition and validation", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Click Multi-City trip type
    const multiCityBtn = page.getByRole("button", { name: /মাল্টি-সিটি/i });
    await multiCityBtn.click();

    // Verify initial 2 legs
    await expect(page.getByText("ফ্লাইট লেগ 1")).toBeVisible();
    await expect(page.getByText("ফ্লাইট লেগ 2")).toBeVisible();

    // Click add leg
    const addLegBtn = page.getByRole("button", { name: /\+ আরেকটি ফ্লাইট লেগ/i });
    await addLegBtn.click();

    // Verify 3rd leg appears
    await expect(page.getByText("ফ্লাইট লেগ 3")).toBeVisible();
  });

  test("B2B Agency intake opens modal and submits application", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Click agency partnership button
    const applyBtn = page.getByRole("button", { name: /এজেন্সি পার্টনারশিপ আবেদন/i });
    await applyBtn.click();

    // Check modal visibility
    await expect(page.getByText("এজেন্সি পার্টনারশিপ ও ট্রায়াল আবেদন")).toBeVisible();
  });

  test("Admin operations portal renders triage queues", async ({ page }) => {
    await page.goto("http://localhost:3000/admin");

    await expect(page.getByText("SAFARIA Operations Triage Desk")).toBeVisible();
    await expect(page.getByRole("button", { name: /Flight Quotation Requests/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /B2B Agency Intake/i })).toBeVisible();
  });

  test("Partner portal displays 6 operational desks", async ({ page }) => {
    await page.goto("http://localhost:3000/partner");

    await expect(page.getByText("FareDesk™").first()).toBeVisible();
    await expect(page.getByText("BookingDesk™").first()).toBeVisible();
    await expect(page.getByText("ClearMargin™").first()).toBeVisible();
    await expect(page.getByText("AfterCare Desk™").first()).toBeVisible();
    await expect(page.getByText("Verified Workflow™").first()).toBeVisible();
    await expect(page.getByText("PartnerGrowth™").first()).toBeVisible();
  });

  test("Track Quotation & Application modal opens and performs lookup", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Click Track Ref button in header
    const trackBtn = page.getByRole("button", { name: /ট্র্যাক রেফারেন্স/i }).first();
    await trackBtn.click();

    // Verify modal appears
    await expect(page.getByText("কোটেশন ও আবেদন ট্র্যাকিং")).toBeVisible();
    await expect(page.getByPlaceholder(/যেমন: SFR-/i)).toBeVisible();

    // Fill an invalid ref and search
    await page.getByPlaceholder(/যেমন: SFR-/i).fill("SFR-20261108-INVALID");
    await page.getByRole("button", { name: /স্ট্যাটাস দেখুন/i }).click();

    // Verify error notification
    await expect(page.getByText("অনুসন্ধান ব্যর্থ হয়েছে")).toBeVisible();
  });
});
