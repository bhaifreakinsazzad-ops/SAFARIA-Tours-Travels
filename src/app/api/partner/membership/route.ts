// ==============================================================================
// SAFARIA Tours & Travels — B2B Partner Membership & Entitlements API
// Returns authenticated agency status, quota usage, billing and renewal alerts
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { getErrorMessage } from "@server/utils/errorMessage";

export async function GET(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  const agencyId = session.agencyId;
  if (!agencyId && session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { success: false, error: "No partner agency context attached to session" },
      { status: 403 }
    );
  }

  let targetAgencyId = agencyId;
  if (!targetAgencyId) {
    const agencies = await enquiriesRepository.listAgencyApplications();
    targetAgencyId = agencies[0]?.id || "agency-greendelta-01";
  }

  try {
    const entitlements = await enquiriesRepository.getAgencyEntitlementUsage(targetAgencyId);
    const invoices = await enquiriesRepository.listAgencyInvoices(targetAgencyId);
    const deskRecords = await enquiriesRepository.listB2BDeskRecords(undefined, targetAgencyId);

    // Compute activity history
    const activityHistory = deskRecords.map((r) => ({
      id: r.id,
      deskType: r.deskType,
      title: r.title,
      status: r.status,
      priority: r.priority,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      internalNotes: r.internalNotes,
    }));

    return NextResponse.json({
      success: true,
      membership: entitlements,
      invoices,
      activityHistory,
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
