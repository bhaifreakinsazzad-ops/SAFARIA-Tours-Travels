// ==============================================================================
// Regression coverage for a critical pre-existing defect: POST /api/auth/login
// previously granted a full B2B_PARTNER session for ANY approved agency email
// with no password check at all, plus a hardcoded "partner@greendelta.com"
// bypass that worked with any password. Neither had test coverage before.
// ==============================================================================
import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as agencyPost } from "@/app/api/agency/route";
import { PATCH as adminAgenciesPatch } from "@/app/api/admin/agencies/route";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { signSession } from "@/lib/auth/authService";

function loginRequest(body: Record<string, unknown>, ip = "10.0.0.1") {
  return new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("B2B partner login — password enforcement", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("rejects the former hardcoded demo bypass email now that it has no issued password", async () => {
    const res = await loginPost(
      loginRequest({
        email: "partner@greendelta.com",
        password: "literally-anything",
      })
    );
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/credentials have not been issued/i);
  });

  it("rejects login for an approved agency with no password set, regardless of password supplied", async () => {
    const agencyRes = await agencyPost(
      new NextRequest("http://localhost:3000/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: "Test Travels Ltd",
          contactPerson: "Jane Doe",
          phone: "+8801800000000",
          email: "jane@testtravels.com",
          city: "Dhaka",
          tradeLicenseNumber: "TL-9999",
          consentAgreed: true,
        }),
      })
    );
    const agency = await agencyRes.json();

    const applications = await enquiriesRepository.listAgencyApplications();
    const record = applications.find((a) => a.referenceNo === agency.referenceNo)!;

    // Approve to ACTIVE_PARTNER via a direct repository call that simulates a
    // pre-credential-issuance legacy record (passwordHash never set).
    await enquiriesRepository.updateAgencyStatus(record.id, "ACTIVE_PARTNER", "staff@safaria.vibing.world");
    // Force-clear any issued hash to simulate the "no credentials yet" edge case.
    (record as any).passwordHash = undefined;
    (record as any).passwordSalt = undefined;

    const res = await loginPost(
      loginRequest({ email: "jane@testtravels.com", password: "guessed-password" })
    );
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
  });

  it("issues real credentials on approval and rejects a wrong password for them", async () => {
    const agencyRes = await agencyPost(
      new NextRequest("http://localhost:3000/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: "Real Partner Agency",
          contactPerson: "Rafiq Islam",
          phone: "+8801800000001",
          email: "rafiq@realpartner.com",
          city: "Chattogram",
          tradeLicenseNumber: "TL-8888",
          consentAgreed: true,
        }),
      })
    );
    const agency = await agencyRes.json();

    const staffToken = signSession({ userId: "staff_001", email: "ops@safaria.vibing.world", role: "SUPER_ADMIN" });
    const applications = await enquiriesRepository.listAgencyApplications();
    const record = applications.find((a) => a.referenceNo === agency.referenceNo)!;

    const patchReq = new NextRequest("http://localhost:3000/api/admin/agencies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: `safaria_session=${staffToken}` },
      body: JSON.stringify({ id: record.id, status: "ACTIVE_PARTNER" }),
    });
    const patchRes = await adminAgenciesPatch(patchReq);
    const patchData = await patchRes.json();

    expect(patchData.success).toBe(true);
    expect(typeof patchData.issuedPassword).toBe("string");
    expect(patchData.issuedPassword.length).toBeGreaterThan(8);
    // The sanitized agency object must never carry the hash/salt back to the client.
    expect(patchData.agency.passwordHash).toBeUndefined();
    expect(patchData.agency.passwordSalt).toBeUndefined();

    const issuedPassword = patchData.issuedPassword as string;

    // Wrong password must fail
    const wrongRes = await loginPost(
      loginRequest({ email: "rafiq@realpartner.com", password: "not-the-real-password" }, "10.0.0.2")
    );
    expect(wrongRes.status).toBe(401);

    // Correct password must succeed and scope the session to this agency
    const rightRes = await loginPost(
      loginRequest({ email: "rafiq@realpartner.com", password: issuedPassword }, "10.0.0.3")
    );
    const rightData = await rightRes.json();
    expect(rightRes.status).toBe(200);
    expect(rightData.success).toBe(true);
    expect(rightData.role).toBe("B2B_PARTNER");
    expect(rightData.agencyId).toBe(record.id);
  });
});

describe("Login rate limiting", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("locks out an IP+email pair after repeated failed staff login attempts", async () => {
    const ip = "203.0.113.50";
    let lastRes;
    for (let i = 0; i < 6; i++) {
      lastRes = await loginPost(
        loginRequest({ email: "ops@safaria.vibing.world", password: "wrong-password", role: "ADMIN" }, ip)
      );
    }
    const data = await lastRes!.json();
    expect(lastRes!.status).toBe(429);
    expect(data.error).toMatch(/too many failed login attempts/i);
  });
});
