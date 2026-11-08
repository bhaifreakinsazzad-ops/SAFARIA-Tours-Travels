// ==============================================================================
// SAFARIA Tours & Travels — Flight Enquiry API Route Handler
// Handles validation, collision-resistant reference, database persistence, and CRM sync
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { FlightEnquiryInputSchema } from "@/lib/validations/enquirySchemas";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { ghlAdapter } from "@/lib/crm/ghlAdapter";
import { buildWhatsAppQuotationUrl } from "@/lib/utils/whatsAppFormatter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const enquiry = await enquiriesRepository.getFlightEnquiryByRef(ref);

    if (!enquiry) {
      return NextResponse.json(
        { success: false, error: "No quotation record found for the provided reference number" },
        { status: 404 }
      );
    }

    // Mask sensitive phone/email for public lookup
    const maskedPhone = `${enquiry.phoneCountryCode} *** *** ${enquiry.phoneNumber.slice(-4)}`;
    const maskedEmail = enquiry.email
      ? enquiry.email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`)
      : undefined;

    return NextResponse.json({
      success: true,
      record: {
        referenceNo: enquiry.referenceNo,
        tripType: enquiry.tripType,
        cabinClass: enquiry.cabinClass,
        passengers: enquiry.passengers,
        legs: enquiry.legs,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
        maskedPhone,
        maskedEmail,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
