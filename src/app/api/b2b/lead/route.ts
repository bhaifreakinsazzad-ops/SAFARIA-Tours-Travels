// ==============================================================================
// SAFARIA Tours & Travels — B2B Lead Capture & Contextual WhatsApp Handoff
// Directive 005 Track A & Track D: Lead persistence before WhatsApp preparation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { ghlAdapter } from "@server/crm/ghlAdapter";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";
import { buildStructuredB2BWhatsAppUrl } from "@/config/constants";
import {
  checkSubmissionRateLimit,
  checkSubmissionRateLimitAsync,
  buildSubmissionFingerprint,
  isDuplicateSubmission,
  isDuplicateSubmissionAsync,
} from "@server/utils/abuseGuard";

const B2BLeadInputSchema = z.object({
  agencyName: z.string().trim().min(2, "Agency name is required").max(100),
  contactName: z.string().trim().min(2, "Contact person name is required").max(80),
  district: z.string().trim().min(2, "District / Operating city is required").max(60),
  phone: z.string().trim().min(8, "Valid phone number is required").max(24),
  email: z.string().trim().email("Valid email is required").or(z.literal("")).optional(),
  painCategory: z.enum([
    "PAIN_FARE",
    "PAIN_BOOKING",
    "PAIN_PAYMENT",
    "PAIN_AFTERCARE",
    "PAIN_TRUST",
    "PAIN_GROWTH",
  ]),
  planInterest: z.enum(["MONTHLY", "ANNUAL", "DEMO"]).default("MONTHLY"),
  expectedMonthlyVolume: z.string().trim().optional().default("20_TO_50"),
  consentAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must accept the verification and privacy terms" }),
  }),
});

const PAIN_LABELS: Record<string, string> = {
  PAIN_FARE: "Wholesale Fare Sourcing (GDS / LCC Net Rates)",
  PAIN_BOOKING: "PNR Hold & Split Ticket Management",
  PAIN_PAYMENT: "Transparent Net Remittance & Margin Ledger",
  PAIN_AFTERCARE: "24/7 Re-issues, Waivers & Disruption Support",
  PAIN_TRUST: "Passenger Name & Passport Anti-Penalty Audit",
  PAIN_GROWTH: "Sub-Agent Commission Scaling & Volume Tiers",
};

const PLAN_LABELS: Record<string, string> = {
  MONTHLY: "Monthly Plan (৳5,999/month)",
  ANNUAL: "Annual Plan (৳69,999/year - Save ৳1,989)",
  DEMO: "72-Hour Guided Trial & Demo",
};

export async function POST(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

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

    const body = await readJsonBodyGuarded(req, 16_000);
    const parseResult = B2BLeadInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "B2B lead validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Abuse & deduplication protection
    const fingerprint = buildSubmissionFingerprint([input.phone, input.agencyName, input.district]);
    const isDup =
      (await isDuplicateSubmissionAsync(fingerprint)) || isDuplicateSubmission(fingerprint);

    if (isDup) {
      return NextResponse.json(
        {
          success: false,
          error: "A lead inquiry for this agency was just submitted. Please check WhatsApp or wait a moment.",
        },
        { status: 409 }
      );
    }

    // Map ticket volume
    const vol = input.expectedMonthlyVolume.toUpperCase();
    const volumeEnum: "UNDER_20" | "20_TO_50" | "50_TO_100" | "OVER_100" =
      vol === "OVER_100" ? "OVER_100" : (vol === "50_TO_100" ? "50_TO_100" : (vol === "20_TO_50" ? "20_TO_50" : "UNDER_20"));

    // 1. Durably save the lead before preparing WhatsApp
    const leadNotes = `[Need: ${input.painCategory}] [Plan: ${input.planInterest}] [District: ${input.district}] B2B Lead from Agency Needs Finder`;
    const fallbackEmail = input.email || `lead-${Date.now()}@safaria.internal`;

    const application = await enquiriesRepository.createAgencyApplication({
      agencyName: input.agencyName,
      contactPerson: input.contactName,
      phone: input.phone,
      email: fallbackEmail,
      city: input.district,
      tradeLicenseNumber: "VERIFICATION_PENDING",
      yearsInBusiness: 1,
      monthlyTicketVolume: volumeEnum,
      notes: leadNotes,
      consentAgreed: true,
      painCategory: input.painCategory,
      district: input.district,
      plan: input.planInterest === "ANNUAL" ? "ANNUAL" : (input.planInterest === "DEMO" ? "TRIAL" : "MONTHLY"),
    });

    // 2. Enqueue GHL CRM sync through outbox
    await ghlAdapter.syncAgencyApplication(application);

    // 3. Generate structured WhatsApp URL with stable reference
    const painLabel = PAIN_LABELS[input.painCategory] || input.painCategory;
    const planLabel = PLAN_LABELS[input.planInterest] || input.planInterest;

    const whatsAppUrl = buildStructuredB2BWhatsAppUrl({
      reference: application.referenceNo,
      agencyName: input.agencyName,
      contactName: input.contactName,
      district: input.district,
      painCategory: painLabel,
      plan: planLabel,
    });

    return NextResponse.json(
      {
        success: true,
        referenceNo: application.referenceNo,
        leadId: application.id,
        status: application.status,
        whatsAppUrl,
        message: "Lead saved. Tap below to launch your WhatsApp concierge inquiry with prefilled details.",
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
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
