/**
 * SAFARIA seasonal landing campaign registry.
 *
 * Source: second handwritten "SEASONAL" note supplied on 2026-11-14.
 * The note describes a landing page, interactive and mobile-responsive
 * presentation, a possible free custom domain, and hosting. It contains
 * NO named seasonal fares, dates or promotional discounts.
 *
 * The themes below are editorial enquiry categories mapped to existing
 * catalogue offerings / B2B preregistration. They are NOT supplier deals.
 *
 * Commercial state: enquiry only. Supplier contracts under negotiation.
 */
export type SeasonalAudience = "b2c" | "b2b";
export type SeasonalLocale = "bn" | "en";
export type SeasonalCopy = Readonly<Record<SeasonalLocale, string>>;

export interface SeasonalCampaign {
  id: string;
  audience: SeasonalAudience;
  existingOfferId?: string;
  imageSrc: string;
  imageAlt: SeasonalCopy;
  label: SeasonalCopy;
  title: SeasonalCopy;
  description: SeasonalCopy;
  cta: SeasonalCopy;
}

export const SEASONAL_CAMPAIGN_STATUS = "ENQUIRY_ONLY" as const;

export const SEASONAL_CAMPAIGNS: readonly SeasonalCampaign[] = [
  {
    id: "seasonal-domestic",
    audience: "b2c",
    existingOfferId: "domestic",
    imageSrc: "/marketing/destinations/cxb.jpg",
    imageAlt: {
      bn: "কক্সবাজার উপকূলের সূর্যাস্তের দৃশ্য",
      en: "Golden-hour view of the Cox's Bazar coastline",
    },
    label: { bn: "দেশের ভেতরে ভ্রমণ", en: "DOMESTIC PLANNING" },
    title: { bn: "ছুটির গন্তব্য ঠিক করেছেন?", en: "Planning a getaway closer to home?" },
    description: {
      bn: "দেশীয় রুটে সম্ভাব্য ফ্লাইট ও ভ্রমণের কোটেশন অনুরোধ করুন। ভাড়া ও সিট নিশ্চিতকরণসাপেক্ষ।",
      en: "Request domestic route and travel quotations. Fares and seats require supplier confirmation.",
    },
    cta: { bn: "ডোমেস্টিক কোটেশন", en: "Request domestic quote" },
  },
  {
    id: "seasonal-saudi",
    audience: "b2c",
    existingOfferId: "saudi-cities",
    imageSrc: "/marketing/destinations/saudi.jpg",
    imageAlt: {
      bn: "সৌদি আরবের শহরের আধুনিক দৃশ্য",
      en: "Modern Saudi cityscape at twilight",
    },
    label: { bn: "সৌদি ও প্রবাসী রুট", en: "SAUDI & EXPAT ROUTES" },
    title: { bn: "সৌদি রুটে পরের যাত্রা?", en: "Your next Saudi travel enquiry" },
    description: {
      bn: "জেদ্দা, রিয়াদ, মদিনা বা দাম্মাম রুটে যাত্রার শর্ত ও ফেয়ার বিকল্প জানতে চান।",
      en: "Enquire about possible routes and fare conditions for Jeddah, Riyadh, Madinah or Dammam.",
    },
    cta: { bn: "সৌদি রুট জানুন", en: "Explore Saudi routes" },
  },
  {
    id: "seasonal-student",
    audience: "b2c",
    existingOfferId: "student",
    imageSrc: "/marketing/offers/offer-student.jpg",
    imageAlt: {
      bn: "আন্তর্জাতিক যাত্রার প্রস্তুতি নিচ্ছেন বাংলাদেশি শিক্ষার্থী",
      en: "Bangladeshi student preparing for international travel",
    },
    label: { bn: "স্টুডেন্ট ট্রাভেল", en: "STUDENT TRAVEL" },
    title: { bn: "নতুন সেমিস্টার, নতুন যাত্রা", en: "New semester. New journey." },
    description: {
      bn: "যোগ্য স্টুডেন্ট ফেয়ার ও ব্যাগেজ নিয়ম রুট ও টিকিটের শর্ত অনুযায়ী যাচাই করুন।",
      en: "Check eligibility for student fares and baggage conditions by route and ticket type.",
    },
    cta: { bn: "স্টুডেন্ট ফেয়ার জানুন", en: "Check student options" },
  },
  {
    id: "seasonal-premium",
    audience: "b2c",
    existingOfferId: "business-class",
    imageSrc: "/marketing/offers/offer-premium.jpg",
    imageAlt: {
      bn: "প্রিমিয়াম বিমানবন্দর লাউঞ্জে ভ্রমণকারী",
      en: "Executive traveller in a premium airport lounge",
    },
    label: { bn: "প্রিমিয়াম যাত্রা", en: "PREMIUM TRAVEL" },
    title: { bn: "দীর্ঘ যাত্রায় আরামের পরিকল্পনা", en: "Comfort for the longer journey" },
    description: {
      bn: "পছন্দের এয়ারলাইনে Business Class বিকল্প ও প্রযোজ্য নিয়ম সম্পর্কে কোটেশন চান।",
      en: "Ask about Business Class options and applicable conditions with your preferred airline.",
    },
    cta: { bn: "প্রিমিয়াম কোটেশন", en: "Explore premium options" },
  },
  {
    id: "seasonal-agency-requests",
    audience: "b2b",
    imageSrc: "/marketing/web/b2b-hero.jpg",
    imageAlt: {
      bn: "বাংলাদেশের ট্রাভেল এজেন্সির কর্মীরা রিকোয়েস্ট পর্যালোচনা করছেন",
      en: "Agency operators reviewing travel enquiries at a desk",
    },
    label: { bn: "FareDesk™", en: "FARE REQUEST WORKFLOW" },
    title: { bn: "পিক সিজনে রিকোয়েস্টের চাপ?", en: "Too many requests at peak periods?" },
    description: {
      bn: "SAFARIA FareDesk™-এর সংগঠিত অনুরোধ ও ফলো-আপ ওয়ার্কফ্লোর ডেমো সম্পর্কে জানুন।",
      en: "Explore a structured fare request and follow-up workflow through a SAFARIA desk demo.",
    },
    cta: { bn: "ডেমোতে আগ্রহ জানান", en: "Register demo interest" },
  },
  {
    id: "seasonal-agency-aftercare",
    audience: "b2b",
    imageSrc: "/marketing/offers/offer-care.jpg",
    imageAlt: {
      bn: "যাত্রীকে সহায়তা করছেন একজন ট্রাভেল সাপোর্ট প্রতিনিধি",
      en: "Travel support representative helping a traveller",
    },
    label: { bn: "AfterCare Desk™", en: "24/7 STAFFED CONTACT" },
    title: { bn: "রাতেও ফলো-আপ প্রয়োজন?", en: "Need a contact after hours?" },
    description: {
      bn: "SAFARIA-এর ২৪/৭ সাপোর্ট টিমে অনুরোধ জানান। এয়ারলাইন বা সরবরাহকারীর সিদ্ধান্ত তাদের নিজস্ব নিয়মসাপেক্ষ।",
      en: "Contact SAFARIA's staffed 24/7 team for follow-up. Airline decisions follow provider rules.",
    },
    cta: { bn: "সাপোর্ট ওয়ার্কফ্লো জানুন", en: "Explore support workflow" },
  },
  {
    id: "seasonal-agency-verify",
    audience: "b2b",
    imageSrc: "/marketing/offers/offer-services.jpg",
    imageAlt: {
      bn: "যাত্রার নথি যাচাইয়ের জন্য পাসপোর্ট ফোলিও ও ডেস্ক",
      en: "Travel documents on a desk for preflight review",
    },
    label: { bn: "Verified Workflow™", en: "PASSENGER DATA CHECKS" },
    title: { bn: "নাম ও ডকুমেন্ট আগে যাচাই", en: "Review names and documents first" },
    description: {
      bn: "যাত্রীর তথ্য চেক করার প্রস্তাবিত ওয়ার্কফ্লো দেখুন; ভুল-মুক্ত টিকিটিংয়ের নিশ্চয়তা নয়।",
      en: "Preview a passenger-detail checking workflow; not a guarantee of error-free ticketing.",
    },
    cta: { bn: "ওয়ার্কফ্লো ডেমো", en: "Preview the workflow" },
  },
  {
    id: "seasonal-agency-partner",
    audience: "b2b",
    imageSrc: "/marketing/destinations/hub.jpg",
    imageAlt: {
      bn: "আন্তর্জাতিক ভ্রমণ হাবের রাতের দৃশ্য",
      en: "International travel hub at twilight",
    },
    label: { bn: "PARTNER NETWORK", en: "PARTNER NETWORK" },
    title: { bn: "আগাম পার্টনারশিপ আগ্রহ জানান", en: "Get on the partnership interest list" },
    description: {
      bn: "সাপ্লায়ার চুক্তি আলোচনাধীন। কমিশন ও টিকিটিংয়ের শর্ত লিখিত অনুমোদন সাপেক্ষে নির্ধারিত হবে।",
      en: "Supplier contracts are in negotiation. Commission and ticketing terms require written authorization.",
    },
    cta: { bn: "এজেন্সি প্রি-রেজিস্ট্রেশন", en: "Pre-register your agency" },
  },
];

export const SEASONAL_DISCLOSURE: SeasonalCopy = {
  bn: "এটি সম্ভাব্য ভ্রমণ ও এজেন্সি সেবার কোটেশন/ডেমো অনুরোধের পৃষ্ঠা, নিশ্চিত মূল্যছাড় বা লাইভ টিকিটিং অফার নয়। ভাড়া, সিট, ব্যাগেজ, রিফান্ড ও কমিশন সংশ্লিষ্ট সরবরাহকারী, যোগ্যতা এবং অনুমোদিত লিখিত শর্তসাপেক্ষ।",
  en: "This page collects travel quotation and agency demo enquiries. It does not advertise confirmed seasonal discounts, live ticket inventory or guaranteed commissions. Fares, seats, baggage, refunds and commercial terms require supplier confirmation.",
};

export function getSeasonalCampaigns(audience: SeasonalAudience): SeasonalCampaign[] {
  return SEASONAL_CAMPAIGNS.filter((item) => item.audience === audience);
}
