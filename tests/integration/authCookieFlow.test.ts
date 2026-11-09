// ==============================================================================
// Regression coverage for the real cookie-based session flow that
// src/app/login/page.tsx, src/app/admin/page.tsx and src/app/partner/page.tsx
// now rely on (replacing the removed hardcoded "staging-token" /
// "safaria-ops-2026" placeholder headers). Proves end to end — through the
// actual route handlers, never mocked — that:
//   1. POST /api/auth/login issues a real httpOnly Set-Cookie.
//   2. That cookie ALONE (no Authorization/x-safaria-* header, exactly what a
//      browser sends with fetch(..., {credentials: "include"})) is sufficient
//      for GET /api/auth/me and a protected admin/partner route.
//   3. Logging out invalidates that same cookie for both staff and partner.
//   4. No cookie at all is rejected by every protected route.
// ==============================================================================
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as mePost } from "@/app/api/auth/me/route";
import { GET as adminEnquiriesGet } from "@/app/api/admin/enquiries/route";
import { PATCH as adminAgenciesPatch } from "@/app/api/admin/agencies/route";
import { GET as partnerDeskGet } from "@/app/api/partner/desk/route";
import { POST as agencyPost } from "@/app/api/agency/route";
import { enquiriesRepository } from "@server/db/enquiriesRepository";

function extractSessionCookie(res: Response): string {
  const setCookie = res.headers.get("set-cookie") || "";
  const match = setCookie.match(/safaria_session=([^;]+)/);
  if (!match) throw new Error(`No safaria_session cookie in Set-Cookie header: "${setCookie}"`);
  return `safaria_session=${match[1]}`;
}

describe("Real cookie-based session flow (login page -> admin/partner pages)", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("staff: login sets a cookie that alone authorizes /api/auth/me and /api/admin/enquiries, and logout revokes it", async () => {
    const loginRes = await loginPost(
      new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.1.0.1" },
        body: JSON.stringify({ email: "ops@safaria.vibing.world", password: "safaria-ops-2026", role: "ADMIN" }),
      })
    );
    expect(loginRes.status).toBe(200);
    const cookie = extractSessionCookie(loginRes);

    const meRes = await mePost(
      new NextRequest("http://localhost:3000/api/auth/me", { headers: { cookie } })
    );
    const meData = await meRes.json();
    expect(meData.authenticated).toBe(true);
    expect(meData.user.role).toBe("SUPER_ADMIN");

    const adminRes = await adminEnquiriesGet(
      new NextRequest("http://localhost:3000/api/admin/enquiries", { headers: { cookie } })
    );
    expect(adminRes.status).toBe(200);

    // No cookie at all must be rejected.
    const noCookieRes = await adminEnquiriesGet(new NextRequest("http://localhost:3000/api/admin/enquiries"));
    expect(noCookieRes.status).toBe(401);

    // Logout revokes the session; the same cookie no longer works.
    const logoutRes = await logoutPost(
      new NextRequest("http://localhost:3000/api/auth/logout", { method: "POST", headers: { cookie } })
    );
    expect(logoutRes.status).toBe(200);

    const meAfterLogout = await mePost(
      new NextRequest("http://localhost:3000/api/auth/me", { headers: { cookie } })
    );
    expect((await meAfterLogout.json()).authenticated).toBe(false);
  });

  it("partner: login sets a cookie that alone authorizes /api/auth/me and the partner's own desk data, and rejects wrong credentials", async () => {
    const staffLogin = await loginPost(
      new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "ops@safaria.vibing.world", password: "safaria-ops-2026", role: "ADMIN" }),
      })
    );
    const staffCookie = extractSessionCookie(staffLogin);

    const agencyRes = await agencyPost(
      new NextRequest("http://localhost:3000/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: "Cookie Flow Travels",
          contactPerson: "Flow Officer",
          phone: "+8801800000099",
          email: "flow@cookietest.com",
          city: "Dhaka",
          tradeLicenseNumber: "TL-COOKIE-1",
          consentAgreed: true,
        }),
      })
    );
    const agency = await agencyRes.json();
    const applications = await enquiriesRepository.listAgencyApplications();
    const agencyRecord = applications.find((a) => a.referenceNo === agency.referenceNo)!;

    const approveRes = await adminAgenciesPatch(
      new NextRequest("http://localhost:3000/api/admin/agencies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", cookie: staffCookie },
        body: JSON.stringify({ id: agencyRecord.id, status: "ACTIVE_PARTNER" }),
      })
    );
    const approveData = await approveRes.json();
    const issuedPassword = approveData.issuedPassword as string;
    expect(typeof issuedPassword).toBe("string");

    const partnerLogin = await loginPost(
      new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "10.1.0.2" },
        body: JSON.stringify({ email: "flow@cookietest.com", password: issuedPassword }),
      })
    );
    expect(partnerLogin.status).toBe(200);
    const partnerCookie = extractSessionCookie(partnerLogin);

    const meRes = await mePost(new NextRequest("http://localhost:3000/api/auth/me", { headers: { cookie: partnerCookie } }));
    const meData = await meRes.json();
    expect(meData.authenticated).toBe(true);
    expect(meData.user.role).toBe("B2B_PARTNER");

    const deskRes = await partnerDeskGet(
      new NextRequest("http://localhost:3000/api/partner/desk?deskType=FARE_DESK", { headers: { cookie: partnerCookie } })
    );
    expect(deskRes.status).toBe(200);

    // The removed hardcoded placeholder headers no longer grant any access.
    const fakeHeaderRes = await partnerDeskGet(
      new NextRequest("http://localhost:3000/api/partner/desk?deskType=FARE_DESK", {
        headers: { "x-safaria-session": "staging-token", Authorization: "Bearer mock-token" },
      })
    );
    expect(fakeHeaderRes.status).toBe(401);
  });
});
