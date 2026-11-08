import { describe, it, expect } from "vitest";
import { generateReferenceCode, validateReferenceFormat } from "@/lib/utils/referenceGenerator";

describe("Reference Generator", () => {
  it("should generate valid SFR flight quotation reference format", () => {
    const ref = generateReferenceCode("SFR");
    expect(ref).toMatch(/^SFR-\d{8}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(validateReferenceFormat(ref, "SFR")).toBe(true);
  });

  it("should generate valid B2B agency reference format", () => {
    const ref = generateReferenceCode("B2B");
    expect(ref).toMatch(/^B2B-\d{8}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    expect(validateReferenceFormat(ref, "B2B")).toBe(true);
  });

  it("should produce unique codes across 1,000 iterations without collisions", () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const code = generateReferenceCode("SFR");
      expect(set.has(code)).toBe(false);
      set.add(code);
    }
    expect(set.size).toBe(1000);
  });

  it("should correctly validate date stamp segment", () => {
    const fixedDate = new Date("2026-12-25T10:00:00Z");
    const code = generateReferenceCode("SFR", fixedDate);
    expect(code).toContain("20261225");
  });
});
