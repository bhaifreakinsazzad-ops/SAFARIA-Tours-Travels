export type Language = "bn" | "en";

export type AtlasRoute = {
  code: string;
  en: string;
  bn: string;
  lat: number;
  lon: number;
};

// Verified against safaria-data.json supplied 6 November 2026.
// These are enquiry destinations, not advertised nonstop services or inventory.
export const origin: AtlasRoute = { code: "DAC", en: "Dhaka", bn: "ঢাকা", lat: 23.84, lon: 90.4 };

export const routes: readonly AtlasRoute[] = [
  { code: "RUH", en: "Riyadh", bn: "রিয়াদ", lat: 24.96, lon: 46.7 },
  { code: "JED", en: "Jeddah", bn: "জেদ্দা", lat: 21.68, lon: 39.16 },
  { code: "CXB", en: "Cox's Bazar", bn: "কক্সবাজার", lat: 21.45, lon: 91.96 },
  { code: "KUL", en: "Kuala Lumpur", bn: "কুয়ালালামপুর", lat: 2.74, lon: 101.7 },
  { code: "SIN", en: "Singapore", bn: "সিঙ্গাপুর", lat: 1.36, lon: 103.99 },
  { code: "DXB", en: "Dubai", bn: "দুবাই", lat: 25.25, lon: 55.36 },
  { code: "CAN", en: "Guangzhou", bn: "গুয়াংজু", lat: 23.39, lon: 113.3 },
  { code: "LON", en: "London", bn: "লন্ডন", lat: 51.47, lon: -0.45 },
] as const;

export const routeByCode = (code: string) => routes.find((route) => route.code === code);
