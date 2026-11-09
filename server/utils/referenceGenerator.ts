// ==============================================================================
// SAFARIA Tours & Travels — Collision-Resistant Reference Generator
// Generates human-friendly, auditable, timestamped tracking codes
// e.g., SFR-20261108-9K4W7X, B2B-20261108-7MX2P9
// ==============================================================================

import crypto from "crypto";

const SAFE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 31 safe chars (no 0, 1, I, O)

export function generateReferenceCode(
  prefix: "SFR" | "B2B" | "GEN" = "SFR",
  date: Date = new Date(),
  randomLength: number = 6
): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const dateSegment = `${year}${month}${day}`;

  const randomBytes = crypto.randomBytes(randomLength);
  let randomSegment = "";
  for (let i = 0; i < randomLength; i++) {
    const index = randomBytes[i] % SAFE_ALPHABET.length;
    randomSegment += SAFE_ALPHABET[index];
  }

  return `${prefix}-${dateSegment}-${randomSegment}`;
}

export function validateReferenceFormat(ref: string, prefix?: "SFR" | "B2B" | "GEN"): boolean {
  const prefixPattern = prefix || "(SFR|B2B|GEN)";
  const regex = new RegExp(`^${prefixPattern}-\\d{8}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4,8}$`);
  return regex.test(ref);
}
