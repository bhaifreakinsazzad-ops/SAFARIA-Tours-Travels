import { describe, it, expect } from "vitest";
import {
  FlightEnquiryInputSchema,
  AgencyApplicationInputSchema,
  FlightLegSchema,
  PassengersSchema,
} from "@server/validations/enquirySchemas";

describe("Flight Enquiry Zod Schemas", () => {
  const validLeg1 = {
    originIata: "DAC",
    originCity: "Dhaka",
    destinationIata: "DXB",
    destinationCity: "Dubai",
    departureDate: "2026-12-01",
  };

  const validLeg2 = {
    originIata: "DXB",
    originCity: "Dubai",
    destinationIata: "DAC",
    destinationCity: "Dhaka",
    departureDate: "2026-12-10",
  };

  it("should validate a valid ONE_WAY flight enquiry", () => {
    const input = {
      tripType: "ONE_WAY",
      legs: [validLeg1],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      preferredCarrier: "Emirates",
      leadPassengerName: "Tanvir Ahmed",
      phoneCountryCode: "+880",
      phoneNumber: "1711223344",
      email: "tanvir@example.com",
      specialNotes: "Aisle seat preferred",
      consentAgreed: true,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("should validate a valid ROUND_TRIP flight enquiry", () => {
    const input = {
      tripType: "ROUND_TRIP",
      legs: [validLeg1, validLeg2],
      cabinClass: "BUSINESS",
      passengers: { adults: 2, children: 1, infants: 1 },
      leadPassengerName: "Nusrat Jahan",
      phoneCountryCode: "+880",
      phoneNumber: "1819998877",
      consentAgreed: true,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("should validate dynamic MULTI_CITY flight enquiry with 3 legs", () => {
    const input = {
      tripType: "MULTI_CITY",
      legs: [
        {
          originIata: "DAC",
          originCity: "Dhaka",
          destinationIata: "DXB",
          destinationCity: "Dubai",
          departureDate: "2026-12-01",
        },
        {
          originIata: "DXB",
          originCity: "Dubai",
          destinationIata: "LHR",
          destinationCity: "London",
          departureDate: "2026-12-05",
        },
        {
          originIata: "LHR",
          originCity: "London",
          destinationIata: "DAC",
          destinationCity: "Dhaka",
          departureDate: "2026-12-15",
        },
      ],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      leadPassengerName: "Farhan Chowdhury",
      phoneCountryCode: "+880",
      phoneNumber: "1674178437",
      consentAgreed: true,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("should reject ONE_WAY trip if more than 1 leg is provided", () => {
    const input = {
      tripType: "ONE_WAY",
      legs: [validLeg1, validLeg2],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      leadPassengerName: "Tanvir Ahmed",
      phoneCountryCode: "+880",
      phoneNumber: "1711223344",
      consentAgreed: true,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("should reject flight legs when destination equals origin", () => {
    const invalidLeg = {
      originIata: "DAC",
      originCity: "Dhaka",
      destinationIata: "DAC",
      destinationCity: "Dhaka",
      departureDate: "2026-12-01",
    };

    const parsed = FlightLegSchema.safeParse(invalidLeg);
    expect(parsed.success).toBe(false);
  });

  it("should reject chronological violation in multi-leg flight dates", () => {
    const input = {
      tripType: "MULTI_CITY",
      legs: [
        validLeg1,
        {
          originIata: "DXB",
          originCity: "Dubai",
          destinationIata: "LHR",
          destinationCity: "London",
          departureDate: "2026-11-20", // Before leg 1 (Dec 1)
        },
      ],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      leadPassengerName: "Farhan Chowdhury",
      phoneCountryCode: "+880",
      phoneNumber: "1674178437",
      consentAgreed: true,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("should enforce lap infant cannot exceed adult count", () => {
    const passengers = {
      adults: 1,
      children: 0,
      infants: 2, // 2 infants with only 1 adult is forbidden by aviation safety rules
    };

    const parsed = PassengersSchema.safeParse(passengers);
    expect(parsed.success).toBe(false);
  });

  it("should require consent agreement", () => {
    const input = {
      tripType: "ONE_WAY",
      legs: [validLeg1],
      cabinClass: "ECONOMY",
      passengers: { adults: 1, children: 0, infants: 0 },
      leadPassengerName: "Tanvir Ahmed",
      phoneCountryCode: "+880",
      phoneNumber: "1711223344",
      consentAgreed: false,
    };

    const parsed = FlightEnquiryInputSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});

describe("B2B Agency Zod Schema", () => {
  it("should validate complete agency application", () => {
    const input = {
      agencyName: "Green Delta Travels",
      contactPerson: "Md. Rafiqul Islam",
      phone: "+8801712345678",
      email: "rafiq@greendeltatravel.com",
      city: "Sylhet",
      tradeLicenseNumber: "TRAD/SYL/2024/9912",
      yearsInBusiness: 4,
      monthlyTicketVolume: "50_TO_100",
      notes: "Seeking wholesale GDS fare desk access.",
      consentAgreed: true,
    };

    const parsed = AgencyApplicationInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("should reject agency application without trade license", () => {
    const input = {
      agencyName: "Green Delta Travels",
      contactPerson: "Md. Rafiqul Islam",
      phone: "+8801712345678",
      email: "rafiq@greendeltatravel.com",
      city: "Sylhet",
      tradeLicenseNumber: "",
      consentAgreed: true,
    };

    const parsed = AgencyApplicationInputSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
