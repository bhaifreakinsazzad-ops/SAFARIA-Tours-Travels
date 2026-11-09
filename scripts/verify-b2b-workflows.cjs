/* eslint-disable @typescript-eslint/no-require-imports */
// ==============================================================================
// SAFARIA Tours & Travels — End-to-End B2B Workflows & Security Verification
// Exercises real browser login, staff triage, agency approval, partner desks,
// cross-tenant isolation, and session revocation against running Next.js instance.
// ==============================================================================

const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const origin = process.env.SAFARIA_URL || "http://localhost:3000";
const output = process.env.SAFARIA_QA_DIR || path.join(__dirname, "..", "qa-b2b-workflows");

async function runB2BVerification() {
  console.log(`[B2B-QA] Starting End-to-End B2B Workflows Verification on ${origin}...`);
  fs.mkdirSync(output, { recursive: true });

  const browser = await chromium.launch({
    channel: process.platform === "win32" ? "msedge" : "chromium",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("WebGL") && !msg.text().includes("favicon")) {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // -------------------------------------------------------------------------
    // Phase 1: Unauthenticated Guard Check
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 1. Verifying unauthenticated access redirects to /login...");
    await page.goto(`${origin}/admin`, { waitUntil: "networkidle" });
    assert.match(page.url(), /\/login/, "Visiting /admin without session must redirect to /login");

    await page.goto(`${origin}/partner`, { waitUntil: "networkidle" });
    assert.match(page.url(), /\/login/, "Visiting /partner without session must redirect to /login");

    // -------------------------------------------------------------------------
    // Phase 2: Staff Authentication & Admin Triage
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 2. Logging in with individual staff credentials...");
    await page.goto(`${origin}/login`, { waitUntil: "networkidle" });

    // Submit invalid credentials first to verify error feedback
    await page.fill('input[type="email"]', "ops@safaria.vibing.world");
    await page.fill('input[type="password"]', "wrong-password-999");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    const errorEl = page.locator("text=Invalid staff credentials");
    assert.equal(await errorEl.count(), 1, "Must show error on invalid staff credentials");

    // Submit valid credentials
    await page.fill('input[type="password"]', "safaria-ops-2026");
    const [loginRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login")),
      page.click('button[type="submit"]'),
    ]);
    const loginData = await loginRes.json();
    console.log("[B2B-QA] Login API response:", loginRes.status(), loginData);
    await page.waitForURL("**/admin", { timeout: 10000, waitUntil: "commit" });
    assert.match(page.url(), /\/admin/, "Staff login must route to /admin triage portal");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(output, "01-admin-portal.png") });

    // Switch to AGENCIES tab in Admin Triage and approve partner with real staff session
    console.log("[B2B-QA] 3. Approving B2B Partner Agency and issuing credentials with staff session...");
    await page.click("button:has-text('B2B Agency Intake')");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(output, "02-admin-agencies-tab.png") });

    // Approve Green Delta Travels and issue credentials using the active staff cookie session
    const approveRes = await page.request.patch(`${origin}/api/admin/agencies`, {
      headers: { "Content-Type": "application/json", "Origin": origin },
      data: {
        id: "agency-greendelta-01",
        status: "ACTIVE_PARTNER",
        issueCredentials: true,
      },
    });
    const approveJson = await approveRes.json();
    console.log("[B2B-QA] Staff agency approval response:", approveRes.status(), approveJson);
    assert.equal(approveJson.success, true, "Agency approval via staff session must succeed");
    const issuedPassword = approveJson.issuedPassword;
    assert.ok(issuedPassword, "Must issue secure temporary password");

    // -------------------------------------------------------------------------
    // Phase 3: Staff Logout
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 4. Testing staff logout & session revocation...");
    await page.click("button:has-text('Sign Out')");
    await page.waitForURL("**/login", { timeout: 10000, waitUntil: "commit" });
    assert.match(page.url(), /\/login/, "Staff logout must route back to /login");

    // -------------------------------------------------------------------------
    // Phase 4: B2B Partner Login & Operational Desks
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 5. Logging in as approved B2B Partner...");
    await page.goto(`${origin}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "partner@greendelta.com");
    await page.fill('input[type="password"]', issuedPassword);
    const [partnerLoginRes] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/auth/login")),
      page.click('button[type="submit"]'),
    ]);
    const partnerLoginData = await partnerLoginRes.json();
    console.log("[B2B-QA] Partner Login API response:", partnerLoginRes.status(), partnerLoginData);
    await page.waitForURL("**/partner", { timeout: 10000, waitUntil: "commit" });
    assert.match(page.url(), /\/partner/, "Partner login must route to /partner desk workspace");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(output, "03-partner-workspace.png") });

    // Desk 1: FareDesk
    console.log("[B2B-QA] 6. Verifying Desk 1 — FareDesk...");
    assert.ok(await page.locator("text=FareDesk").count() >= 1, "FareDesk tab must exist");
    await page.click("button:has-text('FareDesk')");
    await page.screenshot({ path: path.join(output, "04-faredesk.png") });

    // Desk 2: BookingDesk
    console.log("[B2B-QA] 7. Verifying Desk 2 — BookingDesk...");
    await page.click("button:has-text('BookingDesk')");
    await page.waitForTimeout(400);
    assert.ok(await page.locator("text=BookingDesk").count() >= 1, "BookingDesk tab must exist");
    await page.screenshot({ path: path.join(output, "05-bookingdesk.png") });

    // Desk 3: ClearMargin
    console.log("[B2B-QA] 8. Verifying Desk 3 — ClearMargin...");
    await page.click("button:has-text('ClearMargin')");
    await page.waitForTimeout(400);
    assert.ok(await page.locator("text=ClearMargin").count() >= 1, "ClearMargin tab must exist");
    await page.screenshot({ path: path.join(output, "06-clearmargin.png") });

    // Desk 4: AfterCare
    console.log("[B2B-QA] 9. Verifying Desk 4 — AfterCare...");
    await page.click("button:has-text('AfterCare')");
    await page.waitForTimeout(400);
    assert.ok(await page.locator("text=AfterCare").count() >= 1, "AfterCare tab must exist");
    await page.screenshot({ path: path.join(output, "07-aftercare.png") });

    // Desk 5: Verified Workflow
    console.log("[B2B-QA] 10. Verifying Desk 5 — Verified Workflow...");
    await page.click("button:has-text('Verified Workflow')");
    await page.waitForTimeout(400);
    assert.ok(await page.locator("text=Verified Workflow").count() >= 1, "Verified Workflow tab must exist");
    await page.screenshot({ path: path.join(output, "08-verified-workflow.png") });

    // Desk 6: PartnerGrowth
    console.log("[B2B-QA] 11. Verifying Desk 6 — PartnerGrowth...");
    await page.click("button:has-text('PartnerGrowth')");
    await page.waitForTimeout(400);
    assert.ok(await page.locator("text=PartnerGrowth").count() >= 1, "PartnerGrowth tab must exist");
    await page.screenshot({ path: path.join(output, "09-partnergrowth.png") });

    // -------------------------------------------------------------------------
    // Phase 5: Cross-Tenant Isolation
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 12. Verifying cross-tenant rejection...");
    // Partner attempts to request desk records belonging to another agency
    const crossTenantRes = await page.request.get(`${origin}/api/partner/desk?agencyId=agency-foreign-999`, {
      headers: { "Content-Type": "application/json" },
    });
    // The server must reject the foreign agencyId or scope strictly to the authenticated agency
    const crossTenantData = await crossTenantRes.json();
    if (crossTenantRes.status() === 200) {
      // Must not leak foreign agency data
      const leakedForeign = (crossTenantData.records || []).some(
        (r) => r.agencyId === "agency-foreign-999"
      );
      assert.equal(leakedForeign, false, "Must never return foreign agency desk records");
    } else {
      assert.ok([401, 403].includes(crossTenantRes.status()), "Must reject unauthorized cross-tenant query");
    }

    // -------------------------------------------------------------------------
    // Phase 6: Durable Session Revocation
    // -------------------------------------------------------------------------
    console.log("[B2B-QA] 13. Verifying durable session revocation across requests...");
    const logoutRes = await page.request.post(`${origin}/api/auth/logout`, {
      headers: { Origin: origin },
    });
    assert.equal(logoutRes.status(), 200, "Logout API must succeed");

    const revokedCheck = await page.request.get(`${origin}/api/auth/me`);
    const revokedJson = await revokedCheck.json();
    assert.equal(revokedJson.authenticated, false, "Session must be unauthenticated following logout");

    console.log("[B2B-QA] ✅ All End-to-End B2B Workflows & Security Verification PASSED!");
  } finally {
    await browser.close();
  }
}

runB2BVerification()
  .then(() => {
    console.log("[B2B-QA] Execution completed successfully with 0 errors.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[B2B-QA] Verification FAILED:", err);
    process.exit(1);
  });
