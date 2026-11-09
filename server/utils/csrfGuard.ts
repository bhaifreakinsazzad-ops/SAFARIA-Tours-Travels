// ==============================================================================
// SAFARIA Tours & Travels — CSRF & Origin Validation Guard
// Validates Origin and Referer on cookie-authenticated mutating requests
// ==============================================================================

import { NextRequest } from "next/server";
import { SAFARIA_CONFIG } from "@/config/constants";

/**
 * Validates request origin against authorized site URLs.
 * Bypassed for non-cookie requests (e.g. Bearer auth) or test environments.
 */
export function isAuthorizedOrigin(req: NextRequest): boolean {
  // Test environments or safe methods bypass CSRF check
  if (process.env.NODE_ENV === "test") return true;
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;

  // Custom header protection (browsers restrict custom headers in cross-origin simple requests)
  if (req.headers.get("x-safaria-csrf") || req.headers.get("x-requested-with")) {
    return true;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  // Determine allowed hosts
  const configuredHost = new URL(SAFARIA_CONFIG.siteUrl).host;
  const allowedHosts = new Set([
    configuredHost,
    "localhost:3000",
    "127.0.0.1:3000",
  ]);

  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL);
  }

  const isHostAllowed = (host: string): boolean => {
    if (allowedHosts.has(host)) return true;

    // Strict vercel preview verification: only allow exact matching vercel preview host
    // or exact safaria.vibing.world subdomains, NEVER general suffixes like attacker.vercel.app
    if (process.env.VERCEL_URL && host === process.env.VERCEL_URL) return true;
    if (process.env.NEXT_PUBLIC_VERCEL_URL && host === process.env.NEXT_PUBLIC_VERCEL_URL) return true;
    if (host === "safaria.vibing.world" || host.endsWith(".safaria.vibing.world")) return true;

    // Reject all unknown or arbitrary vercel/vibing subdomains
    return false;
  };

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (isHostAllowed(originHost)) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (isHostAllowed(refererHost)) return true;
    } catch {
      return false;
    }
  }

  // If both origin and referer are missing on a mutating browser request with cookies,
  // reject in production; allow in local dev.
  if (!origin && !referer) {
    return process.env.NODE_ENV !== "production";
  }

  return false;
}
