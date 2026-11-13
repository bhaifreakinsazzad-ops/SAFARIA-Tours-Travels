import type { OfferCategory } from "@/data/catalog";

export interface MarketingMediaAsset {
  id: string;
  src: string;
  altBn: string;
  altEn: string;
  objectPosition?: string;
  captionBn: string;
  captionEn: string;
  badgeBn: string;
  badgeEn: string;
}

export const OFFER_CATEGORY_MEDIA: Record<OfferCategory, MarketingMediaAsset> = {
  flights: {
    id: "W03",
    src: "/marketing/offers/offer-flights.jpg",
    altBn: "বিমানবন্দরের বোর্ডিং গেটে প্রস্থানের প্রস্তুতি নিচ্ছেন বাংলাদেশি পরিবার ও ভ্রমণকারীরা",
    altEn: "South Asian travelers and family preparing at an international departure gate at dusk",
    objectPosition: "center 35%",
    captionBn: "ক্যাথে প্যাসিফিক, ইউএস-বাংলা, চায়না সাউদার্ন ও মালয়েশিয়া এয়ারলাইন্সের যাচাইকৃত ফেয়ার",
    captionEn: "Verified carrier programs across Cathay Pacific, US-Bangla, China Southern & Malaysia Airlines",
    badgeBn: "এয়ারলাইন ও রুট ডেস্ক",
    badgeEn: "AIRLINE & ROUTE DESK",
  },
  student: {
    id: "W04",
    src: "/marketing/offers/offer-student.jpg",
    altBn: "আন্তর্জাতিক যাত্রার জন্য বিমানবন্দরে প্রস্তুত বাংলাদেশি শিক্ষার্থী",
    altEn: "Bangladeshi university student at an international airport concourse preparing for study abroad",
    objectPosition: "center 30%",
    captionBn: "যুক্তরাজ্য, কানাডা, অস্ট্রেলিয়া, চীন ও মালয়েশিয়াগামী শিক্ষার্থীদের অতিরিক্ত লাগেজ ও স্টুডেন্ট ফেয়ার",
    captionEn: "Extra baggage allowance & verified student fare pathways for UK, Canada, Australia & Malaysia",
    badgeBn: "স্টুডেন্ট মোবিলিটি ডেস্ক",
    badgeEn: "STUDENT MOBILITY DESK",
  },
  saudi: {
    id: "W05",
    src: "/marketing/offers/offer-saudi.jpg",
    altBn: "সৌদি আরব ও ওমরাহ যাত্রার জন্য প্রস্তুত প্রবাসী ও পরিবার",
    altEn: "Bangladeshi family and travelers at an international departure lounge for Saudi Arabia routes",
    objectPosition: "center 35%",
    captionBn: "জেদ্দা, রিয়াদ, মদিনা ও দাম্মাম রুটে ওমরাহ, ফ্যামিলি ভিজিট ও প্রবাসী গ্রুপ কোটেশন",
    captionEn: "Dedicated Jeddah, Riyadh, Madinah & Dammam Umrah, family visit, and workforce group desk",
    badgeBn: "সৌদি ও ওমরাহ করিডোর",
    badgeEn: "SAUDI & UMRAH CORRIDOR",
  },
  premium: {
    id: "W06",
    src: "/marketing/offers/offer-premium.jpg",
    altBn: "প্রিমিয়াম এয়ারপোর্ট লাউঞ্জে বিশ্রামরত এক্সিকিউটিভ ভ্রমণকারী",
    altEn: "Executive traveler relaxing in a luxury airport lounge with champagne-gold ambient lighting",
    objectPosition: "center 40%",
    captionBn: "বিজনেস ক্লাস কেবিন, কর্পোরেট ট্রাভেল ও কমপ্লিমেন্টারি ট্রানজিট হোটেল সহায়তা",
    captionEn: "Business class cabins, executive itineraries, and complimentary transit hotel eligibility",
    badgeBn: "প্রিমিয়াম ও ট্রানজিট লাউঞ্জ",
    badgeEn: "PREMIUM & TRANSIT LOUNGE",
  },
  care: {
    id: "W07",
    src: "/marketing/offers/offer-care.jpg",
    altBn: "বয়স্ক ও বিশেষ যত্নশীল যাত্রীর জন্য বিমানবন্দরে নিবেদিত সহায়তা",
    altEn: "Respectful airport assistance and medical travel support for a senior South Asian passenger",
    objectPosition: "center 35%",
    captionBn: "ব্যাংকক, সিঙ্গাপুর ও চেন্নাই মেডিকেল রুট, হুইলচেয়ার এবং সিনিয়র সিটিজেন ট্রাভেল কেয়ার",
    captionEn: "Medical corridors, wheelchair coordination, and senior citizen fare support with human care",
    badgeBn: "মেডিকেল ও সিনিয়র কেয়ার",
    badgeEn: "MEDICAL & SENIOR CARE",
  },
  services: {
    id: "W08",
    src: "/marketing/offers/offer-services.jpg",
    altBn: "পাসপোর্ট, ভিসা ডকুমেন্টেশন ও কনসিয়ার্জ ট্রাভেল ডেস্ক",
    altEn: "Concierge travel documentation desk with emerald leather passport folio and itinerary review",
    objectPosition: "center 45%",
    captionBn: "ভিসা প্রসেসিং, ট্রাভেল ইনস্যুরেন্স, কাস্টমাইজড ট্যুর প্যাকেজ ও মিট-অ্যান্ড-গ্রিট সাপোর্ট",
    captionEn: "Visa documentation review, travel insurance, custom holiday packages & VIP airport meet-and-greet",
    badgeBn: "ভিসা ও কনসিয়ার্জ সার্ভিস",
    badgeEn: "VISA & CONCIERGE SERVICES",
  },
};

export const DESTINATION_MEDIA_PRESETS: Record<
  "cxb" | "zyl" | "saudi" | "hub",
  MarketingMediaAsset
> = {
  cxb: {
    id: "W09",
    src: "/marketing/destinations/cxb.jpg",
    altBn: "কক্সবাজারের সমুদ্রসৈকত ও সোনালি সূর্যাস্তের দৃশ্য",
    altEn: "Boutique coastal terrace overlooking Cox's Bazar beach at golden sunset",
    objectPosition: "center 45%",
    captionBn: "কক্সবাজার ও উপকূলীয় রিসোর্ট গেটওয়ে",
    captionEn: "Cox's Bazar & Coastal Resort Corridor",
    badgeBn: "ডোমেস্টিক কোস্টাল রুট",
    badgeEn: "DOMESTIC COASTAL ROUTE",
  },
  zyl: {
    id: "W10",
    src: "/marketing/destinations/zyl.jpg",
    altBn: "সিলেট ও শ্রীমঙ্গলের সবুজ চা-বাগান ও ভোরের কুয়াশা",
    altEn: "Rolling emerald tea gardens in Sylhet and Sreemangal at dawn",
    objectPosition: "center 40%",
    captionBn: "সিলেট ও হাইল্যান্ড ইকো-রিসোর্ট রুট",
    captionEn: "Sylhet Tea Estates & Highland Retreat",
    badgeBn: "ডোমেস্টিক হাইল্যান্ড রুট",
    badgeEn: "DOMESTIC HIGHLAND ROUTE",
  },
  saudi: {
    id: "W11",
    src: "/marketing/destinations/saudi.jpg",
    altBn: "সৌদি আরবের আধুনিক স্থাপত্য ও সন্ধ্যাবেলার স্কাইলাইন",
    altEn: "Contemporary Saudi Arabian skyline and sandstone boulevard at golden twilight",
    objectPosition: "center 40%",
    captionBn: "জেদ্দা, রিয়াদ, মদিনা ও দাম্মাম ডিরেক্ট ও কানেক্টিং রুট",
    captionEn: "Jeddah, Riyadh, Madinah & Dammam Corridor",
    badgeBn: "সৌদি ও মধ্যপ্রাচ্য করিডোর",
    badgeEn: "SAUDI & GULF CORRIDOR",
  },
  hub: {
    id: "W12",
    src: "/marketing/destinations/hub.jpg",
    altBn: "আন্তর্জাতিক ট্রানজিট হাব ও আধুনিক শহরের রাতের দৃশ্য",
    altEn: "Twilight skyline of an international aviation hub with emerald water reflections",
    objectPosition: "center 45%",
    captionBn: "আন্তর্জাতিক ট্রানজিট হাব ও লং-হল নেটওয়ার্ক",
    captionEn: "Global Transit Hub & Long-Haul Network",
    badgeBn: "গ্লোবাল এভিয়েশন হাব",
    badgeEn: "GLOBAL AVIATION HUB",
  },
};

const SAUDI_GULF_CODES = new Set([
  "JED",
  "RUH",
  "MED",
  "DMM",
  "DXB",
  "DOH",
  "MCT",
  "AUH",
  "KWI",
  "BAH",
]);

const DOMESTIC_COASTAL_CODES = new Set(["CXB", "CGP", "BZL"]);
const DOMESTIC_HIGHLAND_CODES = new Set(["ZYL", "SPD", "RJH", "JSR"]);

export function getDestinationMedia(
  code: string,
  country?: string,
  category?: string
): MarketingMediaAsset {
  const normalizedCode = code.toUpperCase();
  if (DOMESTIC_COASTAL_CODES.has(normalizedCode)) {
    return DESTINATION_MEDIA_PRESETS.cxb;
  }
  if (DOMESTIC_HIGHLAND_CODES.has(normalizedCode)) {
    return DESTINATION_MEDIA_PRESETS.zyl;
  }
  if (
    country === "Saudi Arabia" ||
    normalizedCode === "JED" ||
    normalizedCode === "RUH" ||
    normalizedCode === "MED" ||
    normalizedCode === "DMM"
  ) {
    return DESTINATION_MEDIA_PRESETS.saudi;
  }
  if (category === "Domestic" || country === "Bangladesh") {
    return DESTINATION_MEDIA_PRESETS.zyl;
  }
  if (SAUDI_GULF_CODES.has(normalizedCode)) {
    return DESTINATION_MEDIA_PRESETS.hub;
  }
  return DESTINATION_MEDIA_PRESETS.hub;
}

export const STUDIO_AND_B2B_MEDIA = {
  travelStudio: {
    id: "W13",
    src: "/marketing/web/travel-studio.jpg",
    altBn: "সাফারিয়ার ট্রাভেল স্টুডিওতে পাসপোর্ট ফোলিও ও রুট প্ল্যানিং ডেস্ক",
    altEn: "SAFARIA Travel Studio bespoke planning table with emerald leather passport folio and brass compass",
    objectPosition: "center center",
    captionBn: "ট্রাভেল স্টুডিও — ফ্লাইট, হোটেল ও ভিসা কনসিয়ার্জ প্ল্যানিং",
    captionEn: "Travel Studio — Bespoke Flight, Hotel & Visa Concierge Planning",
    badgeBn: "ট্রাভেল স্টুডিও কনসিয়ার্জ",
    badgeEn: "TRAVEL STUDIO CONCIERGE",
  },
  b2bHero: {
    id: "W14",
    src: "/marketing/web/b2b-hero.jpg",
    altBn: "ঢাকায় সাফারিয়ার বি২বি এজেন্সি অপারেশনস ডেস্কে মাল্টি-রুট কোটেশন পর্যালোচনা",
    altEn: "SAFARIA B2B travel agency operations desk in Dhaka reviewing multi-route flight schedules and supplier quotations",
    objectPosition: "center 35%",
    captionBn: "বি২বি এজেন্সি কন্ট্রোল ডেস্ক — গ্রুপ পিএনআর, সৌদি ওমরাহ ব্লক ও স্টুডেন্ট ফেয়ার সোর্সিং",
    captionEn: "B2B Agency Control Desk — Group PNR, Saudi Umrah Blocks & Student Fare Sourcing",
    badgeBn: "বি২বি এজেন্সি কন্ট্রোল ডেস্ক",
    badgeEn: "B2B AGENCY CONTROL DESK",
  },
} as const;
