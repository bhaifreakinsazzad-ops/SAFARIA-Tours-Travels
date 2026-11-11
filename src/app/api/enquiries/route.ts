// ==============================================================================
// SAFARIA Tours & Travels — Flight Enquiry API Route Handler
// Handles validation, collision-resistant reference, database persistence, and CRM sync
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { FlightEnquiryInputSchema } from "@server/validations/enquirySchemas";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { ghlAdapter } from "@server/crm/ghlAdapter";
import { buildWhatsAppQuotationUrl } from "@server/utils/whatsAppFormatter";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";
import {
  checkSubmissionRateLimit,
  checkSubmissionRateLimitAsync,
  buildSubmissionFingerprint,
  isDuplicateSubmission,
  isDuplicateSubmissionAsync,
} from "@server/utils/abuseGuard";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const lockedForSeconds =
      (await checkSubmissionRateLimitAsync(ip)) || checkSubmissionRateLimit(ip);

    if (lockedForSeconds > 0) {
      return NextResponse.json(
        { success: false, error: `Too many submissions. Please try again in ${lockedForSeconds} seconds.` },
        { status: 429 }
      );
    }

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
    const userAgent = req.headers.get("user-agent") || "unknown";

    const fingerprint = buildSubmissionFingerprint([
      input.phoneCountryCode,
      input.phoneNumber,
      input.tripType,
      input.legs.map((l) => `${l.originIata}-${l.destinationIata}-${l.departureDate}`).join(","),
    ]);

    const isDup =
      (await isDuplicateSubmissionAsync(fingerprint)) || isDuplicateSubmission(fingerprint);

    if (isDup) {
      return NextResponse.json(
        {
          success: false,
          error: "An identical flight quotation request was just submitted. Please check your reference number or wait a few minutes before resubmitting.",
        },
        { status: 409 }
      );
    }

    // 1. Durable database persistence (Supabase / In-Memory Store)
    const storedRecord = await enquiriesRepository.createFlightEnquiry(input, {
      ip,
      userAgent,
    });

    // 2. Synchronize to CRM (GHL adapter queues outbox entry if live credentials missing)
    const crmResult = await ghlAdapter.syncFlightEnquiry(storedRecord);

    // 3. Generate structured WhatsApp concierge deep-link for instant customer handoff
    const whatsAppUrl = buildWhatsAppQuotationUrl({
      referenceNo: storedRecord.referenceNo,
      leadPassengerName: storedRecord.leadPassengerName,
      tripType: storedRecord.tripType,
      cabinClass: storedRecord.cabinClass,
      passengers: storedRecord.passengers,
      legs: storedRecord.legs,
    });

    return NextResponse.json(
      {
        success: true,
        referenceNo: storedRecord.referenceNo,
        recordId: storedRecord.id,
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
        whatsAppConciergeUrl: whatsAppUrl,
        crmStatus: {
          queued: crmResult.queued,
          message: crmResult.message,
        },
        message:
          "Flight quotation request registered successfully. A SAFARIA travel specialist is reviewing your itinerary.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds maximum permitted size" },
        { status: 413 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        ...(process.env.NODE_ENV !== "production" ? { details: getErrorMessage(err) } : {}),
      },
      { status: 500 }
    );
  }
}

/**
 * Public reference search & tracking endpoint
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json(
      { success: false, error: "Missing reference number query parameter (?ref=...)" },
      { status: 400 }
    );
  }

  try {
    const match = await enquiriesRepository.lookupAnyReference(ref);
    if (!match) {
      return NextResponse.json(
        { success: false, error: "No quotation or application record found for the provided reference number" },
        { status: 404 }
      );
    }

    const maskEmail = (email?: string) =>
      email ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`) : undefined;

    if (match.type === "FLIGHT") {
      const enquiry = match.record;
      const maskedPhone = `${enquiry.phoneCountryCode} *** *** ${enquiry.phoneNumber.slice(-4)}`;
      const rec = {
        referenceNo: enquiry.referenceNo,
        tripType: enquiry.tripType,
        cabinClass: enquiry.cabinClass,
        passengers: enquiry.passengers,
        legs: enquiry.legs,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
        maskedPhone,
        maskedEmail: maskEmail(enquiry.email),
      };
      return NextResponse.json({
        success: true,
        type: "FLIGHT",
        record: rec,
        data: rec,
      });
    }

    if (match.type === "B2B_AGENCY") {
      const agency = match.record;
      const maskedPhone = `*** *** ${agency.phone.slice(-4)}`;
      const rec = {
        referenceNo: agency.referenceNo,
        agencyName: agency.agencyName,
        city: agency.city,
        monthlyTicketVolume: agency.monthlyTicketVolume,
        status: agency.status,
        trialActivatedAt: agency.trialActivatedAt,
        trialExpiresAt: agency.trialExpiresAt,
        createdAt: agency.createdAt,
        maskedPhone,
        maskedEmail: maskEmail(agency.email),
      };
      return NextResponse.json({
        success: true,
        type: "B2B_AGENCY",
        record: rec,
        data: rec,
      });
    }

    if (match.type === "GENERAL") {
      const gen = match.record;
      const maskedPhone = `*** *** ${gen.phone.slice(-4)}`;
      const rec = {
        referenceNo: gen.referenceNo,
        serviceType: gen.serviceType,
        destinationOrCountry: gen.destinationOrCountry,
        passengerOrPaxCount: gen.passengerOrPaxCount,
        status: gen.status,
        createdAt: gen.createdAt,
        maskedPhone,
        maskedEmail: maskEmail(gen.email),
      };
      return NextResponse.json({
        success: true,
        type: "GENERAL",
        record: rec,
        data: rec,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown record type" },
      { status: 500 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Lookup failed", details: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
