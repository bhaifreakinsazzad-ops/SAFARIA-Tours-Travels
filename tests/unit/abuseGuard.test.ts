// ==============================================================================
// Coverage for the public enquiry abuse-protection helpers: per-key submission
// rate limiting and content-fingerprint duplicate detection.
// ==============================================================================
import { describe, it, expect } from "vitest";
import {
  checkSubmissionRateLimit,
  buildSubmissionFingerprint,
  isDuplicateSubmission,
} from "@server/utils/abuseGuard";

describe("checkSubmissionRateLimit", () => {
  it("allows submissions up to the configured cap, then blocks with a positive lockout", () => {
    const key = `rate-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkSubmissionRateLimit(key, 5, 10_000)).toBe(0);
    }
    const lockedForSeconds = checkSubmissionRateLimit(key, 5, 10_000);
    expect(lockedForSeconds).toBeGreaterThan(0);
  });

  it("tracks independent keys independently", () => {
    const keyA = `rate-a-${crypto.randomUUID()}`;
    const keyB = `rate-b-${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) checkSubmissionRateLimit(keyA, 5, 10_000);
    expect(checkSubmissionRateLimit(keyA, 5, 10_000)).toBeGreaterThan(0);
    expect(checkSubmissionRateLimit(keyB, 5, 10_000)).toBe(0);
  });
});

describe("buildSubmissionFingerprint + isDuplicateSubmission", () => {
  it("flags an identical submission within the window as a duplicate", () => {
    const fp = buildSubmissionFingerprint(["+8801700000000", "ONE_WAY", "DAC-DXB-2026-12-01"]);
    expect(isDuplicateSubmission(fp, 60_000)).toBe(false); // first time: not a duplicate
    expect(isDuplicateSubmission(fp, 60_000)).toBe(true); // second time: duplicate
  });

  it("does not flag genuinely different submissions as duplicates", () => {
    const fpA = buildSubmissionFingerprint(["+8801700000001", "ONE_WAY", "DAC-DXB-2026-12-01"]);
    const fpB = buildSubmissionFingerprint(["+8801700000002", "ONE_WAY", "DAC-DXB-2026-12-01"]);
    expect(isDuplicateSubmission(fpA, 60_000)).toBe(false);
    expect(isDuplicateSubmission(fpB, 60_000)).toBe(false);
  });

  it("is case/whitespace-insensitive and order-sensitive", () => {
    const fp1 = buildSubmissionFingerprint([" Jane@Example.com ", "VISA"]);
    const fp2 = buildSubmissionFingerprint(["jane@example.com", "visa"]);
    expect(fp1).toBe(fp2);
  });
});
