// ==============================================================================
// Regression coverage: public unauthenticated API routes previously had no
// request body size limit at all (Next.js Route Handlers impose none by
// default), an unmitigated DoS vector the master directive explicitly asked
// to verify ("request-size limits").
// ==============================================================================
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { readJsonBodyGuarded, PayloadTooLargeError } from "@server/utils/requestGuards";

function jsonRequest(payload: unknown) {
  return new NextRequest("http://localhost:3000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("readJsonBodyGuarded", () => {
  it("parses a normal-sized payload without issue", async () => {
    const req = jsonRequest({ hello: "world" });
    const body = await readJsonBodyGuarded<{ hello: string }>(req, 1_000);
    expect(body.hello).toBe("world");
  });

  it("rejects a payload whose Content-Length already exceeds the limit", async () => {
    const req = jsonRequest({ notes: "x".repeat(5_000) });
    await expect(readJsonBodyGuarded(req, 1_000)).rejects.toThrow(PayloadTooLargeError);
  });
});
