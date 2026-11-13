export const SAFARIA_CONFIG = Object.freeze({
  siteUrl: "https://safaria.vibing.world",
  whatsappNumber: "8801674178437",
  agencyMonthlyBdt: 5999,
  agencyAnnualBdt: 69999,
  trialHours: 72,
  defaultStaffEmail: "ops@safaria.vibing.world",
});

export const AGENCY_PRICING = Object.freeze({
  monthly: SAFARIA_CONFIG.agencyMonthlyBdt,
  annual: SAFARIA_CONFIG.agencyAnnualBdt,
  annualSavings: SAFARIA_CONFIG.agencyMonthlyBdt * 12 - SAFARIA_CONFIG.agencyAnnualBdt,
});

export const PILOT_ENTITLEMENTS = Object.freeze({
  fareRequestsLimit: 20,
  bookingRequestsLimit: 8,
  afterCareLimit: 2,
  seatsLimit: 2,
});

export const PAID_ENTITLEMENTS = Object.freeze({
  fareRequestsLimit: 200,
  bookingRequestsLimit: 100,
  afterCareLimit: 50,
  seatsLimit: 10,
});

export function whatsappHrefFor(message: string) {
  return `https://wa.me/${SAFARIA_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export interface B2BWhatsAppParams {
  reference: string;
  agencyName: string;
  contactName: string;
  district: string;
  painCategory: string;
  plan: string;
}

export function buildStructuredB2BWhatsAppUrl(params: B2BWhatsAppParams): string {
  const body = [
    "SAFARIA B2B ENQUIRY",
    `Ref: ${params.reference}`,
    `Agency: ${params.agencyName}`,
    `Contact: ${params.contactName}`,
    `District: ${params.district}`,
    `Need: ${params.painCategory}`,
    `Interested plan: ${params.plan}`,
    "Request: Please share the next steps for agency partnership.",
  ].join("\n");

  return whatsappHrefFor(body);
}

