// ==============================================================================
// SAFARIA Tours & Travels — CSRF & Origin Guard Unit Tests (Directive 015)
// Verifies strict origin matching, trusted allowlists, and rejection of forged requests
// ==============================================================================

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { isAuthorizedOrigin } from "@server/utils/csrfGuard";

describe("CSRF Guard & Origin Validation (Directive 015)", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalVercelUrl = process.env.VERCEL_URL;

  beforeEach(() => {
    // Set NODE_ENV to production to enforce active CSRF origin inspection
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.VERCEL_URL = "safaria-tours-travels-preview-123.vercel.app";
  });

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    process.env.VERCEL_URL = originalVercelUrl;
  });

  it("permits safe HTTP methods (GET, HEAD, OPTIONS) without origin validation", () => {
    const req = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "GET",
    });
    expect(isAuthorizedOrigin(req)).toBe(true);
  });

  it("allows exact canonical production origin", () => {
    const req = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "POST",
      headers: {
        origin: "https://safaria.vibing.world",
      },
    });
    expect(isAuthorizedOrigin(req)).toBe(true);
  });

  it("allows verified exact VERCEL_URL preview host", () => {
    const req = new NextRequest("https://safaria-tours-travels-preview-123.vercel.app/api/partner/desk", {
      method: "POST",
      headers: {
        origin: "https://safaria-tours-travels-preview-123.vercel.app",
      },
    });
    expect(isAuthorizedOrigin(req)).toBe(true);
  });

  it("strictly REJECTS forged attacker domains under .vercel.app or .vibing.world", () => {
    const maliciousReq1 = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "POST",
      headers: {
        origin: "https://evil-attacker.vercel.app",
      },
    });
    expect(isAuthorizedOrigin(maliciousReq1)).toBe(false);

    const maliciousReq2 = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "POST",
      headers: {
        origin: "https://attacker-vibing.world",
      },
    });
    expect(isAuthorizedOrigin(maliciousReq2)).toBe(false);
  });

  it("REJECTS arbitrary custom headers if origin is untrusted (Directive 015 bypass closure)", () => {
    const forgedReq = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "POST",
      headers: {
        origin: "https://phishing-safaria.com",
        "x-safaria-csrf": "arbitrary-value",
        "x-requested-with": "XMLHttpRequest",
      },
    });
    expect(isAuthorizedOrigin(forgedReq)).toBe(false);
  });

  it("REJECTS mutating browser requests missing both origin and referer in production", () => {
    const missingOriginReq = new NextRequest("https://safaria.vibing.world/api/partner/desk", {
      method: "POST",
    });
    expect(isAuthorizedOrigin(missingOriginReq)).toBe(false);
  });
});
