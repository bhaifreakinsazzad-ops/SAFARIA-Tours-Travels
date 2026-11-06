export const SAFARIA_CONFIG = Object.freeze({
  siteUrl: "https://safaria.vibing.world",
  whatsappNumber: "8801674178437",
  agencyMonthlyBdt: 5999,
  agencyAnnualBdt: 69999,
  trialHours: 72,
});

export const AGENCY_PRICING = Object.freeze({
  monthly: SAFARIA_CONFIG.agencyMonthlyBdt,
  annual: SAFARIA_CONFIG.agencyAnnualBdt,
  annualSavings: SAFARIA_CONFIG.agencyMonthlyBdt * 12 - SAFARIA_CONFIG.agencyAnnualBdt,
});

export function whatsappHrefFor(message: string) {
  return `https://wa.me/${SAFARIA_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
