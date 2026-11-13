import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

describe("SAFARIA pre-supplier GTM marketing safety", () => {
  const b2b = readSource("../../src/components/b2b-landing-client.tsx");
  const agency = readSource("../../src/components/agency-portal.tsx");
  const hub = readSource("../../src/components/b2b-three-hub.tsx");

  it("does not publish unverified partner testimonials or implied five-star proof", () => {
    expect(b2b).not.toContain("TESTIMONIALS");
    expect(b2b).not.toMatch(/<Star\b/);
    expect(b2b).toContain("PARTNERSHIP LAUNCH STATUS");
  });

  it("frames B2B intake as pre-registration and proposed membership", () => {
    expect(b2b).toContain("supplier agreements are being negotiated");
    expect(b2b).toContain("A 72-hour workflow demo is subject to approval");
    expect(agency).toContain("Proposed agency plan");
    expect(agency).toContain("Illustrative arithmetic only");
  });

  it("does not promise unsupported quotes, airline seat blocks or agency margins", () => {
    expect(hub).not.toContain("Avg Sub-Agent Yield");
    expect(hub).not.toContain("12-minute verified wholesale net quotes");
    expect(agency).not.toContain("12-Min Net Quote SLA");
    expect(agency).not.toContain("Avg Margin +");
  });

  it("limits staffed 24/7 support to contact and follow-up", () => {
    expect(b2b).toContain("staffed 24/7 support");
    expect(b2b).toContain("depend on provider rules");
    expect(agency).toContain("airline quotes require supplier confirmation");
  });
});
