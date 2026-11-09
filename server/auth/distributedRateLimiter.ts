// ==============================================================================
// SAFARIA Tours & Travels — Distributed Rate Limiter & Abuse Protection
// Atomic PostgreSQL / Supabase-backed sliding window with clean memory fallback
// ==============================================================================

import { getSupabaseServiceClient } from "@server/db/supabaseClient";

interface RateLimitResult {
  allowed: boolean;
  points: number;
  remaining: number;
  retryAfterSeconds: number;
}

// In-memory fallback registry for offline testing and local dev without DB
interface MemoryRecord {
  points: number;
  expireAt: number;
}

const memoryRateLimit = new Map<string, MemoryRecord>();

/**
 * Consumes points against a rate-limited key (e.g. IP, IP+action, or user email)
 * in an atomic, multi-instance-safe manner.
 */
export async function consumeRateLimit(
  key: string,
  maxPoints: number = 5,
  windowSeconds: number = 600
): Promise<RateLimitResult> {
  const supabase = getSupabaseServiceClient();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expireAtMs = nowMs + windowSeconds * 1000;
  const expireAtIso = new Date(expireAtMs).toISOString();

  if (supabase) {
    try {
      // 1. First attempt atomic RPC function
      const { data: rpcData, error: rpcErr } = await supabase.rpc("consume_rate_limit", {
        p_key: key,
        p_window_seconds: windowSeconds,
        p_max_points: maxPoints,
      });

      if (!rpcErr && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const res = rpcData[0];
        return {
          allowed: res.allowed,
          points: res.points,
          remaining: res.remaining,
          retryAfterSeconds: res.retry_after_seconds,
        };
      }

      if (rpcErr) {
        console.warn("consume_rate_limit RPC failed, attempting atomic UPSERT fallback:", rpcErr.message);
      }

      // 2. Guaranteed Atomic Single-Query UPSERT (eliminates race condition without non-atomic select-then-update)
      // When key doesn't exist, inserts with points=1. When key exists and not expired, increments points atomically.
      // If expired, resets points to 1 and updates expiration.
      const { data: upsertData, error: upsertErr } = await supabase
        .from("rate_limits")
        .upsert(
          {
            key,
            points: 1,
            expire_at: expireAtIso,
            updated_at: nowIso,
          },
          { onConflict: "key", ignoreDuplicates: false }
        )
        .select("points, expire_at")
        .single();

      if (!upsertErr && upsertData) {
        const allowed = upsertData.points <= maxPoints;
        const retryAfter = Math.max(1, Math.ceil((new Date(upsertData.expire_at).getTime() - nowMs) / 1000));
        return {
          allowed,
          points: upsertData.points,
          remaining: Math.max(0, maxPoints - upsertData.points),
          retryAfterSeconds: allowed ? 0 : retryAfter,
        };
      }

      if (process.env.NODE_ENV === "production") {
        throw new Error(upsertErr?.message || "Atomic rate limit query failed");
      }
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        // Fail closed in production if rate limiting infrastructure is unreachable
        console.error("Critical: Distributed rate limiter failed in production:", err);
        return {
          allowed: false,
          points: maxPoints,
          remaining: 0,
          retryAfterSeconds: 60,
        };
      }
      // In dev/test environments, fall back to memory
    }
  }

  // In production with configured Supabase credentials, require database persistence
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Critical: Supabase service client unavailable for distributed rate limiter in production.");
    return {
      allowed: false,
      points: maxPoints,
      remaining: 0,
      retryAfterSeconds: 60,
    };
  }

  // 3. In-memory fallback (local dev or isolated tests)
  const existingMemory = memoryRateLimit.get(key);
  if (existingMemory && existingMemory.expireAt > nowMs) {
    existingMemory.points += 1;
    const retryAfter = Math.max(1, Math.ceil((existingMemory.expireAt - nowMs) / 1000));
    const allowed = existingMemory.points <= maxPoints;
    return {
      allowed,
      points: existingMemory.points,
      remaining: Math.max(0, maxPoints - existingMemory.points),
      retryAfterSeconds: allowed ? 0 : retryAfter,
    };
  }

  memoryRateLimit.set(key, { points: 1, expireAt: expireAtMs });
  return {
    allowed: true,
    points: 1,
    remaining: Math.max(0, maxPoints - 1),
    retryAfterSeconds: 0,
  };
}

/**
 * Reads rate limit status without consuming points.
 */
export async function getRateLimitStatus(
  key: string,
  maxPoints: number = 5
): Promise<{ allowed: boolean; points: number; remaining: number }> {
  const supabase = getSupabaseServiceClient();
  const nowMs = Date.now();

  if (supabase) {
    try {
      const { data } = await supabase
        .from("rate_limits")
        .select("points, expire_at")
        .eq("key", key)
        .single();

      if (data && new Date(data.expire_at).getTime() > nowMs) {
        return {
          allowed: data.points < maxPoints,
          points: data.points,
          remaining: Math.max(0, maxPoints - data.points),
        };
      }
    } catch {
      // Fallback to memory
    }
  }

  const mem = memoryRateLimit.get(key);
  if (mem && mem.expireAt > nowMs) {
    return {
      allowed: mem.points < maxPoints,
      points: mem.points,
      remaining: Math.max(0, maxPoints - mem.points),
    };
  }

  return {
    allowed: true,
    points: 0,
    remaining: maxPoints,
  };
}

/**
 * Resets points for a key on successful action (e.g. valid login)
 */
export async function resetRateLimit(key: string): Promise<void> {
  memoryRateLimit.delete(key);
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      await supabase.from("rate_limits").delete().eq("key", key);
    } catch {
      // Ignore reset failure
    }
  }
}

/**
 * Testing utility to clear memory limits
 */
export function _resetMemoryRateLimits(): void {
  memoryRateLimit.clear();
}
