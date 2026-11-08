import { describe, it, expect, beforeEach } from "vitest";
import {
  signSession,
  verifySession,
  revokeSession,
  revokeSessionDurable,
  isSessionRevoked,
  isSessionRevokedDurable,
  verifySessionDurable,
  getSecretKey,
  _resetRevocationRegistry,
} from "@/lib/auth/authService";
import { enquiriesRepository } from "@/lib/db/enquiriesRepository";

describe("Auth & Session Security Service", () => {
  beforeEach(() => {
    _resetRevocationRegistry();
    enquiriesRepository._resetStore();
  });
  it("should generate cryptographically verifiable HMAC-SHA256 session token", () => {
    const token = signSession({
      userId: "user_123",
      email: "partner@agency.com",
      role: "B2B_PARTNER",
      agencyId: "agency_456",
      agencyName: "Dhaka Travels",
    });

    expect(token).toBeDefined();
    const verified = verifySession(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe("partner@agency.com");
    expect(verified?.role).toBe("B2B_PARTNER");
    expect(verified?.agencyId).toBe("agency_456");
  });

  it("should reject tampered session tokens", () => {
    const token = signSession({
      userId: "user_123",
      email: "partner@agency.com",
      role: "B2B_PARTNER",
    });

    const parts = token.split(".");
    // Tamper payload body (part 1)
    const tamperedBody = Buffer.from(JSON.stringify({ userId: "admin", role: "SUPER_ADMIN" })).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedBody}.${parts[2]}`;

    const verified = verifySession(tamperedToken);
    expect(verified).toBeNull();
  });

  it("should reject expired session tokens", () => {
    // Expires in -10 seconds
    const expiredToken = signSession(
      {
        userId: "user_123",
        email: "partner@agency.com",
        role: "B2B_PARTNER",
      },
      -10
    );

    const verified = verifySession(expiredToken);
    expect(verified).toBeNull();
  });

  it("should immediately invalidate and revoke a session by its token ID (jti)", () => {
    const token = signSession({
      userId: "user_789",
      email: "agent@greendelta.com",
      role: "B2B_PARTNER",
      agencyId: "agency-greendelta-01",
    });

    const activeSession = verifySession(token);
    expect(activeSession).not.toBeNull();
    expect(activeSession?.jti).toBeDefined();

    // Revoke the session
    revokeSession(activeSession!.jti);

    expect(isSessionRevoked(activeSession!.jti)).toBe(true);

    // Verified must now return null
    const revokedSession = verifySession(token);
    expect(revokedSession).toBeNull();
  });

  it("should gracefully handle signature length tampering without throwing exceptions", () => {
    const token = signSession({
      userId: "user_test",
      email: "test@safaria.world",
      role: "OPS_AGENT",
    });

    const parts = token.split(".");
    // Truncate signature to different byte length
    const shortSigToken = `${parts[0]}.${parts[1]}.${parts[2].substring(0, 10)}`;

    expect(() => verifySession(shortSigToken)).not.toThrow();
    expect(verifySession(shortSigToken)).toBeNull();
  });

  it("should persist session revocation durably and survive process-local cache clears", async () => {
    const token = signSession({
      userId: "user_durable",
      email: "agent@partner.com",
      role: "B2B_PARTNER",
      agencyId: "agency-greendelta-01",
    });

    const active = verifySession(token);
    expect(active).not.toBeNull();
    const jti = active!.jti;

    // Revoke durably
    await revokeSessionDurable(jti, "user_durable", "STAFF_INITIATED");

    // Clear process-local memory Set to simulate a restart / different serverless worker
    _resetRevocationRegistry();

    // Durable check must still confirm revocation
    const isRevokedInDb = await isSessionRevokedDurable(jti);
    expect(isRevokedInDb).toBe(true);

    // Durable verification must reject the token
    const verifiedDurable = await verifySessionDurable(token);
    expect(verifiedDurable).toBeNull();
  });

  it("should dynamically reject sessions when agency application is suspended or rejected", async () => {
    // 1. Create an active agency application
    const agency = await enquiriesRepository.createAgencyApplication({
      agencyName: "Dynamic Test Agency",
      contactPerson: "Rahim Ali",
      phone: "+8801999888777",
      email: "rahim@dynamictest.com",
      city: "Dhaka",
      tradeLicenseNumber: "TRAD/TEST/001",
      yearsInBusiness: 3,
      monthlyTicketVolume: "20_TO_50",
      consentAgreed: true,
    });

    // Mark as active
    await enquiriesRepository.updateAgencyStatus(agency.id, "ACTIVE_PARTNER");

    // Sign session
    const token = signSession({
      userId: "partner_rahim",
      email: "rahim@dynamictest.com",
      role: "B2B_PARTNER",
      agencyId: agency.id,
      agencyName: "Dynamic Test Agency",
    });

    // Verified initially
    const active = await verifySessionDurable(token);
    expect(active).not.toBeNull();
    expect(active?.agencyId).toBe(agency.id);

    // 2. Staff suspends/rejects the agency
    await enquiriesRepository.updateAgencyStatus(agency.id, "REJECTED", "admin_ops", "Trade audit failed");

    // Dynamic verification must now immediately reject the session
    const suspended = await verifySessionDurable(token);
    expect(suspended).toBeNull();
  });

  it("strictly enforces SESSION_SECRET in production runtime and rejects ephemeral fallbacks", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.SESSION_SECRET;
    const originalPhase = process.env.NEXT_PHASE;

    try {
      // In production without SESSION_SECRET
      process.env.NODE_ENV = "production";
      delete process.env.SESSION_SECRET;
      delete process.env.NEXT_PHASE;

      expect(() => getSecretKey()).toThrow(
        /FATAL SECURITY CONFIGURATION: SESSION_SECRET environment variable is mandatory in production/i
      );

      // When SESSION_SECRET is provided in production
      process.env.SESSION_SECRET = "production-cryptographic-secret-key-1234567890";
      expect(getSecretKey()).toBe("production-cryptographic-secret-key-1234567890");
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret) {
        process.env.SESSION_SECRET = originalSecret;
      } else {
        delete process.env.SESSION_SECRET;
      }
      if (originalPhase) {
        process.env.NEXT_PHASE = originalPhase;
      } else {
        delete process.env.NEXT_PHASE;
      }
    }
  });
});
