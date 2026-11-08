import { describe, it, expect, beforeEach } from "vitest";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { GET } from "@/app/api/enquiries/route";
import { NextRequest } from "next/server";

describe("Public Reference Tracking & Masked Lookup API", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  it("successfully looks up a Flight Enquiry by reference and masks customer PII", async () => {
    const flightRecord = await enquiriesRepository.createFlightEnquiry(
      {
        tripType: "ONE_WAY",
        cabinClass: "ECONOMY",
        passengers: { adults: 1, children: 0, infants: 0 },
        leadPassengerName: "MD ARIFUL ISLAM",
        phoneCountryCode: "+880",
        phoneNumber: "1712345678",
        email: "ariful.islam@example.com",
        legs: [
          {
            originIata: "DAC",
            originCity: "Dhaka",
            destinationIata: "DXB",
            destinationCity: "Dubai",
            departureDate: "2026-12-01",
          },
        ],
      },
      { ip: "127.0.0.1", userAgent: "Vitest" }
    );

    const req = new NextRequest(`http://localhost:3000/api/enquiries?ref=${flightRecord.referenceNo}`);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.type).toBe("FLIGHT");
    expect(json.record.referenceNo).toBe(flightRecord.referenceNo);
    expect(json.record.legs).toHaveLength(1);
    expect(json.record.status).toBe("NEW");

    // Critical Security & Privacy: Phone and email must be masked for public lookup
    expect(json.record.maskedPhone).toBe("+880 *** *** 5678");
    expect(json.record.maskedEmail).toBe("a***@example.com");
    // Ensure raw unmasked phone and email are NOT exposed
    expect(json.record.phoneNumber).toBeUndefined();
    expect(json.record.email).toBeUndefined();
  });

  it("successfully looks up a B2B Agency Application by reference", async () => {
    const b2bRecord = await enquiriesRepository.createAgencyApplication({
      agencyName: "Green Delta Travel Ltd",
      contactPerson: "Kamal Hossain",
      phone: "+8801700998877",
      email: "kamal@greendelta.com",
      city: "Dhaka",
      tradeLicenseNumber: "TRAD/DSCC/019283/2025",
      yearsInBusiness: 5,
      monthlyTicketVolume: "100-300",
    });

    const req = new NextRequest(`http://localhost:3000/api/enquiries?ref=${b2bRecord.referenceNo}`);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.type).toBe("B2B_AGENCY");
    expect(json.record.referenceNo).toBe(b2bRecord.referenceNo);
    expect(json.record.agencyName).toBe("Green Delta Travel Ltd");
    expect(json.record.status).toBe("PENDING_VERIFICATION");
    expect(json.record.maskedPhone).toBe("*** *** 8877");
    expect(json.record.phone).toBeUndefined();
  });

  it("successfully looks up a General Service Enquiry (Visa) by reference", async () => {
    const genRecord = await enquiriesRepository.createGeneralEnquiry({
      serviceType: "VISA",
      fullName: "Nusrat Jahan",
      phone: "+8801811223344",
      email: "nusrat@example.org",
      message: "Need express 30-day tourist visa processing for UAE.",
      destinationOrCountry: "United Arab Emirates",
      passengerOrPaxCount: 2,
    });

    const req = new NextRequest(`http://localhost:3000/api/enquiries?ref=${genRecord.referenceNo}`);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.type).toBe("GENERAL");
    expect(json.record.referenceNo).toBe(genRecord.referenceNo);
    expect(json.record.serviceType).toBe("VISA");
    expect(json.record.destinationOrCountry).toBe("United Arab Emirates");
    expect(json.record.passengerOrPaxCount).toBe(2);
    expect(json.record.status).toBe("NEW");
    expect(json.record.maskedPhone).toBe("*** *** 3344");
  });

  it("returns 404 if reference is not found", async () => {
    const req = new NextRequest("http://localhost:3000/api/enquiries?ref=SFR-99999999-NOTFOUND");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toContain("No quotation or application record found");
  });

  it("returns 400 if query param ref is omitted", async () => {
    const req = new NextRequest("http://localhost:3000/api/enquiries");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
