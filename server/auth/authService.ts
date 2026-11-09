// ==============================================================================
// SAFARIA Tours & Travels — Role-Based Authentication & Session Service
// Cryptographically signed HMAC-SHA256 session tokens with tenant scoping
// ==============================================================================

import crypto from "crypto";
import { NextRequest } from "next/server";
import { enquiriesRepository } from "@server/db/enquiriesRepository";
import { staffService, StaffRole } from "./staffService";

export type UserRole = StaffRole | "B2B_PARTNER" | "ANONYMOUS";

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
export function revokeSession(jti: string, userId?: string, reason: string = "LOGOUT"): void {
  revokedSessions.add(jti);
  enquiriesRepository.revokeSession(jti, userId, reason).catch(() => {});
}

/**
 * Durable session revocation that waits for database persistence
 */
export async function revokeSessionDurable(
  jti: string,
  userId?: string,
  reason: string = "LOGOUT"
): Promise<void> {
  revokedSessions.add(jti);
  await enquiriesRepository.revokeSession(jti, userId, reason);
}

/**
 * Check whether a session token has been revoked
 */
export function isSessionRevoked(jti: string): boolean {
  return revokedSessions.has(jti);
}

/**
 * Asynchronously check whether a session token has been revoked in database
 */
export async function isSessionRevokedDurable(jti: string): Promise<boolean> {
  if (revokedSessions.has(jti)) return true;
  const isRevoked = await enquiriesRepository.isSessionRevoked(jti);
  if (isRevoked) revokedSessions.add(jti);
  return isRevoked;
}

/**
 * Testing utility to clear revoked session registry
 */
export function _resetRevocationRegistry(): void {
  revokedSessions.clear();
}

/**
 * Resolves the cryptographic signing secret.
 * In production runtime, SESSION_SECRET is strictly mandatory; ephemeral fallbacks are rejected.
 */
export function getSecretKey(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    throw new Error(
      "FATAL SECURITY CONFIGURATION: SESSION_SECRET environment variable is mandatory in production! Ephemeral fallbacks are prohibited."
    );
  }
  return "safaria-jwt-secret-emerald-gold-2026-production";
}

export { generateTemporaryPassword, hashPassword, verifyPassword } from "./passwordService";

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
    .createHmac("sha256", getSecretKey())
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
      .createHmac("sha256", getSecretKey())
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
  } catch {
    return null;
  }
}

/**
 * Durable session verification checking database revocation and account status
 * (Fails closed on revoked tokens, suspended partner accounts, or suspended staff accounts)
 */
export async function verifySessionDurable(token: string): Promise<SessionPayload | null> {
  const session = verifySession(token);
  if (!session) return null;

  // 1. Verify against durable revocation table in database
  if (session.jti && (await isSessionRevokedDurable(session.jti))) {
    return null;
  }

  // 2. Dynamic account suspension check for B2B Partners
  if (session.role === "B2B_PARTNER" && session.agencyId) {
    const isActive = await enquiriesRepository.isAgencyActive(session.agencyId);
    if (!isActive) {
      return null;
    }
  }

  // 3. Dynamic account status check for Staff users
  if (session.role === "SUPER_ADMIN" || session.role === "OPS_AGENT" || session.role === "FINANCE_DESK") {
    const staffUser = await staffService.getStaffUserByEmail(session.email);
    if (staffUser && staffUser.status !== "ACTIVE") {
      return null;
    }
  }

  return session;
}

/**
 * Asynchronously extract session from request with durable verification
 */
export async function extractSessionFromRequestAsync(req: NextRequest): Promise<SessionPayload | null> {
  const syncSession = extractSessionFromRequest(req);
  if (!syncSession) return null;

  // 1. Verify against durable revocation table in database
  if (syncSession.jti && (await isSessionRevokedDurable(syncSession.jti))) {
    return null;
  }

  // 2. Dynamic account suspension check for B2B Partners
  if (syncSession.role === "B2B_PARTNER" && syncSession.agencyId) {
    const isActive = await enquiriesRepository.isAgencyActive(syncSession.agencyId);
    if (!isActive) {
      return null;
    }
  }

  // 3. Dynamic account status check for Staff users
  if (syncSession.role === "SUPER_ADMIN" || syncSession.role === "OPS_AGENT" || syncSession.role === "FINANCE_DESK") {
    if (syncSession.jti === "test-admin-session" || syncSession.jti === "admin-api-key-session") {
      return syncSession;
    }
    const staffUser = await staffService.getStaffUserByEmail(syncSession.email);
    if (staffUser && staffUser.status !== "ACTIVE") {
      return null;
    }
  }

  return syncSession;
}

/**
 * Helper to extract raw token string from request
 */
export function extractRawTokenFromRequest(req: NextRequest): string | null {
  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Try x-safaria-session custom header
  const customHeader = req.headers.get("x-safaria-session");
  if (customHeader) {
    return customHeader.trim();
  }

  // 3. Try cookies
  const cookieToken = req.cookies.get("safaria_session")?.value;
  if (cookieToken) {
    return cookieToken.trim();
  }

  return null;
}

/**
 * Extract authenticated session from NextRequest (Cookie, Bearer header, or Admin Key)
 */
export function extractSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = extractRawTokenFromRequest(req);
  if (token) {
    const session = verifySession(token);
    if (session) return session;
  }

  // 4. Secure admin key header check for server-to-server operations
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
