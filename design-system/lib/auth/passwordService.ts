// ==============================================================================
// SAFARIA Tours & Travels — Password Hashing Utilities
// Standalone module (no repository/session imports) to avoid circular deps,
// since enquiriesRepository needs these for B2B partner credential issuance.
// ==============================================================================

import crypto from "crypto";

/**
 * Generate a high-entropy temporary password for B2B partner credential issuance.
 * Returned once, in plaintext, to the issuing admin; only its scrypt hash is persisted.
 */
export function generateTemporaryPassword(): string {
  return crypto.randomBytes(12).toString("base64url");
}

/**
 * Hash a plaintext password with a random salt (scrypt, 64-byte derived key).
 * No stored-password scheme existed previously for B2B partners; this is the
 * only persisted form — plaintext passwords are never written to storage.
 */
export function hashPassword(plaintext: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plaintext, salt, 64).toString("hex");
  return { hash, salt };
}

/**
 * Constant-time verification of a plaintext password against a stored scrypt hash+salt.
 */
export function verifyPassword(plaintext: string, hash: string, salt: string): boolean {
  if (!plaintext || !hash || !salt) return false;
  const candidate = crypto.scryptSync(plaintext, salt, 64);
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}
