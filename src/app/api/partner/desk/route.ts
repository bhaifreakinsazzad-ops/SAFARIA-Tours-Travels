// ==============================================================================
// SAFARIA Tours & Travels — B2B Partner Desk Route Handler
// Full CRUD for the 6 Desks with strict Cross-Tenant Isolation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { enquiriesRepository, StoredB2BDeskRecord } from "@server/db/enquiriesRepository";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";

export async function GET(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);
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
  } else if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT" || session.role === "FINANCE_DESK") {
    // Staff can inspect all agencies or filter by requestedAgencyId
    targetAgencyId = requestedAgencyId || undefined;
  }

  try {
    const records = await enquiriesRepository.listB2BDeskRecords(deskType, targetAgencyId);
    return NextResponse.json({ success: true, count: records.length, records });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const session = await extractSessionFromRequestAsync(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await readJsonBodyGuarded<{
      deskType?: StoredB2BDeskRecord["deskType"];
      title?: string;
      payload?: Record<string, unknown>;
      priority?: StoredB2BDeskRecord["priority"];
    }>(req, 32_000);

    const { deskType, title, payload, priority } = body;

    if (!deskType || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: deskType, title" },
        { status: 400 }
      );
    }

    const agencyId = session.agencyId || (session.role === "SUPER_ADMIN" ? "ops-internal" : undefined);
    if (!agencyId) {
      return NextResponse.json(
        { success: false, error: "Agency context is missing from authenticated session" },
        { status: 403 }
      );
    }

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

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const session = await extractSessionFromRequestAsync(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { id, status, internalNotes } = await readJsonBodyGuarded<{
      id?: string;
      status?: StoredB2BDeskRecord["status"];
      internalNotes?: string;
    }>(req, 16_000);

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: id, status" },
        { status: 400 }
      );
    }

    const auditTrailNote = internalNotes
      ? `[${new Date().toISOString()} by ${session.email}]: ${internalNotes}`
      : undefined;

    // Scope partner update through the real RLS boundary so the database enforces tenant scoping
    const scopeAgencyId = session.role === "B2B_PARTNER" ? session.agencyId : undefined;
    const updated = await enquiriesRepository.updateB2BDeskRecord(id, status, auditTrailNote, scopeAgencyId);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Record not found or access denied by tenant isolation policy" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      record: updated,
      message: "Desk record status transition and audit trail updated successfully",
    });
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
