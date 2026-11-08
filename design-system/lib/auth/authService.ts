// ==============================================================================
// SAFARIA Tours & Travels — Role-Based Authentication & Session Service
// Cryptographically signed HMAC-SHA256 session tokens with tenant scoping
// ==============================================================================

import crypto from "crypto";
import { NextRequest } from "next/server";

export type UserRole = "SUPER_ADMIN" | "OPS_AGENT" | "B2B_PARTNER" | "ANONYMOUS";

export interface SessionPayload {
  jti: string; // Unique cryptographic Session/Token ID for granular revocation
  userId: string;
  email: string;
  role: UserRole;
  agencyId?: string; // Strictly scopes data to this agency when role === 'B2B_PARTNER'
  agencyName?: string;
  exp: number; // UNIX timestamp
}

// Memory-backed session revocation blacklist
const revokedSessions = new Set<string>();

/**
 * Revoke a specific session by its cryptographic token ID (jti)
 */
export function revokeSession(jti: string): void {
  revokedSessions.add(jti);
}

/**
 * Check whether a session token has been revoked
 */
export function isSessionRevoked(jti: string): boolean {
  return revokedSessions.has(jti);
}

/**
 * Testing utility to clear revoked session registry
 */
export function _resetRevocationRegistry(): void {
  revokedSessions.clear();
}

const SECRET_KEY =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.warn("CRITICAL SECURITY: SESSION_SECRET is unset in production! Generating secure ephemeral key.");
        return crypto.randomBytes(32).toString("hex");
      })()
    : "safaria-jwt-secret-emerald-gold-2026-production");

/**
 * Sign session payload into tamper-evident base64url token
 */
export function signSession(
  payload: Omit<SessionPayload, "exp" | "jti"> & { jti?: string },
  expiresInSeconds: number = 86400
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const jti = payload.jti || crypto.randomUUID();
  const fullPayload: SessionPayload = { ...payload, jti, exp };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode session token with constant-time check & revocation enforcement
 */
export function verifySession(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${header}.${body}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expSigBuf = Buffer.from(expectedSig);

    // Constant-time comparison with length matching to prevent buffer mismatch exceptions & timing attacks
    if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    // 1. Check expiration
    if (payload.exp < now) {
      return null;
    }

    // 2. Check session revocation
    if (payload.jti && isSessionRevoked(payload.jti)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract authenticated session from NextRequest (Cookie or Bearer header)
 */
export function extractSessionFromRequest(req: NextRequest): SessionPayload | null {
  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = verifySession(token);
    if (session) return session;
  }

  // 2. Try x-safaria-session custom header
  const customHeader = req.headers.get("x-safaria-session");
  if (customHeader) {
    const session = verifySession(customHeader.trim());
    if (session) return session;
  }

  // 3. Try cookies
  const cookieToken = req.cookies.get("safaria_session")?.value;
  if (cookieToken) {
    return verifySession(cookieToken);
  }

  // 4. Secure admin key header check
  const adminKey = req.headers.get("x-safaria-admin-key");
  const configuredAdminKey = process.env.ADMIN_API_KEY;

  if (configuredAdminKey && adminKey === configuredAdminKey) {
    return {
      jti: "admin-api-key-session",
      userId: "ops-master-id",
      email: "ops@safaria.vibing.world",
      role: "SUPER_ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  // Staging / test fallback strictly restricted to non-production test suites
  if (process.env.NODE_ENV === "test" && adminKey === "safaria-ops-2026") {
    return {
      jti: "test-admin-session",
      userId: "ops-master-id",
      email: "ops@safaria.vibing.world",
      role: "SUPER_ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  return null;
}
