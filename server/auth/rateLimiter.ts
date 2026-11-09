// ==============================================================================
// SAFARIA Tours & Travels — In-Process Sliding-Window Rate Limiter
// Minimal brute-force mitigation for auth endpoints. Single-instance scope by
// design (consistent with the rest of this repo's in-memory fallback store);
// a multi-instance deployment needs a shared store (Redis/Postgres) instead.
// ==============================================================================

interface AttemptWindow {
  failures: number[]; // epoch ms of each failed attempt within the window
  blockedUntil?: number;
}

const windows = new Map<string, AttemptWindow>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60 * 1000; // 15 minutes

function prune(now: number) {
  if (windows.size < 5000) return;
  for (const [key, w] of windows) {
    if ((!w.blockedUntil || w.blockedUntil < now) && w.failures.every((t) => now - t > WINDOW_MS)) {
      windows.delete(key);
    }
  }
}

/** Call before attempting auth. Returns remaining lockout seconds, or 0 if allowed. */
export function checkRateLimit(key: string): number {
  const now = Date.now();
  const w = windows.get(key);
  if (!w) return 0;
  if (w.blockedUntil && w.blockedUntil > now) {
    return Math.ceil((w.blockedUntil - now) / 1000);
  }
  return 0;
}

/** Record a failed attempt; may start/extend a lockout. */
export function recordFailure(key: string): void {
  const now = Date.now();
  prune(now);
  const w = windows.get(key) || { failures: [] };
  w.failures = w.failures.filter((t) => now - t <= WINDOW_MS);
  w.failures.push(now);
  if (w.failures.length >= MAX_FAILURES) {
    w.blockedUntil = now + BLOCK_MS;
  }
  windows.set(key, w);
}

/** Clear the record on a successful attempt. */
export function recordSuccess(key: string): void {
  windows.delete(key);
}
