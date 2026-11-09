// ==============================================================================
// SAFARIA Tours & Travels — General Service Enquiry Route Handler
// Handles Visa, Corporate Mobility, Umrah Packages, and Holiday Tour requests
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { GeneralEnquiryInputSchema } from "@server/validations/enquirySchemas";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { SITE_CONFIG } from "@server/config/siteConfig";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";
import { checkSubmissionRateLimit, buildSubmissionFingerprint, isDuplicateSubmission } from "@server/utils/abuseGuard";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const lockedForSeconds = checkSubmissionRateLimit(ip);
    if (lockedForSeconds > 0) {
      return NextResponse.json(
        { success: false, error: `Too many submissions. Please try again in ${lockedForSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await readJsonBodyGuarded(req);
    const parseResult = GeneralEnquiryInputSchema.safeParse(body);

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

    const fingerprint = buildSubmissionFingerprint([input.phone, input.serviceType, input.message]);
    if (isDuplicateSubmission(fingerprint)) {
      return NextResponse.json(
        {
          success: false,
          error: "An identical travel enquiry was just submitted. Please check your reference number or wait a few minutes before resubmitting.",
        },
        { status: 409 }
      );
    }

    const record = await enquiriesRepository.createGeneralEnquiry(input);

    // Formatted follow-up WhatsApp link
    const phone = SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "");
    const messageText = `Assalamu Alaikum SAFARIA Team,

I have submitted an inquiry for *${input.serviceType}* service.

📌 *Reference No:* ${record.referenceNo}
👤 *Name:* ${input.fullName}
📞 *Phone:* ${input.phone}
📝 *Request:* ${input.message}

Please advise on processing steps and documentation requirements.`;

    const whatsAppUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json(
      {
        success: true,
        referenceNo: record.referenceNo,
        enquiry: record,
        whatsAppUrl,
        message: "Your travel inquiry has been received. A specialist will contact you shortly.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 413 });
    }
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
