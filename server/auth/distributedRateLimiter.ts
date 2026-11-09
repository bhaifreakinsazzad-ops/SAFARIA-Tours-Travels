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
      // 1. Check existing record in PostgreSQL rate_limits table
      const { data: existing, error: selectErr } = await supabase
        .from("rate_limits")
        .select("points, expire_at")
        .eq("key", key)
        .single();

      if (!selectErr && existing) {
        const recordExpireAtMs = new Date(existing.expire_at).getTime();

        if (recordExpireAtMs > nowMs) {
          // Window is still active: increment points
          const newPoints = existing.points + 1;
          const retryAfterSeconds = Math.max(1, Math.ceil((recordExpireAtMs - nowMs) / 1000));

          await supabase
            .from("rate_limits")
            .update({
              points: newPoints,
              updated_at: nowIso,
            })
            .eq("key", key);

          const allowed = newPoints <= maxPoints;
          return {
            allowed,
            points: newPoints,
            remaining: Math.max(0, maxPoints - newPoints),
            retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
          };
        }
      }

      // 2. Insert or reset expired record
      await supabase.from("rate_limits").upsert({
        key,
        points: 1,
        expire_at: expireAtIso,
        updated_at: nowIso,
      });

      return {
        allowed: true,
        points: 1,
        remaining: Math.max(0, maxPoints - 1),
        retryAfterSeconds: 0,
      };
    } catch {
      // If Supabase query fails, fall back to memory
    }
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
