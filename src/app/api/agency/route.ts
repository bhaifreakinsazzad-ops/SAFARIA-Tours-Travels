// ==============================================================================
// SAFARIA Tours & Travels — B2B Agency Application Route Handler
// Enforces trade license presence, manual verification state, and CRM intake
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { AgencyApplicationInputSchema } from "@server/validations/enquirySchemas";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { ghlAdapter } from "@server/crm/ghlAdapter";
import { buildWhatsAppAgencyUrl } from "@server/utils/whatsAppFormatter";
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
    const parseResult = AgencyApplicationInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Agency application validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    const fingerprint = buildSubmissionFingerprint([input.email, input.phone, input.agencyName]);
    const isDup =
      (await isDuplicateSubmissionAsync(fingerprint)) || isDuplicateSubmission(fingerprint);

    if (isDup) {
      return NextResponse.json(
        {
          success: false,
          error: "An identical agency application was just submitted. Please check your reference number or wait a few minutes before resubmitting.",
        },
        { status: 409 }
      );
    }

    // 1. Persist application with initial PENDING_VERIFICATION state
    const application = await enquiriesRepository.createAgencyApplication(input);

    // 2. Sync to CRM
    const crmResult = await ghlAdapter.syncAgencyApplication(application);

    // 3. Generate follow-up WhatsApp link
    const whatsAppUrl = buildWhatsAppAgencyUrl(
      application.referenceNo,
      application.agencyName,
      application.contactPerson
    );

    return NextResponse.json(
      {
        success: true,
        referenceNo: application.referenceNo,
        recordId: application.id,
        status: application.status,
        crmStatus: {
          queued: crmResult.queued,
          message: crmResult.message,
        },
        whatsAppUrl,
        message:
          "Agency partnership application registered. Commercial onboarding & 72-hour trial will activate following trade license manual audit.",
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
        details: getErrorMessage(err),
      },
      { status: 500 }
    );
  }
}
