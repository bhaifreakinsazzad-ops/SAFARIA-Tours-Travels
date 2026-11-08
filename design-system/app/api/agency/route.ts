// ==============================================================================
// SAFARIA Tours & Travels — B2B Agency Application Route Handler
// Enforces trade license presence, manual verification state, and CRM intake
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { AgencyApplicationInputSchema } from "@/lib/validations/enquirySchemas";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { ghlAdapter } from "@/lib/crm/ghlAdapter";
import { buildWhatsAppAgencyUrl } from "@/lib/utils/whatsAppFormatter";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@/lib/utils/requestGuards";

export async function POST(req: NextRequest) {
  try {
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
        status: application.status,
        message:
          "Agency application submitted successfully. 72-hour trial access will be activated upon trade credential audit by our agency operations desk.",
        whatsAppUrl,
        crmStatus: crmResult.queued ? "QUEUED_OUTBOX" : "SYNCED",
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 413 });
    }
    console.error("Agency route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error while processing B2B application" },
      { status: 500 }
    );
  }
}
