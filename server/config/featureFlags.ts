// ==============================================================================
// SAFARIA Tours & Travels — Strict Feature Flags & Safety Gates
// Live financial, live GDS ticketing, live settlement, and automated trials
// are strictly DISABLED by default until commercial accreditation is authorized.
// ==============================================================================

export interface FeatureFlags {
  enableLivePaymentGateway: boolean;
  enableLiveGdsTicketing: boolean;
  enableAutoTrialActivation: boolean;
  enableLiveRadarTelemetry: boolean;
  enableWhatsAppDeepLink: boolean;
  enableCrmSync: boolean;
  isStagingEnvironment: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  // Live financial transactions strictly OFF
  enableLivePaymentGateway: process.env.ENABLE_LIVE_PAYMENTS === "true",
  
  // Live GDS / IATA direct issuance strictly OFF
  enableLiveGdsTicketing: process.env.ENABLE_LIVE_GDS_TICKETING === "true",

  // 72h Agency trials require manual agent verification & approval
  enableAutoTrialActivation: false,

  // Flight radar displays truthful telemetry status (staged/disclaimed)
  enableLiveRadarTelemetry: false,

  // WhatsApp deep link quotation follow-up is active
  enableWhatsAppDeepLink: true,

  // GoHighLevel CRM sync enabled (uses fallback queue if credentials unset)
  enableCrmSync: true,

  // Environment mode
  isStagingEnvironment: process.env.NODE_ENV !== "production",
};
