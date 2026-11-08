import { describe, it, expect, beforeEach } from "vitest";
import { POST as generalPost } from "@/app/api/general/route";
import { POST as deskPost, GET as deskGet, PATCH as deskPatch } from "@/app/api/partner/desk/route";
import { NextRequest } from "next/server";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { signSession } from "@/lib/auth/authService";

describe("General Enquiries & Cross-Tenant B2B Desks Integration", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  const agencyAToken = signSession({
    userId: "user_a",
    email: "partner@agency-a.com",
    role: "B2B_PARTNER",
    agencyId: "agency-A",
    agencyName: "Agency Alpha",
  });

  const agencyBToken = signSession({
    userId: "user_b",
    email: "partner@agency-b.com",
    role: "B2B_PARTNER",
    agencyId: "agency-B",
    agencyName: "Agency Bravo",
  });

  const adminToken = signSession({
    userId: "admin_1",
    email: "ops@safaria.vibing.world",
    role: "SUPER_ADMIN",
  });

  it("POST /api/general should store Visa inquiry and return GEN reference", async () => {
    const payload = {
      serviceType: "VISA",
      fullName: "Shahidul Islam",
      phone: "+8801711223344",
      email: "shahid@example.com",
      message: "Urgent Saudi Arabia Umrah & business multiple-entry visa processing.",
      destinationOrCountry: "Saudi Arabia",
      passengerOrPaxCount: 2,
    };

    const req = new NextRequest("http://localhost:3000/api/general", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await generalPost(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.referenceNo).toMatch(/^GEN-\d{8}-[A-Z0-9]{4,8}$/);
    expect(data.whatsAppUrl).toContain("Saudi%20Arabia");
  });

  it("POST & GET /api/partner/desk should strictly isolate records between Agency A and Agency B", async () => {
    // 1. Agency A creates a FareDesk request
    const postReqA = new NextRequest("http://localhost:3000/api/partner/desk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agencyAToken}`,
      },
      body: JSON.stringify({
        deskType: "FARE_DESK",
        title: "Agency A Secret Fare Request",
        payload: { carrier: "Emirates", netPrice: 45000 },
      }),
    });

    const postResA = await deskPost(postReqA);
    expect(postResA.status).toBe(201);

    // 2. Agency A fetches records: receives exactly 1 record
    const getReqA = new NextRequest("http://localhost:3000/api/partner/desk", {
      headers: { Authorization: `Bearer ${agencyAToken}` },
    });
    const getResA = await deskGet(getReqA);
    const getDataA = await getResA.json();
    expect(getDataA.count).toBe(1);
    expect(getDataA.records[0].agencyId).toBe("agency-A");

    // 3. Agency B attempts to snoop on Agency A's data (?agencyId=agency-A): MUST BE FORBIDDEN (403)
    const snoopReq = new NextRequest("http://localhost:3000/api/partner/desk?agencyId=agency-A", {
      headers: { Authorization: `Bearer ${agencyBToken}` },
    });
    const snoopRes = await deskGet(snoopReq);
    expect(snoopRes.status).toBe(403);
    const snoopData = await snoopRes.json();
    expect(snoopData.error).toContain("Cross-tenant data inspection is forbidden");

    // 4. Agency B queries its own desk: receives 0 records (zero leakage from Agency A)
    const getReqB = new NextRequest("http://localhost:3000/api/partner/desk", {
      headers: { Authorization: `Bearer ${agencyBToken}` },
    });
    const getResB = await deskGet(getReqB);
    const getDataB = await getResB.json();
    expect(getDataB.count).toBe(0);

    // 5. Staff Admin can view Agency A records legitimately
    const adminReq = new NextRequest("http://localhost:3000/api/partner/desk?agencyId=agency-A", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminRes = await deskGet(adminReq);
    const adminData = await adminRes.json();
    expect(adminData.count).toBe(1);
  });

  it("PATCH /api/partner/desk updates record status and appends audit trail with cross-tenant check", async () => {
    // 1. Create a record for Agency A
    const record = await enquiriesRepository.createB2BDeskRecord(
      "BOOKING_DESK",
      "agency-A",
      "PNR Split Ticket Case",
      { pnr: "ABC123XYZ", passengerCount: 3 },
      "HIGH"
    );

    // 2. Agency B attempts to modify Agency A's record -> MUST RETURN 403 FORBIDDEN
    const tamperReq = new NextRequest("http://localhost:3000/api/partner/desk", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agencyBToken}`,
      },
      body: JSON.stringify({
        id: record.id,
        status: "RESOLVED",
        internalNotes: "Unauthorized modification by rival agency",
      }),
    });

    const tamperRes = await deskPatch(tamperReq);
    expect(tamperRes.status).toBe(403);

    // 3. Agency A updates their own record -> SUCCESS
    const updateReq = new NextRequest("http://localhost:3000/api/partner/desk", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agencyAToken}`,
      },
      body: JSON.stringify({
        id: record.id,
        status: "RESOLVED",
        internalNotes: "Carrier split approved and confirmed with airline helpdesk.",
      }),
    });

    const updateRes = await deskPatch(updateReq);
    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.success).toBe(true);
    expect(updateData.record.status).toBe("RESOLVED");
    expect(updateData.record.internalNotes).toContain("partner@agency-a.com");
    expect(updateData.record.internalNotes).toContain("Carrier split approved");
  });
});
