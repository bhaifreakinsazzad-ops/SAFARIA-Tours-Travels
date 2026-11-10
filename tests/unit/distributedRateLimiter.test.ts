import { describe, it, expect, beforeEach } from "vitest";
import {
  consumeRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  _resetMemoryRateLimits,
} from "@server/auth/distributedRateLimiter";

describe("Distributed Sliding-Window Rate Limiter (Directive 011)", () => {
  beforeEach(() => {
    _resetMemoryRateLimits();
  });

  it("permits requests within maximum points allowance", async () => {
    const key = "test-ip-10.0.0.1";
    const res1 = await consumeRateLimit(key, 3, 60);

    expect(res1.allowed).toBe(true);
    expect(res1.points).toBe(1);
    expect(res1.remaining).toBe(2);
    expect(res1.retryAfterSeconds).toBe(0);

    const res2 = await consumeRateLimit(key, 3, 60);
    expect(res2.allowed).toBe(true);
    expect(res2.points).toBe(2);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests once points exceed maximum allowance with retryAfter", async () => {
    const key = "test-ip-10.0.0.2";

    await consumeRateLimit(key, 2, 60);
    await consumeRateLimit(key, 2, 60);

    // 3rd attempt exceeds limit of 2
    const res3 = await consumeRateLimit(key, 2, 60);
    expect(res3.allowed).toBe(false);
    expect(res3.points).toBe(3);
    expect(res3.remaining).toBe(0);
    expect(res3.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets rate limit points on explicit reset", async () => {
    const key = "test-ip-10.0.0.3";

    await consumeRateLimit(key, 1, 60);
    const blocked = await consumeRateLimit(key, 1, 60);
    expect(blocked.allowed).toBe(false);

    await resetRateLimit(key);

    const fresh = await consumeRateLimit(key, 1, 60);
    expect(fresh.allowed).toBe(true);
    expect(fresh.points).toBe(1);
  });

  it("accurately reads rate limit status without consuming points", async () => {
    const key = "test-ip-10.0.0.4";

    const emptyStatus = await getRateLimitStatus(key, 5);
    expect(emptyStatus.allowed).toBe(true);
    expect(emptyStatus.points).toBe(0);

    await consumeRateLimit(key, 5, 120);

    const statusAfter = await getRateLimitStatus(key, 5);
    expect(statusAfter.points).toBe(1);
    expect(statusAfter.remaining).toBe(4);
  });
});
