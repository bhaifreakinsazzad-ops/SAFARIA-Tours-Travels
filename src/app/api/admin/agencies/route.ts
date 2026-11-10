// ==============================================================================
// SAFARIA Tours & Travels — Protected Admin Agency Operations API
// Staff triage for agency verification, approval, credential issuance & suspension
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { staffService } from "@server/auth/staffService";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { getErrorMessage } from "@server/utils/errorMessage";

async function getAuthorizedStaffSession(req: NextRequest) {
  const session = await extractSessionFromRequestAsync(req);
  if (!session) return null;
  if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT" || session.role === "FINANCE_DESK") {
    return session;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
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
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const staff = await getAuthorizedStaffSession(req);
  if (!staff) {
    return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await readJsonBodyGuarded<{
      id?: string;
      status?: "PENDING_VERIFICATION" | "IN_REVIEW" | "TRIAL_APPROVED" | "ACTIVE_PARTNER" | "REJECTED" | "SUSPENDED";
      notes?: string;
    }>(req, 16_000);

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
      staff.email,
      notes
    );

    if (!result) {
      return NextResponse.json({ success: false, error: "Agency not found" }, { status: 404 });
    }

    // Record staff audit log
    await staffService.recordStaffAuditLog({
      staffId: staff.userId,
      staffEmail: staff.email,
      action: `AGENCY_STATUS_UPDATE_${status}`,
      targetType: "AGENCY_APPLICATION",
      targetId: id,
      details: { newStatus: status, notes },
    });

    // Strip password hashes from response
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
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds maximum permitted size" },
        { status: 413 }
      );
    }
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
