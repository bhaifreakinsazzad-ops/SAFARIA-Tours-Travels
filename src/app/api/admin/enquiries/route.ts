// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Enquiries API
// Restricts access to authorized staff for quotation triage and lifecycle updates
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { staffService } from "@server/auth/staffService";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";

async function getAuthorizedStaffSession(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);
  if (!session) return null;
  if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT" || session.role === "FINANCE_DESK") {
    return session;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const list = await enquiriesRepository.listFlightEnquiries(100);
    return NextResponse.json({ success: true, count: list.length, enquiries: list });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await readJsonBodyGuarded<{
      id?: string;
      status?: "NEW" | "IN_REVIEW" | "QUOTATION_SENT" | "BOOKED" | "EXPIRED" | "CANCELLED";
    }>(req, 16_000);

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing enquiry id or target status" }, { status: 400 });
    }

    const updated = await enquiriesRepository.updateEnquiryStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    // Record staff audit log
    await staffService.recordStaffAuditLog({
      staffId: staff.userId,
      staffEmail: staff.email,
      action: `ENQUIRY_STATUS_UPDATE_${status}`,
      targetType: "FLIGHT_ENQUIRY",
      targetId: id,
      details: { newStatus: status },
    });

    return NextResponse.json({ success: true, enquiry: updated });
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
