// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Agency Operations API
// Staff triage for agency verification and manual 72-hour trial activation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { extractSessionFromRequest } from "@server/auth/authService";
import { getErrorMessage } from "@server/utils/errorMessage";

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
    // Never echo credential hashes back to any client, including the admin UI.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sanitized = list.map(({ passwordHash, passwordSalt, ...rest }) => rest);
    return NextResponse.json({ success: true, count: sanitized.length, applications: sanitized });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
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

    const result = await enquiriesRepository.updateAgencyStatus(
      id,
      status,
      session.email,
      notes
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, passwordSalt, ...agency } = result.agency;

    return NextResponse.json({
      success: true,
      agency,
      // Shown once, to the approving staff member only, so they can relay it
      // to the partner out-of-band (e.g. WhatsApp/phone) — never persisted
      // or retrievable again after this response.
      issuedPassword: result.issuedPassword,
      ...(result.issuedPassword && {
        message:
          "Partner login credentials issued. Relay this password to the agency out-of-band now — it cannot be retrieved again.",
      }),
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
