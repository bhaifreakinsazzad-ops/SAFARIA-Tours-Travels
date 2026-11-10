// ==============================================================================
// SAFARIA Tours & Travels — Session Logout & Revocation API
// Invalidates cryptographic session token (jti) and wipes HTTP-only cookie
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequestAsync, revokeSessionDurable, extractRawTokenFromRequest, verifySession } from "@server/auth/authService";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { getErrorMessage } from "@server/utils/errorMessage";

export async function POST(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  try {
    let session = await extractSessionFromRequestAsync(req);

    // If session was already marked revoked or had expired status, attempt to extract token to ensure jti is stored
    if (!session) {
      const rawToken = extractRawTokenFromRequest(req);
      if (rawToken) {
        session = verifySession(rawToken);
      }
    }

    if (session && session.jti) {
      await revokeSessionDurable(session.jti, session.userId, "USER_LOGOUT");
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully. Session revoked.",
    });

    // Clear session cookie with Max-Age 0 and expired date
    response.cookies.set("safaria_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
