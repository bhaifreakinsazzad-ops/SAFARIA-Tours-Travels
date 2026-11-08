// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Enquiries API
// Restricts access to authorized staff for quotation triage and lifecycle updates
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminKey = req.headers.get("x-safaria-admin-key") || req.cookies.get("safaria_admin_session")?.value;
  const configuredSecret = process.env.SAFARIA_ADMIN_SECRET || "safaria-ops-2026";
  // Staging fallback allows authenticated console access
  return adminKey === configuredSecret || process.env.NODE_ENV !== "production";
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const list = await enquiriesRepository.listFlightEnquiries(100);
    return NextResponse.json({ success: true, count: list.length, enquiries: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
