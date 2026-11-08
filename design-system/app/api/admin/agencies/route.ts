// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Agency Operations API
// Staff triage for agency verification and manual 72-hour trial activation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { extractSessionFromRequest } from "@/lib/auth/authService";

function isAuthorizedAdmin(req: NextRequest): boolean {
  const session = extractSessionFromRequest(req);
  return session !== null && (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT");
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

export async function PATCH(req: NextRequest) {
  const session = extractSessionFromRequest(req);
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "OPS_AGENT")) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing agency id or target status" },
        { status: 400 }
      );
    }

    const updated = await enquiriesRepository.updateAgencyStatus(
      id,
      status,
      session.email,
      notes
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agency: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
