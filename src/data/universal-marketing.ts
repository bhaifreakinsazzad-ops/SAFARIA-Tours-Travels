/**
 * SAFARIA universal-offer conversion messages, normalized from the owner's
 * handwritten campaign notes (2026-11-14).
 *
 * Marketing claims are enquiry-only. Do not introduce fare guarantees,
 * supplier affiliations, 24/7 SLAs or commission superlatives here without
 * written commercial validation.
 *
 * Entries link to existing offer IDs in src/data/offers.json, not new offers.
 */
export type UniversalLocale = "bn" | "en";

export type LocalizedMessage = Readonly<Record<UniversalLocale, string>>;

export interface UniversalBenefit {
  id: string;
  offerId: string;
  title: LocalizedMessage;
  description: LocalizedMessage;
}

export interface SpecialistCampaign {
  id: string;
  offerId: string;
  label: LocalizedMessage;
  title: LocalizedMessage;
  description: LocalizedMessage;
}

export const UNIVERSAL_BENEFITS: readonly UniversalBenefit[] = [
  {
    id: "fare-choices",
    offerId: "fare-options",
    title: { bn: "উপযুক্ত ফেয়ার খুঁজুন", en: "Explore the right fare" },
    description: {
      bn: "রুট, ট্রানজিট, ব্যাগেজ ও শর্ত মিলিয়ে ফেয়ার অপশন যাচাই করুন।",
      en: "Compare route, transit, baggage and fare conditions before deciding.",
    },
  },
  {
    id: "clear-charges",
    offerId: "transparent-pricing",
    title: { bn: "চার্জ আগে জানুন", en: "Know the charges first" },
    description: {
      bn: "ভাড়া, কর ও প্রযোজ্য সার্ভিস ফি সম্পর্কে কোটেশন চান।",
      en: "Request a breakdown of fares, taxes and applicable service fees.",
    },
  },
  {
    id: "changes-refunds",
    offerId: "refund",
    title: { bn: "Refund · Re-Issue · Void", en: "Refund · Reissue · Void" },
    description: {
      bn: "পরিবর্তন বা রিফান্ডের সম্ভাব্য খরচ ও নিয়ম আগে জেনে নিন।",
      en: "Understand change and refund rules, eligibility and possible costs.",
    },
  },
  {
    id: "aftercare",
    offerId: "after-sales",
    title: { bn: "বুকিং-পরবর্তী সহায়তা", en: "After-sales assistance" },
    description: {
      bn: "টিকিট-পরবর্তী প্রয়োজন বা ফলো-আপের জন্য অনুরোধ জানান।",
      en: "Send a post-booking support or follow-up enquiry.",
    },
  },
];

export const SPECIALIST_CAMPAIGNS: readonly SpecialistCampaign[] = [
  {
    id: "student-malaysia",
    offerId: "malaysia-student",
    label: { bn: "STUDENT TRAVEL", en: "STUDENT TRAVEL" },
    title: { bn: "মালয়েশিয়ায় পড়তে যাচ্ছেন?", en: "Studying in Malaysia?" },
    description: {
      bn: "প্রযোজ্য স্টুডেন্ট ফেয়ার ও ব্যাগেজ সুবিধার যোগ্যতা যাচাই করুন।",
      en: "Enquire about eligible student fares and baggage conditions.",
    },
  },
  {
    id: "student-china-southern",
    offerId: "china-southern",
    label: { bn: "EXTRA BAGGAGE CHECK", en: "EXTRA BAGGAGE CHECK" },
    title: { bn: "চীনগামী শিক্ষার্থীদের জন্য", en: "For China-bound students" },
    description: {
      bn: "China Southern-এর যোগ্য রুট ও ফেয়ারে বাড়তি ব্যাগেজ প্রযোজ্য কি না জানুন।",
      en: "Check China Southern student baggage eligibility by route and fare.",
    },
  },
  {
    id: "salamair",
    offerId: "salamair",
    label: { bn: "AIRLINE FARE CHECK", en: "AIRLINE FARE CHECK" },
    title: { bn: "SalamAir ফেয়ার যাচাই", en: "Explore SalamAir fares" },
    description: {
      bn: "উপলব্ধ রুট, ট্রানজিট ও ব্যাগেজ শর্ত সম্পর্কে জেনে নিন।",
      en: "Ask about available itineraries, transit and baggage conditions.",
    },
  },
  {
    id: "premium-cabin",
    offerId: "business-class",
    label: { bn: "PREMIUM TRAVEL", en: "PREMIUM TRAVEL" },
    title: { bn: "Business Class কোটেশন", en: "Business Class enquiries" },
    description: {
      bn: "পছন্দের এয়ারলাইনে উপলব্ধ প্রিমিয়াম ক্যাবিন অপশন যাচাই করুন।",
      en: "Explore premium-cabin options with your preferred airline.",
    },
  },
];

export const UNIVERSAL_DISCLOSURE: LocalizedMessage = {
  bn: "সব ফেয়ার, ব্যাগেজ, পরিবর্তন ও রিফান্ড সুবিধা রুট, টিকিটের নিয়ম, যোগ্যতা এবং এয়ারলাইন বা সরবরাহকারীর নিশ্চিতকরণ সাপেক্ষে। অনুরোধ করা মানেই বুকিং নিশ্চিত নয়।",
  en: "Fares, baggage benefits, changes and refunds depend on route, ticket rules, eligibility and airline or supplier confirmation. An enquiry is not a confirmed booking.",
};
