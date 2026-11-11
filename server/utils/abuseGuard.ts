// ==============================================================================
// SAFARIA Tours & Travels — Public Enquiry Abuse Protection
// Multi-instance distributed submission throttle + duplicate-content detector
// Backed by PostgreSQL rate_limits with atomic sliding window & memory fallback
// ==============================================================================

import crypto from "crypto";
import { consumeRateLimit } from "@server/auth/distributedRateLimiter";

const submissionWindows = new Map<string, number[]>();
const recentFingerprints = new Map<string, number>();

const SUBMISSION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function pruneSubmissions(now: number) {
  if (submissionWindows.size < 5000) return;
  for (const [key, timestamps] of submissionWindows) {
    if (timestamps.every((t) => now - t > SUBMISSION_WINDOW_MS)) {
      submissionWindows.delete(key);
    }
  }
}

function pruneFingerprints(now: number) {
  if (recentFingerprints.size < 5000) return;
  for (const [key, seenAt] of recentFingerprints) {
    if (now - seenAt > DUPLICATE_WINDOW_MS) {
      recentFingerprints.delete(key);
    }
  }
}

/**
 * Checks and records a submission attempt against a per-key sliding-window
 * cap (default: 5 per 10 minutes). Returns remaining lockout seconds, or 0 if
 * the submission is allowed (in which case it is recorded as counted).
 * Synchronous version for testing and local memory checks.
 */
export function checkSubmissionRateLimit(
  key: string,
  maxPerWindow: number = MAX_SUBMISSIONS_PER_WINDOW,
  windowMs: number = SUBMISSION_WINDOW_MS
): number {
  const now = Date.now();
  pruneSubmissions(now);

  const timestamps = (submissionWindows.get(key) || []).filter((t) => now - t <= windowMs);
  if (timestamps.length >= maxPerWindow) {
    const oldest = Math.min(...timestamps);
    return Math.ceil((windowMs - (now - oldest)) / 1000);
  }

  timestamps.push(now);
  submissionWindows.set(key, timestamps);
  return 0;
}

/**
 * Distributed multi-instance-safe rate limiter checking PostgreSQL rate_limits table
 */
export async function checkSubmissionRateLimitAsync(
  key: string,
  maxPerWindow: number = MAX_SUBMISSIONS_PER_WINDOW,
  windowSeconds: number = 600
): Promise<number> {
  const result = await consumeRateLimit(`sub:${key}`, maxPerWindow, windowSeconds);
  if (!result.allowed) {
    return result.retryAfterSeconds;
  }
  return 0;
}

/**
 * Builds a stable content fingerprint from the fields that identify a
 * meaningfully-duplicate submission (e.g. same phone + same route/request),
 * independent of timestamps or generated reference numbers.
 */
export function buildSubmissionFingerprint(parts: Array<string | number | undefined>): string {
  const normalized = parts.map((p) => String(p ?? "").trim().toLowerCase()).join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Checks and records a content fingerprint against a short duplicate-content
 * window (default: 5 minutes). Returns true if this exact submission was
 * already seen within the window (i.e. should be rejected as a duplicate).
 */
export function isDuplicateSubmission(
  fingerprint: string,
  windowMs: number = DUPLICATE_WINDOW_MS
): boolean {
  const now = Date.now();
  pruneFingerprints(now);

  const seenAt = recentFingerprints.get(fingerprint);
  if (seenAt && now - seenAt <= windowMs) {
    return true;
  }

  recentFingerprints.set(fingerprint, now);
  return false;
}

/**
 * Distributed multi-instance-safe duplicate detection
 */
export async function isDuplicateSubmissionAsync(
  fingerprint: string,
  windowSeconds: number = 300
): Promise<boolean> {
  const result = await consumeRateLimit(`dedup:${fingerprint}`, 1, windowSeconds);
  // If points > 1, it has already been submitted inside the window
  return !result.allowed;
}

/**
 * Test utility to clear abuse guard maps
 */
export function _resetAbuseGuards(): void {
  submissionWindows.clear();
  recentFingerprints.clear();
}
