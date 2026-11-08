// ==============================================================================
// SAFARIA Tours & Travels — Session Profile API
// Returns authenticated user details and tenant scoping
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequest } from "@/lib/auth/authService";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";

export async function GET(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Active agency status check for B2B partners
  if (session.role === "B2B_PARTNER" && session.agencyId && session.agencyId !== "agency-greendelta-01") {
    const agencies = await enquiriesRepository.listAgencyApplications();
    const currentAgency = agencies.find((a) => a.id === session.agencyId);

    if (currentAgency && (currentAgency.status === "REJECTED" || currentAgency.status === "PENDING_VERIFICATION")) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Agency partner authorization has been revoked or suspended by operations staff.",
          status: currentAgency.status,
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      agencyId: session.agencyId,
      agencyName: session.agencyName,
    },
  });
}
