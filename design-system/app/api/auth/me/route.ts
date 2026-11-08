// ==============================================================================
// SAFARIA Tours & Travels — Session Profile API
// Returns authenticated user details and tenant scoping
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequestAsync } from "@/lib/auth/authService";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";

export async function GET(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Active agency status check for B2B partners
  if (session.role === "B2B_PARTNER" && session.agencyId) {
    const isActive = await enquiriesRepository.isAgencyActive(session.agencyId);
    if (!isActive) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Agency partner authorization has been revoked or suspended by operations staff.",
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
