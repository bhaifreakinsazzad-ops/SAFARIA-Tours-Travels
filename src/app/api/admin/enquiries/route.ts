// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Enquiries API
// Restricts access to authorized staff for quotation triage and lifecycle updates
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { extractSessionFromRequest } from "@server/auth/authService";
import { getErrorMessage } from "@server/utils/errorMessage";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const session = extractSessionFromRequest(req);
  return session !== null && (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT");
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
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
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Missing enquiry id or target status" }, { status: 400 });
    }

    const updated = await enquiriesRepository.updateEnquiryStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
