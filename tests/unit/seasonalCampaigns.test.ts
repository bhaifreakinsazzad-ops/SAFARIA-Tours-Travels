import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { offers } from "../../src/data/catalog";
import {
  SEASONAL_CAMPAIGNS,
  SEASONAL_CAMPAIGN_STATUS,
  SEASONAL_DISCLOSURE,
  getSeasonalCampaigns,
} from "../../src/data/seasonal-campaigns";

describe("seasonal campaign landing contract", () => {
  it("preserves the source as an enquiry-only seasonal planning page", () => {
    expect(SEASONAL_CAMPAIGN_STATUS).toBe("ENQUIRY_ONLY");
    expect(SEASONAL_DISCLOSURE.en).toContain("does not advertise confirmed seasonal discounts");
    expect(SEASONAL_DISCLOSURE.bn).toContain("নিশ্চিত মূল্যছাড়");
    expect(getSeasonalCampaigns("b2c")).toHaveLength(4);
    expect(getSeasonalCampaigns("b2b")).toHaveLength(4);
  });

  it("links B2C themes exclusively to existing catalog offers", () => {
    const ids = new Set(offers.map((offer) => offer.id));
    for (const campaign of getSeasonalCampaigns("b2c")) {
      if (!campaign.existingOfferId) throw new Error(`Missing existing offer mapping: ${campaign.id}`);
      expect(ids.has(campaign.existingOfferId), campaign.id).toBe(true);
    }
    for (const campaign of getSeasonalCampaigns("b2b")) {
      expect(campaign.existingOfferId).toBeUndefined();
    }
  });

  it("does not invent season-specific prices, dates or airline benefits", () => {
    const messages = JSON.stringify(SEASONAL_CAMPAIGNS);
    expect(messages).not.toMatch(/guaranteed ticket|guaranteed refund|highest commission|special fare from|free domain|free hosting/i);
    expect(messages).not.toMatch(/সর্বোচ্চ কমিশন|ফ্রি ডোমেইন|নিশ্চিত ডিসকাউন্ট/);
    expect(SEASONAL_CAMPAIGNS.map((c) => c.id).length).toBe(new Set(SEASONAL_CAMPAIGNS.map((c) => c.id)).size);
  });

  it("includes distinct Bengali and English copy with shipping image assets", () => {
    for (const campaign of SEASONAL_CAMPAIGNS) {
      for (const lang of ["bn", "en"] as const) {
        expect(campaign.title[lang].length).toBeGreaterThan(6);
        expect(campaign.description[lang].length).toBeGreaterThan(15);
        expect(campaign.cta[lang].length).toBeGreaterThan(4);
      }
      expect(existsSync(path.join(process.cwd(), "public", campaign.imageSrc.slice(1))), campaign.imageSrc).toBe(true);
    }
  });

  it("links the page from home and preserves the original enquiry dialog", () => {
    const seasonal = readFileSync(path.join(process.cwd(), "src/components/seasonal-landing-client.tsx"), "utf8");
    const universal = readFileSync(path.join(process.cwd(), "src/components/universal-offers-strip.tsx"), "utf8");
    const sitemap = readFileSync(path.join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(seasonal).toContain("<RouteEnquiryDialog");
    expect(seasonal).toContain('role="group"');
    expect(seasonal).toContain("data-campaign-id");
    expect(universal).toContain('href="/seasonal"');
    expect(sitemap).toContain("/seasonal");
  });
});
