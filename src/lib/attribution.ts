/**
 * Pure URL & campaign attribution utilities (non-PII only).
 * Preserves UTM context across /seasonal -> /b2b navigation without polluting
 * canonical URLs or transmitting personal data in query strings.
 */

export const ALLOWED_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type AttributionParams = Partial<Record<(typeof ALLOWED_ATTRIBUTION_KEYS)[number] | "campaign", string>>;

export function extractAttributionParams(search: string): AttributionParams {
  if (!search) return {};
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const result: AttributionParams = {};
  for (const key of ALLOWED_ATTRIBUTION_KEYS) {
    const val = params.get(key)?.trim();
    if (val && val.length <= 120) {
      result[key] = val;
    }
  }
  const campaign = params.get("campaign")?.trim();
  if (campaign && /^[a-z0-9_-]{2,64}$/i.test(campaign)) {
    result.campaign = campaign;
  }
  return result;
}

export function buildB2BAttributionHref(
  attribution: AttributionParams,
  campaignId?: string,
  hash = "#b2b-subscription-enquiry"
): string {
  const params = new URLSearchParams();
  for (const key of ALLOWED_ATTRIBUTION_KEYS) {
    const val = attribution[key];
    if (val) params.set(key, val);
  }
  const effectiveCampaign = campaignId || attribution.campaign;
  if (effectiveCampaign && /^[a-z0-9_-]{2,64}$/i.test(effectiveCampaign)) {
    params.set("campaign", effectiveCampaign);
  }
  const qs = params.toString();
  return qs ? `/b2b?${qs}${hash}` : `/b2b${hash}`;
}
