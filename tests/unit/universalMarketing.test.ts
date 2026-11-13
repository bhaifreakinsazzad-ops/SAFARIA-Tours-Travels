import { describe, expect, it } from "vitest";
import { offers } from "../../src/data/catalog";
import {
  SPECIALIST_CAMPAIGNS,
  UNIVERSAL_BENEFITS,
  UNIVERSAL_DISCLOSURE,
} from "../../src/data/universal-marketing";

describe("universal handwritten-offers marketing mapping", () => {
  it("maps all homepage campaign buttons to an existing offer without catalog duplication", () => {
    const ids = new Set(offers.map((offer) => offer.id));
    expect(offers.length).toBeGreaterThanOrEqual(26);
    expect(ids.size).toBe(offers.length);
    for (const campaign of [...UNIVERSAL_BENEFITS, ...SPECIALIST_CAMPAIGNS]) {
      expect(ids.has(campaign.offerId), campaign.id).toBe(true);
    }
    expect(UNIVERSAL_BENEFITS).toHaveLength(4);
    expect(SPECIALIST_CAMPAIGNS).toHaveLength(4);
  });

  it("provides substantial English and Bengali copy for each campaign", () => {
    for (const campaign of [...UNIVERSAL_BENEFITS, ...SPECIALIST_CAMPAIGNS]) {
      expect(campaign.title.bn.trim().length).toBeGreaterThan(4);
      expect(campaign.title.en.trim().length).toBeGreaterThan(4);
      expect(campaign.description.bn.trim().length).toBeGreaterThan(12);
      expect(campaign.description.en.trim().length).toBeGreaterThan(12);
    }
    expect(UNIVERSAL_DISCLOSURE.bn).toContain("নিশ্চিতকরণ");
    expect(UNIVERSAL_DISCLOSURE.en).toContain("confirmation");
  });

  it("does not publish unverified highest-commission, 24/7 or remittance guarantees", () => {
    const messages = JSON.stringify({ UNIVERSAL_BENEFITS, SPECIALIST_CAMPAIGNS });
    expect(messages).not.toMatch(/highest commission|24\s*\/\s*7|remittance offer/i);
    expect(messages).not.toMatch(/সর্বোচ্চ কমিশন|২৪\s*\/\s*৭|রেমিট্যান্স অফার/);
  });
});
