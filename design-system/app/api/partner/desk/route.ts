// ==============================================================================
// SAFARIA Tours & Travels — B2B Partner Desk Route Handler
// Full CRUD for the 6 Desks with strict Cross-Tenant Isolation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequest } from "@/lib/auth/authService";
import { enquiriesRepository, StoredB2BDeskRecord } from "@/lib/db/enquiriesRepository";

export async function GET(req: NextRequest) {
  const session = extractSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const deskType = searchParams.get("deskType") as StoredB2BDeskRecord["deskType"] | undefined;
  const requestedAgencyId = searchParams.get("agencyId");

  let targetAgencyId = session.agencyId;

  // Cross-tenant data isolation check:
  // If user is a partner, they CANNOT query another agency's data
  if (session.role === "B2B_PARTNER") {
    if (requestedAgencyId && requestedAgencyId !== session.agencyId) {
      return NextResponse.json(
        { success: false, error: "Access denied: Cross-tenant data inspection is forbidden" },
        { status: 403 }
      );
    }
    targetAgencyId = session.agencyId;
  } else if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT") {
    // Staff can inspect all agencies or filter by requestedAgencyId
    targetAgencyId = requestedAgencyId || undefined;
  }

  try {
    const records = await enquiriesRepository.listB2BDeskRecords(deskType, targetAgencyId);
    return NextResponse.json({ success: true, count: records.length, records });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = extractSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { deskType, title, payload, priority } = body;

    if (!deskType || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: deskType, title" },
        { status: 400 }
      );
    }

    const agencyId = session.agencyId || "ops-internal";

    const record = await enquiriesRepository.createB2BDeskRecord(
      deskType,
      agencyId,
      title,
      payload || {},
      priority || "NORMAL"
    );

    return NextResponse.json(
      {
        success: true,
        record,
        message: `${deskType} record submitted and persisted to partner ledger.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
