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

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (allowedHosts.has(originHost)) return true;
      if (originHost.endsWith(".vibing.world") || originHost.endsWith(".vercel.app")) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (allowedHosts.has(refererHost)) return true;
      if (refererHost.endsWith(".vibing.world") || refererHost.endsWith(".vercel.app")) {
        return true;
      }
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
