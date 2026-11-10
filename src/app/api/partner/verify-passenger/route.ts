// ==============================================================================
// SAFARIA Tours & Travels — Verified Workflow™ Name & Passport Verification API
// Passenger name formatting and document validity advisory check
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequestAsync } from "@server/auth/authService";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";
import { getErrorMessage } from "@server/utils/errorMessage";

export interface PassengerAuditResult {
  valid: boolean;
  warnings: string[];
  normalizedSurname: string;
  normalizedGivenNames: string;
  formattedGdsString: string;
  disclaimer: string;
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "Cross-site request forgery detected. Request rejected." },
      { status: 403 }
    );
  }

  const session = await extractSessionFromRequestAsync(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { surname, givenNames, title, passportExpiry, dateOfBirth } = await req.json();

    if (!surname || !givenNames) {
      return NextResponse.json(
        { success: false, error: "Both surname and given names are required" },
        { status: 400 }
      );
    }

    const warnings: string[] = [];
    const cleanSurname = String(surname).trim().toUpperCase();
    const cleanGiven = String(givenNames).trim().toUpperCase();
    const cleanTitle = title ? String(title).trim().toUpperCase() : "MR";

    // 1. Check prohibited symbols in airline ticketing
    if (/[^A-Z\s]/.test(cleanSurname) || /[^A-Z\s]/.test(cleanGiven)) {
      warnings.push("Names contain punctuation or non-alphabetic characters. Airlines require letters only (A-Z).");
    }

    // 2. Check title embedded inside given name (e.g. "MR MD RAHMAN")
    const commonTitles = ["MR", "MRS", "MS", "MISS", "MSTR", "DR"];
    for (const t of commonTitles) {
      if (cleanGiven.startsWith(`${t} `) || cleanGiven.endsWith(` ${t}`)) {
        warnings.push(`Title "${t}" detected inside the given name. Separate the title from the legal name to prevent name mismatch fees.`);
      }
    }

    // 3. Single name check
    if (cleanSurname === cleanGiven) {
      warnings.push("Surname and given name appear identical. Certain carriers require FNU (First Name Unknown) formatting.");
    }

    // 4. Date of birth sanity check
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        warnings.push("Date of birth cannot be in the future.");
      }
    }

    // 5. Passport validity advisory
    if (passportExpiry) {
      const expDate = new Date(passportExpiry);
      const minValid = new Date();
      minValid.setMonth(minValid.getMonth() + 6);
      if (expDate < minValid) {
        warnings.push("Passport validity is under 6 months from today. Many international destinations require at least 6 months validity from departure date.");
      }
    }

    const formattedGdsString = `${cleanSurname}/${cleanGiven} ${cleanTitle}`.trim();

    return NextResponse.json({
      success: true,
      audit: {
        valid: warnings.length === 0,
        warnings,
        normalizedSurname: cleanSurname,
        normalizedGivenNames: cleanGiven,
        formattedGdsString,
        penaltyRiskLevel: warnings.length === 0 ? "LOW_RISK" : "ADVISORY_WARNINGS",
        disclaimer: "Document advisory check only. Specific destination immigration rules and airline requirements vary; this check does not guarantee passport authenticity or border entry.",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
