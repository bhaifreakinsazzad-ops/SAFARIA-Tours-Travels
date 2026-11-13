// ==============================================================================
// SAFARIA Tours & Travels — Telemetry & Interaction Logger
// Tracks WhatsApp draft link opens separately from confirmed inbound replies
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";

export async function POST(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  try {
    const { event, referenceNo } = await readJsonBodyGuarded<{
      event?: string;
      referenceNo?: string;
    }>(req, 8_000);

    if (event === "WA_DRAFT_OPENED" && referenceNo) {
      await enquiriesRepository.recordWhatsAppDraftOpened(referenceNo);
      return NextResponse.json({ success: true, recorded: "WA_DRAFT_OPENED" });
    }

    return NextResponse.json({ success: true, recorded: "IGNORED" });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
