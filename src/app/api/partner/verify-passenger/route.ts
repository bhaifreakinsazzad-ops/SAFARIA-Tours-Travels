// ==============================================================================
// SAFARIA Tours & Travels — Verified Workflow™ Name & Passport Verification API
// Eliminates airline reissue penalties caused by misspelled passenger names
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { extractSessionFromRequest } from "@server/auth/authService";
import { getErrorMessage } from "@server/utils/errorMessage";

export interface PassengerAuditResult {
  valid: boolean;
  warnings: string[];
  normalizedSurname: string;
  normalizedGivenNames: string;
  formattedGdsString: string; // e.g. RAHMAN/TANVIR MR
}

export async function POST(req: NextRequest) {
  const session = extractSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { surname, givenNames, title, passportExpiry } = await req.json();

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

    // 2. Check title embedded inside given name (common agent error: "MR MD RAHMAN")
    const commonTitles = ["MR", "MRS", "MS", "MISS", "MSTR", "DR"];
    for (const t of commonTitles) {
      if (cleanGiven.startsWith(`${t} `) || cleanGiven.endsWith(` ${t}`)) {
        warnings.push(`Title "${t}" detected inside the given name. Separate the title from the legal name to prevent name mismatch fees.`);
      }
    }

    // 3. Single name check (passports with only one name e.g. "MOHAMMAD")
    if (cleanSurname === cleanGiven) {
      warnings.push("Surname and given name appear identical. Airlines like Saudia/Emirates require FNU (First Name Unknown) formatting.");
    }

    // 4. Passport validity check
    if (passportExpiry) {
      const expDate = new Date(passportExpiry);
      const minValid = new Date();
      minValid.setMonth(minValid.getMonth() + 6); // 6 months rule
      if (expDate < minValid) {
        warnings.push("Passport validity is under 6 months from today. International travel may be rejected by immigration.");
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
        penaltyRiskLevel: warnings.length === 0 ? "ZERO_RISK" : "HIGH_PENALTY_RISK",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}
