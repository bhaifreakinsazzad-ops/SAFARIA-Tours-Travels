import { describe, it, expect, beforeEach } from "vitest";
import { POST as enquiriesPost, GET as enquiriesGet } from "@/app/api/enquiries/route";
import { POST as agencyPost } from "@/app/api/agency/route";
import { PATCH as adminEnquiriesPatch } from "@/app/api/admin/enquiries/route";
import { NextRequest } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";

describe("API Route Handlers Integration", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("POST /api/enquiries should accept valid flight request and return reference + whatsAppUrl", async () => {
    const payload = {
      tripType: "ONE_WAY",
      legs: [
        {
          originIata: "DAC",
          originCity: "Dhaka",
          destinationIata: "DXB",
          destinationCity: "Dubai",
          departureDate: "2026-12-05",
        },
      ],
      cabinClass: "ECONOMY",
      passengers: { adults: 2, children: 1, infants: 0 },
      preferredCarrier: "Emirates",
      leadPassengerName: "Arif Hossain",
      phoneCountryCode: "+880",
      phoneNumber: "1711000111",
      email: "arif@example.com",
      consentAgreed: true,
    };

    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await enquiriesPost(req);
    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.referenceNo).toMatch(/^SFR-\d{8}-[A-Z0-9]{4,8}$/);
    expect(data.whatsAppUrl).toContain("https://wa.me/8801674178437");
    expect(data.enquiry.status).toBe("NEW");

    // Verify GET /api/enquiries?ref=...
    const getReq = new NextRequest(`http://localhost:3000/api/enquiries?ref=${data.referenceNo}`);
    const getRes = await enquiriesGet(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.record.referenceNo).toBe(data.referenceNo);
    expect(getData.record.maskedPhone).toContain("***");
  });

  it("POST /api/agency should accept valid B2B intake with trade license", async () => {
    const payload = {
      agencyName: "Dhaka Aviation Services",
      contactPerson: "Kazi Nabil",
      phone: "+8801819000000",
      email: "nabil@dhakaaviation.com",
      city: "Dhaka",
      tradeLicenseNumber: "TL-2024-DHK-990",
      yearsInBusiness: 6,
      monthlyTicketVolume: "OVER_100",
      notes: "Requesting sub-agent ledger credentials",
      consentAgreed: true,
    };

    const req = new NextRequest("http://localhost:3000/api/agency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await agencyPost(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.referenceNo).toMatch(/^B2B-\d{8}-[A-Z0-9]{4,8}$/);
    expect(data.status).toBe("PENDING_VERIFICATION");
  });

  it("PATCH /api/admin/enquiries should transition enquiry to QUOTATION_SENT", async () => {
    // 1. Create enquiry
    const enquiry = await enquiriesRepository.createFlightEnquiry({
      tripType: "ONE_WAY",
      legs: [
        {
          originIata: "DAC",
          originCity: "Dhaka",
          destinationIata: "JED",
          destinationCity: "Jeddah",
          departureDate: "2026-12-10",
        },
      ],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      leadPassengerName: "Ibrahim Khalil",
      phoneCountryCode: "+880",
      phoneNumber: "1911223344",
      consentAgreed: true,
    });

    // 2. Patch status
    const patchReq = new NextRequest("http://localhost:3000/api/admin/enquiries", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-safaria-admin-key": "safaria-ops-2026",
      },
      body: JSON.stringify({
        id: enquiry.id,
        status: "QUOTATION_SENT",
      }),
    });

    const patchRes = await adminEnquiriesPatch(patchReq);
    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.enquiry.status).toBe("QUOTATION_SENT");
  });
});
