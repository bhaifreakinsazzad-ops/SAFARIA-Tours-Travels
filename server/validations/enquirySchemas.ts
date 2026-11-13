// ==============================================================================
// SAFARIA Tours & Travels — Shared Zod Input Validation Schemas
// Enforces strict data integrity for B2C quotations and B2B intake
// ==============================================================================

import { z } from "zod";

export const IataCodeSchema = z
  .string()
  .trim()
  .length(3, { message: "Airport code must be exactly 3 uppercase letters" })
  .regex(/^[A-Z]{3}$/, { message: "Invalid IATA airport code" });

export const FlightLegSchema = z.object({
  originIata: IataCodeSchema,
  originCity: z.string().trim().min(2, "Origin city is required"),
  destinationIata: IataCodeSchema,
  destinationCity: z.string().trim().min(2, "Destination city is required"),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Departure date must be in YYYY-MM-DD format"),
}).refine(
  (leg) => leg.originIata !== leg.destinationIata,
  {
    message: "Origin and destination airport cannot be identical",
    path: ["destinationIata"],
  }
);

export const PassengersSchema = z
  .object({
    adults: z.number().int().min(1, "At least 1 adult passenger is required").max(9, "Maximum 9 adults"),
    children: z.number().int().min(0).max(8).default(0),
    infants: z.number().int().min(0).max(4).default(0),
  })
  .refine((p) => p.infants <= p.adults, {
    message: "Infant count cannot exceed adult passenger count (1 infant per adult lap)",
    path: ["infants"],
  })
  .refine((p) => p.adults + p.children + p.infants <= 9, {
    message: "Total passengers cannot exceed 9 per standard booking inquiry",
    path: ["adults"],
  });

export const CabinClassSchema = z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]);
export const TripTypeSchema = z.enum(["ONE_WAY", "ROUND_TRIP", "MULTI_CITY"]);

export const FlightEnquiryInputSchema = z
  .object({
    tripType: TripTypeSchema,
    legs: z.array(FlightLegSchema).min(1, "At least one flight leg is required").max(6, "Maximum 6 legs allowed"),
    cabinClass: CabinClassSchema.default("ECONOMY"),
    passengers: PassengersSchema,
    preferredCarrier: z.string().trim().max(64).optional().default(""),
    leadPassengerName: z
      .string()
      .trim()
      .min(3, "Lead passenger full name must be at least 3 characters")
      .max(80, "Name cannot exceed 80 characters")
      .regex(/^[\p{L}\p{M}\s.'-]+$/u, "Name contains invalid characters"),
    phoneCountryCode: z
      .string()
      .trim()
      .regex(/^\+[1-9]\d{0,3}$/, "Country code must start with + followed by 1 to 4 digits"),
    phoneNumber: z
      .string()
      .trim()
      .min(6, "Phone number is too short")
      .max(16, "Phone number is too long")
      .regex(/^[\d\s\-]+$/, "Phone number must contain only numbers, spaces, or hyphens"),
    email: z.string().trim().email("Please provide a valid email address").or(z.literal("")).optional(),
    specialNotes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().default(""),
    consentAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the quotation policy to proceed" }),
    }),
  })
  .refine(
    (data) => {
      if (data.tripType === "ONE_WAY") {
        return data.legs.length === 1;
      }
      if (data.tripType === "ROUND_TRIP") {
        return data.legs.length === 2;
      }
      if (data.tripType === "MULTI_CITY") {
        return data.legs.length >= 2 && data.legs.length <= 6;
      }
      return false;
    },
    {
      message: "Number of flight legs does not match selected trip type",
      path: ["legs"],
    }
  )
  .refine(
    (data) => {
      // Validate date chronological progression
      for (let i = 1; i < data.legs.length; i++) {
        const prev = new Date(data.legs[i - 1].departureDate);
        const curr = new Date(data.legs[i].departureDate);
        if (curr < prev) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Flight leg departure dates must be in chronological order",
      path: ["legs"],
    }
  );

export type FlightEnquiryInput = z.input<typeof FlightEnquiryInputSchema>;
export type FlightEnquiryOutput = z.output<typeof FlightEnquiryInputSchema>;

// B2B Agency Application Schema
export const AgencyApplicationInputSchema = z.object({
  agencyName: z.string().trim().min(3, "Agency name must be at least 3 characters").max(100),
  contactPerson: z.string().trim().min(3, "Contact person name is required").max(80),
  phone: z.string().trim().min(8, "Valid phone number is required").max(20),
  email: z.string().trim().email("Valid agency business email is required"),
  city: z.string().trim().min(2, "Agency operating city is required").max(60),
  tradeLicenseNumber: z.string().trim().min(3, "Trade license or registration reference is required").max(50),
  yearsInBusiness: z.number().int().min(0, "Years in business must be 0 or greater").max(100).default(1),
  monthlyTicketVolume: z.enum(["UNDER_20", "20_TO_50", "50_TO_100", "OVER_100"]).default("20_TO_50"),
  notes: z.string().trim().max(500).optional().default(""),
  consentAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must accept the verification terms" }),
  }),
});

export type AgencyApplicationInput = z.input<typeof AgencyApplicationInputSchema>;

// General Service Enquiry Schema (Visa, Corporate, Umrah, Holiday)
export const GeneralEnquiryInputSchema = z.object({
  serviceType: z.enum(["VISA", "CORPORATE", "HOLIDAY", "HOTEL", "UMRAH", "CUSTOM"]),
  fullName: z.string().trim().min(3, "Full name is required").max(80),
  phone: z.string().trim().min(8, "Phone number is required").max(20),
  email: z.string().trim().email("Valid email is required").or(z.literal("")).optional(),
  message: z.string().trim().min(5, "Please describe your travel request").max(1000),
  destinationOrCountry: z.string().trim().max(80).optional().default(""),
  passengerOrPaxCount: z.number().int().min(1).max(100).optional().default(1),
});

export type GeneralEnquiryInput = z.input<typeof GeneralEnquiryInputSchema>;
