// ==============================================================================
// SAFARIA Tours & Travels — Session Profile API
// Returns authenticated user details and tenant scoping
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequest } from "@/lib/auth/authService";

export async function GET(req: NextRequest) {
  const session = extractSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
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
