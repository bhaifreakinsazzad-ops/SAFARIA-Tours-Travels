const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");

const artifactDir = "C:/Users/sazza/.gemini/antigravity/brain/fc82c390-175d-4637-b09a-a349deb396ef";
const publicDir = path.resolve(__dirname, "../public");

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Homepage
  const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesktop.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await pageDesktop.waitForTimeout(1000);
  const desktopPath = path.join(publicDir, "safaria-desktop-preview.png");
  await pageDesktop.screenshot({ path: desktopPath });
  fs.copyFileSync(desktopPath, path.join(artifactDir, "safaria-desktop-preview.png"));
  console.log("Desktop preview captured.");

  // 2. Mobile Homepage
  const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMobile.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await pageMobile.waitForTimeout(1000);
  const mobilePath = path.join(publicDir, "safaria-mobile-preview.png");
  await pageMobile.screenshot({ path: mobilePath });
  fs.copyFileSync(mobilePath, path.join(artifactDir, "safaria-mobile-preview.png"));
  console.log("Mobile preview captured.");

  // 3. Partner Portal
  const pagePartner = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pagePartner.goto("http://localhost:3000/partner", { waitUntil: "domcontentloaded" });
  await pagePartner.waitForTimeout(1000);
  const partnerPath = path.join(publicDir, "safaria-partner-preview.png");
  await pagePartner.screenshot({ path: partnerPath });
  fs.copyFileSync(partnerPath, path.join(artifactDir, "safaria-partner-preview.png"));
  console.log("Partner portal preview captured.");

  // 4. Admin Operations Portal
  const pageAdmin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageAdmin.goto("http://localhost:3000/admin", { waitUntil: "domcontentloaded" });
  await pageAdmin.waitForTimeout(1000);
  const adminPath = path.join(publicDir, "safaria-admin-preview.png");
  await pageAdmin.screenshot({ path: adminPath });
  fs.copyFileSync(adminPath, path.join(artifactDir, "safaria-admin-preview.png"));
  console.log("Admin preview captured.");

  // 5. Tracking Modal Open
  const pageTracking = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageTracking.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await pageTracking.waitForTimeout(1000);
  const trackBtn = pageTracking.getByRole("button", { name: /ট্র্যাক রেফারেন্স/i }).first();
  await trackBtn.click();
  await pageTracking.waitForSelector("[role='dialog']");
  await pageTracking.waitForTimeout(500);
  const trackingPath = path.join(publicDir, "safaria-tracking-preview.png");
  await pageTracking.screenshot({ path: trackingPath });
  fs.copyFileSync(trackingPath, path.join(artifactDir, "safaria-tracking-preview.png"));
  console.log("Tracking modal preview captured.");

  await browser.close();
  console.log("All screenshots captured and saved to public and artifact directories.");
}

capture().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
