import { describe, it, expect, beforeEach } from "vitest";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { ghlAdapter } from "@/lib/crm/ghlAdapter";
import { FlightEnquiryInput } from "@/lib/validations/enquirySchemas";

describe("Enquiries Repository & GHL Adapter", () => {
  beforeEach(() => {
    enquiriesRepository._resetStore();
  });

  const sampleInput: FlightEnquiryInput = {
    tripType: "ONE_WAY",
    legs: [
      {
        originIata: "DAC",
        originCity: "Dhaka",
        destinationIata: "DXB",
        destinationCity: "Dubai",
        departureDate: "2026-12-01",
      },
    ],
    cabinClass: "ECONOMY",
    passengers: { adults: 1, children: 0, infants: 0 },
    preferredCarrier: "Biman",
    leadPassengerName: "Sakib Al Hasan",
    phoneCountryCode: "+880",
    phoneNumber: "1700000000",
    email: "sakib@example.com",
    specialNotes: "Direct flight preferred",
    consentAgreed: true,
  };

  it("should create flight enquiry with unique reference and NEW status", async () => {
    const created = await enquiriesRepository.createFlightEnquiry(sampleInput);
    expect(created.id).toBeDefined();
    expect(created.referenceNo).toMatch(/^SFR-\d{8}-[A-Z0-9]{4,8}$/);
    expect(created.status).toBe("NEW");
    expect(created.legs.length).toBe(1);
    expect(created.leadPassengerName).toBe("Sakib Al Hasan");

    // Fetch back
    const fetched = await enquiriesRepository.getFlightEnquiryByRef(created.referenceNo);
    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
  });

  it("should update enquiry status through administrative lifecycle", async () => {
    const created = await enquiriesRepository.createFlightEnquiry(sampleInput);
    
    // Triage to IN_REVIEW
    const inReview = await enquiriesRepository.updateEnquiryStatus(created.id, "IN_REVIEW");
    expect(inReview?.status).toBe("IN_REVIEW");

    // Quote sent
    const quoted = await enquiriesRepository.updateEnquiryStatus(created.id, "QUOTATION_SENT");
    expect(quoted?.status).toBe("QUOTATION_SENT");
  });

  it("should gracefully enqueue to outbox when GHL credentials are not configured", async () => {
    const created = await enquiriesRepository.createFlightEnquiry(sampleInput);
    const syncResult = await ghlAdapter.syncFlightEnquiry(created);

    expect(syncResult.success).toBe(true);
    expect(syncResult.queued).toBe(true);
    expect(syncResult.message).toContain("integration outbox");
  });

  it("should create agency application with PENDING_VERIFICATION status", async () => {
    const agencyInput = {
      agencyName: "Bengal Holidays Ltd",
      contactPerson: "Mahbub Alam",
      phone: "+8801912345678",
      email: "info@bengalholidays.com",
      city: "Dhaka",
      tradeLicenseNumber: "TL-DHK-2023-8812",
      yearsInBusiness: 5,
      monthlyTicketVolume: "OVER_100" as const,
      notes: "Seeking FareDesk wholesale account",
      consentAgreed: true as const,
    };

    const app = await enquiriesRepository.createAgencyApplication(agencyInput);
    expect(app.id).toBeDefined();
    expect(app.referenceNo).toMatch(/^B2B-\d{8}-[A-Z0-9]{4,8}$/);
    expect(app.status).toBe("PENDING_VERIFICATION");

    const syncResult = await ghlAdapter.syncAgencyApplication(app);
    expect(syncResult.success).toBe(true);
    expect(syncResult.queued).toBe(true);
  });
});
