// ==============================================================================
// SAFARIA Tours & Travels — Session Logout & Revocation API
// Invalidates cryptographic session token (jti) and wipes HTTP-only cookie
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequest, revokeSession } from "@/lib/auth/authService";

export async function POST(req: NextRequest) {
  try {
    const session = extractSessionFromRequest(req);

    if (session && session.jti) {
      revokeSession(session.jti);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully. Session revoked.",
    });

    // Clear session cookie
    response.cookies.set("safaria_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
