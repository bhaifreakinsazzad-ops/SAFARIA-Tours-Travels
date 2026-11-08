// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Agency Operations API
// Staff triage for agency verification and manual 72-hour trial activation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminKey = req.headers.get("x-safaria-admin-key") || req.cookies.get("safaria_admin_session")?.value;
  const configuredSecret = process.env.SAFARIA_ADMIN_SECRET || "safaria-ops-2026";
  return adminKey === configuredSecret || process.env.NODE_ENV !== "production";
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const list = await enquiriesRepository.listAgencyApplications();
    return NextResponse.json({ success: true, count: list.length, applications: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
