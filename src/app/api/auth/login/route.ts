// ==============================================================================
// SAFARIA Tours & Travels — Unified Login API
// Staff administration & B2B Partner Portal authentication with tenant isolation
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { signSession } from "@server/auth/authService";
import { staffService } from "@server/auth/staffService";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { consumeRateLimit, resetRateLimit } from "@server/auth/distributedRateLimiter";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { getErrorMessage } from "@server/utils/errorMessage";

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  // 1. CSRF & Origin validation
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  try {
    const { email, password } = await readJsonBodyGuarded<{
      email?: string;
      password?: string;
      role?: string;
    }>(req, 2_000);

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const ip = clientIp(req);
    const rateLimitKey = `login:${ip}:${cleanEmail}`;

    // 2. Distributed sliding-window rate limiting (5 attempts per 10 minutes)
    const rateResult = await consumeRateLimit(rateLimitKey, 5, 600);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Try again in ${rateResult.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 3. Attempt Staff User Authentication first (Individual account lookup)
    const staffUser = await staffService.getStaffUserByEmail(cleanEmail);
    if (staffUser) {
      const verifyResult = await staffService.verifyStaffCredentials(
        cleanEmail,
        String(password),
        ip
      );

      if (!verifyResult.success || !verifyResult.user) {
        return NextResponse.json(
          {
            success: false,
            error: verifyResult.error || "Invalid staff credentials",
            lockedForSeconds: verifyResult.lockedForSeconds,
          },
          { status: 401 }
        );
      }

      await resetRateLimit(rateLimitKey);

      // Sign session with individual staff role from database
      const token = signSession({
        userId: verifyResult.user.id,
        email: verifyResult.user.email,
        role: verifyResult.user.role,
      });

      // Secure response: do NOT return raw signed token in ordinary JSON when using secure HttpOnly cookies
      const response = NextResponse.json({
        success: true,
        role: verifyResult.user.role,
        user: {
          id: verifyResult.user.id,
          email: verifyResult.user.email,
          name: verifyResult.user.fullName,
          role: verifyResult.user.role,
        },
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

    // 4. B2B Partner Agency Authentication
    // Authoritative lookup directly against PostgreSQL / Supabase
    const matchedAgency = await enquiriesRepository.getAgencyApplicationByEmail(cleanEmail);

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

    if (matchedAgency.status === "REJECTED" || matchedAgency.status === "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          error: `Agency account is ${matchedAgency.status.toLowerCase()}. Access denied.`,
        },
        { status: 401 }
      );
    }

    if (!matchedAgency.passwordHash || !matchedAgency.passwordSalt) {
      return NextResponse.json(
        {
          success: false,
          error: "Partner login credentials have not been issued yet. Contact SAFARIA operations to receive your access password.",
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
      return NextResponse.json(
        { success: false, error: "Invalid partner credentials" },
        { status: 401 }
      );
    }

    await resetRateLimit(rateLimitKey);

    // Sign session token strictly scoped to this agency ID
    const token = signSession({
      userId: verifiedAgency.id,
      email: verifiedAgency.email,
      role: "B2B_PARTNER",
      agencyId: verifiedAgency.id,
      agencyName: verifiedAgency.agencyName,
    });

    const response = NextResponse.json({
      success: true,
      role: "B2B_PARTNER",
      agencyId: verifiedAgency.id,
      agency: {
        id: verifiedAgency.id,
        agencyName: verifiedAgency.agencyName,
        email: verifiedAgency.email,
        status: verifiedAgency.status,
      },
    });

    response.cookies.set("safaria_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err: unknown) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json(
        { success: false, error: "Request payload exceeds maximum permitted size" },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}
