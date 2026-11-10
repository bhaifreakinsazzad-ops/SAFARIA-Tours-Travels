// ==============================================================================
// Coverage for /api/cron/dispatch-outbox's two entry points: the GET path
// Vercel Cron Jobs actually invoke (Authorization: Bearer <CRON_SECRET>,
// per vercel.json's crons entry) and the POST path used for manual/staff
// triggering. Neither was previously tested; the GET handler did not exist.
// ==============================================================================
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as cronGet, POST as cronPost } from "@/app/api/cron/dispatch-outbox/route";

const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET;

describe("GET /api/cron/dispatch-outbox (Vercel Cron entry point)", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret-value";
  });
  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_CRON_SECRET;
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await cronGet(new NextRequest("http://localhost:3000/api/cron/dispatch-outbox"));
    expect(res.status).toBe(401);
  });

  it("rejects a request with the wrong bearer token", async () => {
    const res = await cronGet(
      new NextRequest("http://localhost:3000/api/cron/dispatch-outbox", {
        headers: { authorization: "Bearer wrong-value" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("accepts a request bearing the configured CRON_SECRET and dispatches", async () => {
    const res = await cronGet(
      new NextRequest("http://localhost:3000/api/cron/dispatch-outbox", {
        headers: { authorization: "Bearer test-cron-secret-value" },
      })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("is unreachable (always 401) when CRON_SECRET is not configured, even with any header value", async () => {
    delete process.env.CRON_SECRET;
    const res = await cronGet(
      new NextRequest("http://localhost:3000/api/cron/dispatch-outbox", {
        headers: { authorization: "Bearer anything" },
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /api/cron/dispatch-outbox (manual/staff trigger)", () => {
  it("rejects an unauthenticated, unkeyed request", async () => {
    const res = await cronPost(new NextRequest("http://localhost:3000/api/cron/dispatch-outbox", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});
