// ==============================================================================
// SAFARIA Tours & Travels — Flight Enquiry API Route Handler
// Handles validation, collision-resistant reference, database persistence, and CRM sync
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { FlightEnquiryInputSchema } from "@/lib/validations/enquirySchemas";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { ghlAdapter } from "@/lib/crm/ghlAdapter";
import { buildWhatsAppQuotationUrl } from "@/lib/utils/whatsAppFormatter";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@/lib/utils/requestGuards";

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBodyGuarded(req);
    const parseResult = FlightEnquiryInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. Durable database persistence (Supabase / In-Memory Store)
    const storedRecord = await enquiriesRepository.createFlightEnquiry(input, {
      ip,
      userAgent,
    });

    // 2. Asynchronous CRM sync with resilient outbox queue
    const crmResult = await ghlAdapter.syncFlightEnquiry(storedRecord);

    // 3. Formatted WhatsApp deep link for friction-free customer follow-up
    const whatsAppUrl = buildWhatsAppQuotationUrl({
      referenceNo: storedRecord.referenceNo,
      leadPassengerName: storedRecord.leadPassengerName,
      tripType: storedRecord.tripType,
      legs: storedRecord.legs,
      passengers: storedRecord.passengers,
      cabinClass: storedRecord.cabinClass,
    });

    return NextResponse.json(
      {
        success: true,
        referenceNo: storedRecord.referenceNo,
        enquiry: {
          id: storedRecord.id,
          referenceNo: storedRecord.referenceNo,
          tripType: storedRecord.tripType,
          leadPassengerName: storedRecord.leadPassengerName,
          status: storedRecord.status,
          createdAt: storedRecord.createdAt,
          legsCount: storedRecord.legs.length,
        },
        whatsAppUrl,
        crmStatus: crmResult.queued ? "QUEUED_OUTBOX" : "SYNCED",
        message: "Flight quotation request received. A verified travel specialist will review available inventory.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 413 });
    }
    console.error("Flight enquiry route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing quotation request",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { success: false, error: "Missing reference number query parameter (?ref=...)" },
        { status: 400 }
      );
    }

    const result = await enquiriesRepository.lookupAnyReference(ref);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "No quotation or application record found for the provided reference number" },
        { status: 404 }
      );
    }

    const maskEmail = (email?: string) =>
      email ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`) : undefined;

    if (result.type === "FLIGHT") {
      const enquiry = result.record;
      const maskedPhone = `${enquiry.phoneCountryCode} *** *** ${enquiry.phoneNumber.slice(-4)}`;
      return NextResponse.json({
        success: true,
        type: "FLIGHT",
        record: {
          referenceNo: enquiry.referenceNo,
          tripType: enquiry.tripType,
          cabinClass: enquiry.cabinClass,
          passengers: enquiry.passengers,
          legs: enquiry.legs,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
          maskedPhone,
          maskedEmail: maskEmail(enquiry.email),
        },
      });
    }

    if (result.type === "B2B_AGENCY") {
      const agency = result.record;
      const maskedPhone = `*** *** ${agency.phone.slice(-4)}`;
      return NextResponse.json({
        success: true,
        type: "B2B_AGENCY",
        record: {
          referenceNo: agency.referenceNo,
          agencyName: agency.agencyName,
          city: agency.city,
          monthlyTicketVolume: agency.monthlyTicketVolume,
          status: agency.status,
          trialExpiresAt: agency.trialExpiresAt,
          createdAt: agency.createdAt,
          maskedPhone,
          maskedEmail: maskEmail(agency.email),
        },
      });
    }

    if (result.type === "GENERAL") {
      const gen = result.record;
      const maskedPhone = `*** *** ${gen.phone.slice(-4)}`;
      return NextResponse.json({
        success: true,
        type: "GENERAL",
        record: {
          referenceNo: gen.referenceNo,
          serviceType: gen.serviceType,
          destinationOrCountry: gen.destinationOrCountry,
          passengerOrPaxCount: gen.passengerOrPaxCount,
          status: gen.status,
          createdAt: gen.createdAt,
          maskedPhone,
          maskedEmail: maskEmail(gen.email),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown record type" },
      { status: 500 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
