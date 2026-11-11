import { describe, it, expect, beforeEach } from "vitest";
import { staffService } from "@server/auth/staffService";
import { hashPassword } from "@server/auth/passwordService";

describe("Staff Authentication & Identity RBAC (Directive 011)", () => {
  beforeEach(() => {
    staffService._resetStaffStore();
  });

  it("authenticates valid individual staff credentials with active status", async () => {
    const res = await staffService.verifyStaffCredentials(
      "ops@safaria.vibing.world",
      "safaria-ops-2026"
    );

    expect(res.success).toBe(true);
    expect(res.user).toBeDefined();
    expect(res.user?.email).toBe("ops@safaria.vibing.world");
    expect(res.user?.role).toBe("SUPER_ADMIN");
    expect(res.user?.status).toBe("ACTIVE");
    expect(res.user?.failedLoginAttempts).toBe(0);
  });

  it("rejects invalid password and increments failed login counter", async () => {
    const res = await staffService.verifyStaffCredentials(
      "ops@safaria.vibing.world",
      "wrong-password"
    );

    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid staff credentials");

    const user = await staffService.getStaffUserByEmail("ops@safaria.vibing.world");
    expect(user?.failedLoginAttempts).toBe(1);
  });

  it("locks out an account for 15 minutes after 5 consecutive failed attempts", async () => {
    const email = "ops@safaria.vibing.world";

    for (let i = 1; i <= 4; i++) {
      const res = await staffService.verifyStaffCredentials(email, "wrong-password");
      expect(res.success).toBe(false);
    }

    // 5th attempt triggers lockout
    const fifthRes = await staffService.verifyStaffCredentials(email, "wrong-password");
    expect(fifthRes.success).toBe(false);
    expect(fifthRes.error).toContain("Account locked for 15 minutes");
    expect(fifthRes.lockedForSeconds).toBe(900);

    // 6th attempt with CORRECT password is still rejected due to active lock
    const lockedRes = await staffService.verifyStaffCredentials(email, "safaria-ops-2026");
    expect(lockedRes.success).toBe(false);
    expect(lockedRes.error).toContain("Account is temporarily locked");
    expect(lockedRes.lockedForSeconds).toBeGreaterThan(0);
  });

  it("denies access immediately if staff user is suspended or deactivated", async () => {
    const creds = hashPassword("TempPass123!");
    await staffService.upsertStaffUser({
      email: "suspended@safaria.vibing.world",
      fullName: "Suspended Agent",
      role: "OPS_AGENT",
      passwordHash: creds.hash,
      passwordSalt: creds.salt,
      status: "SUSPENDED",
    });

    const res = await staffService.verifyStaffCredentials(
      "suspended@safaria.vibing.world",
      "TempPass123!"
    );

    expect(res.success).toBe(false);
    expect(res.error).toBe("Staff account is suspended. Access denied.");
  });

  it("strictly rejects deleted or non-existent staff users", async () => {
    const res = await staffService.verifyStaffCredentials(
      "deleted.user@safaria.vibing.world",
      "SomePassword123!"
    );
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid staff credentials");
  });

  it("fails closed in production if bootstrap admin password is not configured", async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalPass = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.BOOTSTRAP_ADMIN_PASSWORD;

      await expect(
        staffService.bootstrapInitialStaffUser({
          email: "admin.prod@safaria.vibing.world",
        })
      ).rejects.toThrow("BOOTSTRAP_ADMIN_PASSWORD environment variable or explicit password must be provided in production.");
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
      if (originalPass) process.env.BOOTSTRAP_ADMIN_PASSWORD = originalPass;
    }
  });

  it("records persistent audit logs for staff operations", async () => {
    await staffService.recordStaffAuditLog({
      staffEmail: "ops@safaria.vibing.world",
      action: "AGENCY_STATUS_CHANGE",
      targetType: "agency_application",
      targetId: "agency-123",
      details: { newStatus: "ACTIVE_PARTNER" },
      ipAddress: "192.168.1.1",
    });

    const logs = await staffService.getStaffAuditLogs({
      staffEmail: "ops@safaria.vibing.world",
    });

    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].action).toBe("AGENCY_STATUS_CHANGE");
    expect(logs[0].targetId).toBe("agency-123");
    expect(logs[0].ipAddress).toBe("192.168.1.1");
  });
});
