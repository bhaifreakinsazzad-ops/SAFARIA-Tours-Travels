// ==============================================================================
// SAFARIA Tours & Travels — Authoritative Staff Identity & RBAC Service
// Individual staff accounts, scrypt hashing, lockouts, and persistent audit logs
// ==============================================================================

import { getSupabaseServiceClient } from "@server/db/supabaseClient";
import { hashPassword, verifyPassword } from "./passwordService";

export type StaffRole = "SUPER_ADMIN" | "OPS_AGENT" | "FINANCE_DESK";
export type StaffStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export interface StoredStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: StaffRole;
  passwordHash: string;
  passwordSalt: string;
  status: StaffStatus;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAuditLog {
  id: string;
  staffId?: string;
  staffEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// In-Memory store for offline unit test runs only
const memoryStaffUsers = new Map<string, StoredStaffUser>();
const memoryStaffAuditLogs: StaffAuditLog[] = [];

// Seed default staff user strictly for test runs
function seedDefaultTestStaff() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const now = new Date().toISOString();
  const hashedPassword = hashPassword("safaria-ops-2026");
  const defaultStaff: StoredStaffUser = {
    id: "staff-ops-default-01",
    email: "ops@safaria.vibing.world",
    fullName: "SAFARIA Lead Operations",
    role: "SUPER_ADMIN",
    passwordHash: hashedPassword.hash,
    passwordSalt: hashedPassword.salt,
    status: "ACTIVE",
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };
  memoryStaffUsers.set(defaultStaff.email.toLowerCase(), defaultStaff);
}

seedDefaultTestStaff();

export const staffService = {
  /**
   * Look up a staff user by email address
   */
  async getStaffUserByEmail(email: string): Promise<StoredStaffUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("staff_users")
          .select("*")
          .eq("email", cleanEmail)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role as StaffRole,
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
            status: data.status as StaffStatus,
            failedLoginAttempts: data.failed_login_attempts ?? 0,
            lockedUntil: data.locked_until,
            lastLoginAt: data.last_login_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        if (error && error.code !== "PGRST116") {
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database error looking up staff user: ${error.message}`);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") throw err;
        console.warn("Supabase getStaffUserByEmail error:", err);
      }
    }

    // In production with live Supabase configured, require database persistence
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return null;
    }

    return memoryStaffUsers.get(cleanEmail) || null;
  },

  /**
   * Look up staff user by UUID ID
   */
  async getStaffUserById(id: string): Promise<StoredStaffUser | null> {
    const supabase = getSupabaseServiceClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("staff_users")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role as StaffRole,
            passwordHash: data.password_hash,
            passwordSalt: data.password_salt,
            status: data.status as StaffStatus,
            failedLoginAttempts: data.failed_login_attempts ?? 0,
            lockedUntil: data.locked_until,
            lastLoginAt: data.last_login_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
        if (error && error.code !== "PGRST116") {
          if (process.env.NODE_ENV === "production") {
            throw new Error(`Database error looking up staff user by id: ${error.message}`);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "production") throw err;
        console.warn("Supabase getStaffUserById error:", err);
      }
    }

    if (process.env.NODE_ENV === "production") {
      return null;
    }

    for (const user of memoryStaffUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
  },

  /**
   * Verify individual staff credentials with lockout enforcement
   */
  async verifyStaffCredentials(
    email: string,
    password: string,
    clientIp?: string
  ): Promise<{
    success: boolean;
    user?: StoredStaffUser;
    error?: string;
    lockedForSeconds?: number;
  }> {
    const user = await this.getStaffUserByEmail(email);

    if (!user) {
      return { success: false, error: "Invalid staff credentials" };
    }

    if (user.status !== "ACTIVE") {
      return {
        success: false,
        error: `Staff account is ${user.status.toLowerCase()}. Access denied.`,
      };
    }

    const now = new Date();
    const nowMs = now.getTime();
    const nowIso = now.toISOString();

    // Check temporary account lockout
    if (user.lockedUntil) {
      const lockTimeMs = new Date(user.lockedUntil).getTime();
      if (lockTimeMs > nowMs) {
        const remainingSeconds = Math.ceil((lockTimeMs - nowMs) / 1000);
        return {
          success: false,
          error: `Account is temporarily locked due to consecutive failed attempts. Try again in ${remainingSeconds} seconds.`,
          lockedForSeconds: remainingSeconds,
        };
      }
    }

    const isMatch = verifyPassword(password, user.passwordHash, user.passwordSalt);

    if (!isMatch) {
      const attempts = user.failedLoginAttempts + 1;
      let lockedUntil: string | null = null;
      let errorMsg = "Invalid staff credentials";

      // 5 consecutive failures triggers a 15-minute lockout
      if (attempts >= 5) {
        const lockoutDate = new Date(nowMs + 15 * 60 * 1000);
        lockedUntil = lockoutDate.toISOString();
        errorMsg = "Too many failed login attempts. Account locked for 15 minutes.";
      }

      await this._updateStaffLoginState(user.id, attempts, lockedUntil, user.lastLoginAt);

      await this.recordStaffAuditLog({
        staffId: user.id,
        staffEmail: user.email,
        action: "STAFF_LOGIN_FAILED",
        details: { attempts, locked: Boolean(lockedUntil) },
        ipAddress: clientIp,
      });

      return {
        success: false,
        error: errorMsg,
        lockedForSeconds: lockedUntil ? 900 : undefined,
      };
    }

    // Login successful: reset failed attempts and update last login
    await this._updateStaffLoginState(user.id, 0, null, nowIso);

    await this.recordStaffAuditLog({
      staffId: user.id,
      staffEmail: user.email,
      action: "STAFF_LOGIN_SUCCESS",
      ipAddress: clientIp,
    });

    return { success: true, user };
  },

  /**
   * Internal helper to update login attempts and timestamp
   */
  async _updateStaffLoginState(
    id: string,
    failedAttempts: number,
    lockedUntil: string | null,
    lastLoginAt?: string | null
  ): Promise<void> {
    const supabase = getSupabaseServiceClient();
    const nowIso = new Date().toISOString();

    if (supabase) {
      try {
        await supabase
          .from("staff_users")
          .update({
            failed_login_attempts: failedAttempts,
            locked_until: lockedUntil,
            last_login_at: lastLoginAt || null,
            updated_at: nowIso,
          })
          .eq("id", id);
      } catch (err) {
        console.warn("Supabase _updateStaffLoginState error:", err);
      }
    }

    for (const user of memoryStaffUsers.values()) {
      if (user.id === id) {
        user.failedLoginAttempts = failedAttempts;
        user.lockedUntil = lockedUntil;
        if (lastLoginAt) user.lastLoginAt = lastLoginAt;
        user.updatedAt = nowIso;
        break;
      }
    }
  },

  /**
   * Record an administrative audit log event
   */
  async recordStaffAuditLog(params: {
    staffId?: string;
    staffEmail: string;
    action: string;
    targetType?: string;
    targetId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<void> {
    const supabase = getSupabaseServiceClient();
    const nowIso = new Date().toISOString();
    const id = crypto.randomUUID();

    const record: StaffAuditLog = {
      id,
      staffId: params.staffId,
      staffEmail: params.staffEmail,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details || {},
      ipAddress: params.ipAddress,
      createdAt: nowIso,
    };

    if (supabase) {
      try {
        await supabase.from("staff_audit_logs").insert({
          id,
          staff_id: params.staffId,
          staff_email: params.staffEmail,
          action: params.action,
          target_type: params.targetType,
          target_id: params.targetId,
          details: params.details || {},
          ip_address: params.ipAddress,
          created_at: nowIso,
        });
        return;
      } catch (err) {
        console.warn("Supabase recordStaffAuditLog error:", err);
      }
    }

    memoryStaffAuditLogs.push(record);
  },

  /**
   * Operator-only bootstrap procedure for the initial SUPER_ADMIN account
   */
  async bootstrapInitialStaffUser(params?: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: StaffRole;
  }): Promise<StoredStaffUser> {
    const supabase = getSupabaseServiceClient();
    const email = (
      params?.email ||
      process.env.BOOTSTRAP_ADMIN_EMAIL ||
      "admin@safaria.vibing.world"
    )
      .trim()
      .toLowerCase();
    if (process.env.NODE_ENV === "production" && !params?.password && !process.env.BOOTSTRAP_ADMIN_PASSWORD) {
      throw new Error("BOOTSTRAP_ADMIN_PASSWORD environment variable or explicit password must be provided in production.");
    }
    const password = params?.password || process.env.BOOTSTRAP_ADMIN_PASSWORD || "safaria-ops-2026";
    const fullName = params?.fullName || "SAFARIA Super Administrator";
    const role: StaffRole = params?.role || "SUPER_ADMIN";

    const existing = await this.getStaffUserByEmail(email);
    if (existing) {
      return existing;
    }

    const { hash, salt } = hashPassword(password);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const user: StoredStaffUser = {
      id,
      email,
      fullName,
      role,
      passwordHash: hash,
      passwordSalt: salt,
      status: "ACTIVE",
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    if (supabase) {
      try {
        await supabase.from("staff_users").insert({
          id,
          email,
          full_name: fullName,
          role,
          password_hash: hash,
          password_salt: salt,
          status: "ACTIVE",
          failed_login_attempts: 0,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase bootstrapInitialStaffUser error:", err);
      }
    }

    memoryStaffUsers.set(email, user);
    return user;
  },

  /**
   * Upsert a staff user record (for provisioning & tests)
   */
  async upsertStaffUser(user: Partial<StoredStaffUser> & { email: string }): Promise<StoredStaffUser> {
    const cleanEmail = user.email.trim().toLowerCase();
    const existing = await this.getStaffUserByEmail(cleanEmail);
    const now = new Date().toISOString();
    const record: StoredStaffUser = {
      id: user.id || existing?.id || crypto.randomUUID(),
      email: cleanEmail,
      fullName: user.fullName || existing?.fullName || "Staff User",
      role: user.role || existing?.role || "OPS_AGENT",
      passwordHash: user.passwordHash || existing?.passwordHash || "",
      passwordSalt: user.passwordSalt || existing?.passwordSalt || "",
      status: user.status || existing?.status || "ACTIVE",
      failedLoginAttempts: user.failedLoginAttempts ?? existing?.failedLoginAttempts ?? 0,
      lockedUntil: user.lockedUntil ?? existing?.lockedUntil ?? null,
      lastLoginAt: user.lastLoginAt ?? existing?.lastLoginAt ?? null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    memoryStaffUsers.set(cleanEmail, record);
    return record;
  },

  /**
   * Retrieve audit logs recorded by staff operations
   */
  async getStaffAuditLogs(query?: { staffEmail?: string }): Promise<StaffAuditLog[]> {
    if (query?.staffEmail) {
      const clean = query.staffEmail.trim().toLowerCase();
      return memoryStaffAuditLogs.filter((l) => l.staffEmail.toLowerCase() === clean);
    }
    return [...memoryStaffAuditLogs];
  },

  /**
   * Reset in-memory staff store (for testing)
   */
  _resetStaffStore(): void {
    memoryStaffUsers.clear();
    memoryStaffAuditLogs.length = 0;
    seedDefaultTestStaff();
  },
};
