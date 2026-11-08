import { describe, it, expect } from "vitest";
import { POST as verifyPost } from "@/app/api/partner/verify-passenger/route";
import { NextRequest } from "next/server";
import { signSession } from "@/lib/auth/authService";

describe("Verified Workflow™ Name & Rule Verification", () => {
  const partnerToken = signSession({
    userId: "partner_001",
    email: "partner@greendelta.com",
    role: "B2B_PARTNER",
    agencyId: "agency-greendelta-01",
  });

  it("should pass audit for clean, compliant passenger names", async () => {
    const req = new NextRequest("http://localhost:3000/api/partner/verify-passenger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        surname: "Rahman",
        givenNames: "Tanvir",
        title: "MR",
        passportExpiry: "2029-05-15",
      }),
    });

    const res = await verifyPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.audit.valid).toBe(true);
    expect(data.audit.formattedGdsString).toBe("RAHMAN/TANVIR MR");
    expect(data.audit.warnings.length).toBe(0);
  });

  it("should detect title embedded in given name and issue penalty warning", async () => {
    const req = new NextRequest("http://localhost:3000/api/partner/verify-passenger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        surname: "Chowdhury",
        givenNames: "MR Farhan", // Agent mistake: embedded title
        title: "MR",
      }),
    });

    const res = await verifyPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.audit.valid).toBe(false);
    expect(data.audit.warnings.some((w: string) => w.includes("Title \"MR\" detected inside"))).toBe(true);
  });

  it("should flag passport with under 6 months validity", async () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const req = new NextRequest("http://localhost:3000/api/partner/verify-passenger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        surname: "Hasan",
        givenNames: "Sakib",
        passportExpiry: nextMonth.toISOString().split("T")[0],
      }),
    });

    const res = await verifyPost(req);
    const data = await res.json();
    expect(data.audit.warnings.some((w: string) => w.includes("under 6 months"))).toBe(true);
  });
});
