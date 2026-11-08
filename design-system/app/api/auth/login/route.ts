// ==============================================================================
// SAFARIA Tours & Travels — Unified Login API
// Staff administration & B2B Partner Portal authentication with tenant isolation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { signSession } from "@/lib/auth/authService";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";
import { checkRateLimit, recordFailure, recordSuccess } from "@/lib/auth/rateLimiter";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const rateLimitKey = `${clientIp(req)}:${cleanEmail}`;
    const lockedForSeconds = checkRateLimit(rateLimitKey);
    if (lockedForSeconds > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Try again in ${lockedForSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 1. Staff Admin Authentication
    if (role === "ADMIN" || cleanEmail.endsWith("@safaria.vibing.world")) {
      const staffPassword = process.env.SAFARIA_ADMIN_SECRET || "safaria-ops-2026";
      if (password !== staffPassword) {
        recordFailure(rateLimitKey);
        return NextResponse.json(
          { success: false, error: "Invalid staff credentials" },
          { status: 401 }
        );
      }
      recordSuccess(rateLimitKey);

      const token = signSession({
        userId: "staff_001",
        email: cleanEmail,
        role: "SUPER_ADMIN",
      });

      const response = NextResponse.json({
        success: true,
        role: "SUPER_ADMIN",
        user: { email: cleanEmail, name: "SAFARIA Operations Staff" },
        token,
      });

      response.cookies.set("safaria_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400,
      });

      return response;
    }

    // 2. B2B Partner Agency Authentication
    // Check if agency application exists in repository
    const agencies = await enquiriesRepository.listAgencyApplications();
    const matchedAgency = agencies.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!matchedAgency) {
      return NextResponse.json(
        {
          success: false,
          error: "No registered agency found with this email. Please submit an agency partnership application first.",
        },
        { status: 404 }
      );
    }

    // Verify whether trial/partner status is approved
    if (matchedAgency.status === "PENDING_VERIFICATION" || matchedAgency.status === "IN_REVIEW") {
      return NextResponse.json(
        {
          success: false,
          error: "Agency application is pending manual trade license audit. Trial access has not yet been approved.",
          referenceNo: matchedAgency.referenceNo,
        },
        { status: 403 }
      );
    }

    if (matchedAgency.status === "REJECTED") {
      return NextResponse.json(
        { success: false, error: "Invalid partner credentials" },
        { status: 401 }
      );
    }

    if (!matchedAgency.passwordHash || !matchedAgency.passwordSalt) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Partner login credentials have not been issued yet. Contact SAFARIA operations to receive your access password.",
        },
        { status: 403 }
      );
    }

    // Mandatory password verification — approved status alone never grants access
    const verifiedAgency = await enquiriesRepository.verifyAgencyCredentials(
      cleanEmail,
      String(password)
    );

    if (!verifiedAgency) {
      recordFailure(rateLimitKey);
      return NextResponse.json(
        { success: false, error: "Invalid partner credentials" },
        { status: 401 }
      );
    }
    recordSuccess(rateLimitKey);

    // For verified, approved agency
    const token = signSession({
      userId: `partner_user_${matchedAgency.id}`,
      email: matchedAgency.email,
      role: "B2B_PARTNER",
      agencyId: matchedAgency.id,
      agencyName: matchedAgency.agencyName,
    });

    const response = NextResponse.json({
      success: true,
      role: "B2B_PARTNER",
      agencyId: matchedAgency.id,
      agencyName: matchedAgency.agencyName,
      token,
    });

    response.cookies.set("safaria_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
