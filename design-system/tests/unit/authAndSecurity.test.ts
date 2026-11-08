import { describe, it, expect } from "vitest";
import { signSession, verifySession } from "@/lib/auth/authService";

describe("Auth & Session Security Service", () => {
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
});
