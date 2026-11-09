// ==============================================================================
// SAFARIA Tours & Travels — Backend/Admin Site Configuration
// Contact and pricing values are NOT duplicated here — they're derived from
// src/config/constants.ts, the one canonical source this codebase's own
// purge gate (scripts/check-purge.cjs) enforces. This file only adds the
// backend-only content (airports, routes, services, B2B desk copy) that
// doesn't already live in the public frontend's config.
// ==============================================================================

import { SAFARIA_CONFIG, AGENCY_PRICING } from "@/config/constants";

export interface Airport {
  iata: string;
  nameEn: string;
  nameBn: string;
  cityEn: string;
  cityBn: string;
  country: string;
  region: "DOMESTIC" | "MIDDLE_EAST" | "SOUTH_ASIA" | "SOUTHEAST_ASIA" | "EUROPE" | "NORTH_AMERICA";
}

export interface AtlasRoute {
  id: string;
  originIata: string;
  originName: string;
  destIata: string;
  destName: string;
  region: string;
  flightDuration: string;
  frequency: string;
  popularFor: string;
  coordinates: {
    origin: [number, number]; // [lat, lng]
    dest: [number, number];
  };
}

export interface ServiceItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  icon: string;
  badgeEn?: string;
  badgeBn?: string;
}

export const SITE_CONFIG = {
  brand: {
    name: "SAFARIA",
    legalName: "SAFARIA Tours & Travels (Just Another Travel Group)",
    taglineEn: "Your Gateway to Global Travel",
    taglineBn: "সঠিক ফ্লাইটে শুরু হোক যাত্রা।",
    subTaglineBn: "আন্তর্জাতিক ও অভ্যন্তরীণ বিমান টিকেট, দ্রুত কোটেশন ও ডেডিকেটেড সাপোর্ট।",
    subTaglineEn: "Air tickets, visas, hotels and curated tours handled by real travel specialists.",
  },
  contact: {
    // Single source of truth: src/config/constants.ts (this codebase's own
    // purge gate enforces that nothing else hardcodes this value).
    whatsAppDirect: `+${SAFARIA_CONFIG.whatsappNumber}`,
    addressEn: "Dhaka, Bangladesh",
    addressBn: "ঢাকা, বাংলাদেশ",
    hoursEn: "Sat – Thu: 09:00 – 21:00 BST | Urgent Desk: 24/7 on WhatsApp",
    hoursBn: "শনি – বৃহঃ সকাল ৯টা – রাত ৯টা | জরুরি সেবাঃ ২৪/৭ হোয়াটসঅ্যাপ",
  },
  pricing: {
    // Single source of truth: src/config/constants.ts. Still draft/pilot —
    // see docs/DEPLOYMENT_READINESS.md's commercial-terms note.
    b2bMonthlyPriceBdt: AGENCY_PRICING.monthly,
    b2bAnnualPriceBdt: AGENCY_PRICING.annual,
    isPricingDraft: true,
    pricingDisclaimerEn: "B2B SaaS pricing is currently in preview/pilot status. Final subscription fees and volume tier discounts will be formalized upon execution of partner service agreements.",
    pricingDisclaimerBn: "B2B প্ল্যাটফর্মের মূল্য বর্তমানে পাইলট পর্যায়ে রয়েছে। চূড়ান্ত সাবস্ক্রিপশন ফি অংশীদারিত্ব চুক্তির মাধ্যমে কার্যকর হবে।",
  },
  truthfulDisclaimers: {
    quotationNotBookingEn: "Quotation requests are not confirmed flight bookings and do not guarantee fare availability or seat reservations until official e-ticket issuance.",
    quotationNotBookingBn: "কোটেশন অনুরোধ কোনো নিশ্চিত বুকিং বা টিকিট নয়। টিকিট ইস্যু করার পূর্বে এয়ারলাইন্সের আসন এবং ভাড়ার পরিবর্তন হতে পারে।",
    visaDisclaimerEn: "Visa decisions, issuance, and processing timelines are strictly at the sole discretion of the respective embassy or immigration authority.",
    visaDisclaimerBn: "ভিসা প্রদান বা প্রত্যাখ্যানের সম্পূর্ণ সিদ্ধান্ত সংশ্লিষ্ট দূতাবাস ও অভিবাসন কর্তৃপক্ষের এখতিয়ারাধীন।",
    trialDisclaimerEn: "Agency 72-hour trial access requires verified trade credentials and manual administrative review before activation.",
    trialDisclaimerBn: "এজেন্সি ৭২ ঘণ্টার ট্রায়াল সুবিধাটি ট্রেড লাইসেন্স ও প্রশাসনিক যাচাইকরণের পর সক্রিয় করা হয়।",
  },
  airports: [
    // Domestic Bangladesh (8 Airports)
    { iata: "DAC", nameEn: "Hazrat Shahjalal Int'l Airport", nameBn: "হযরত শাহজালাল আন্তর্জাতিক বিমানবন্দর", cityEn: "Dhaka", cityBn: "ঢাকা", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "CGP", nameEn: "Shah Amanat Int'l Airport", nameBn: "শাহ আমানত আন্তর্জাতিক বিমানবন্দর", cityEn: "Chittagong", cityBn: "চট্টগ্রাম", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "ZYL", nameEn: "Osmani Int'l Airport", nameBn: "ওসমানী আন্তর্জাতিক বিমানবন্দর", cityEn: "Sylhet", cityBn: "সিলেট", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "CXB", nameEn: "Cox's Bazar Airport", nameBn: "কক্সবাজার বিমানবন্দর", cityEn: "Cox's Bazar", cityBn: "কক্সবাজার", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "JSR", nameEn: "Jashore Airport", nameBn: "যশোর বিমানবন্দর", cityEn: "Jashore", cityBn: "যশোর", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "RJH", nameEn: "Shah Makhdum Airport", nameBn: "শাহ মখদুম বিমানবন্দর", cityEn: "Rajshahi", cityBn: "রাজশাহী", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "SPD", nameEn: "Saidpur Airport", nameBn: "সৈয়দপুর বিমানবন্দর", cityEn: "Saidpur", cityBn: "সৈয়দপুর", country: "Bangladesh", region: "DOMESTIC" },
    { iata: "BZL", nameEn: "Barishal Airport", nameBn: "বরিশাল বিমানবন্দর", cityEn: "Barishal", cityBn: "বরিশাল", country: "Bangladesh", region: "DOMESTIC" },

    // Middle East Hubs
    { iata: "DXB", nameEn: "Dubai Int'l Airport", nameBn: "দুবাই আন্তর্জাতিক বিমানবন্দর", cityEn: "Dubai", cityBn: "দুবাই", country: "UAE", region: "MIDDLE_EAST" },
    { iata: "DOH", nameEn: "Hamad Int'l Airport", nameBn: "হামাদ আন্তর্জাতিক বিমানবন্দর", cityEn: "Doha", cityBn: "দোহা", country: "Qatar", region: "MIDDLE_EAST" },
    { iata: "JED", nameEn: "King Abdulaziz Int'l Airport", nameBn: "কিং আব্দুলআজিজ আন্তর্জাতিক বিমানবন্দর", cityEn: "Jeddah", cityBn: "জেদ্দা", country: "Saudi Arabia", region: "MIDDLE_EAST" },
    { iata: "MED", nameEn: "Prince Mohammad Bin Abdulaziz Airport", nameBn: "মদিনা বিমানবন্দর", cityEn: "Madinah", cityBn: "মদিনা", country: "Saudi Arabia", region: "MIDDLE_EAST" },
    { iata: "RUH", nameEn: "King Khalid Int'l Airport", nameBn: "কিং খালিদ আন্তর্জাতিক বিমানবন্দর", cityEn: "Riyadh", cityBn: "রিয়াদ", country: "Saudi Arabia", region: "MIDDLE_EAST" },
    { iata: "MCT", nameEn: "Muscat Int'l Airport", nameBn: "মাস্কাট আন্তর্জাতিক বিমানবন্দর", cityEn: "Muscat", cityBn: "মাস্কাট", country: "Oman", region: "MIDDLE_EAST" },
    { iata: "KWI", nameEn: "Kuwait Int'l Airport", nameBn: "কুয়েত আন্তর্জাতিক বিমানবন্দর", cityEn: "Kuwait City", cityBn: "কুয়েত সিটি", country: "Kuwait", region: "MIDDLE_EAST" },

    // South & Southeast Asia
    { iata: "BKK", nameEn: "Suvarnabhumi Airport", nameBn: "সুবর্ণভূমি বিমানবন্দর", cityEn: "Bangkok", cityBn: "ব্যাংকক", country: "Thailand", region: "SOUTHEAST_ASIA" },
    { iata: "SIN", nameEn: "Singapore Changi Airport", nameBn: "সিঙ্গাপুর চাঙ্গি বিমানবন্দর", cityEn: "Singapore", cityBn: "সিঙ্গাপুর", country: "Singapore", region: "SOUTHEAST_ASIA" },
    { iata: "KUL", nameEn: "Kuala Lumpur Int'l Airport", nameBn: "কুয়ালালামপুর আন্তর্জাতিক বিমানবন্দর", cityEn: "Kuala Lumpur", cityBn: "কুয়ালালামপুর", country: "Malaysia", region: "SOUTHEAST_ASIA" },
    { iata: "DEL", nameEn: "Indira Gandhi Int'l Airport", nameBn: "ইন্দিরা গান্ধী আন্তর্জাতিক বিমানবন্দর", cityEn: "Delhi", cityBn: "দিল্লি", country: "India", region: "SOUTH_ASIA" },
    { iata: "CCU", nameEn: "Netaji Subhash Chandra Bose Airport", nameBn: "নেতাজি সুভাষচন্দ্র বসু বিমানবন্দর", cityEn: "Kolkata", cityBn: "কলকাতা", country: "India", region: "SOUTH_ASIA" },
    { iata: "BOM", nameEn: "Chhatrapati Shivaji Maharaj Airport", nameBn: "মুম্বাই বিমানবন্দর", cityEn: "Mumbai", cityBn: "মুম্বাই", country: "India", region: "SOUTH_ASIA" },
    { iata: "CMB", nameEn: "Bandaranaike Int'l Airport", nameBn: "কলম্বো বিমানবন্দর", cityEn: "Colombo", cityBn: "কলম্বো", country: "Sri Lanka", region: "SOUTH_ASIA" },
    { iata: "KTM", nameEn: "Tribhuvan Int'l Airport", nameBn: "কাঠমান্ডু বিমানবন্দর", cityEn: "Kathmandu", cityBn: "কাঠমান্ডু", country: "Nepal", region: "SOUTH_ASIA" },
    { iata: "MLE", nameEn: "Velana Int'l Airport", nameBn: "মালে বিমানবন্দর", cityEn: "Malé", cityBn: "মালে", country: "Maldives", region: "SOUTH_ASIA" },

    // Europe & Turkey
    { iata: "IST", nameEn: "Istanbul Airport", nameBn: "ইস্তাম্বুল বিমানবন্দর", cityEn: "Istanbul", cityBn: "ইস্তাম্বুল", country: "Türkiye", region: "EUROPE" },
    { iata: "LHR", nameEn: "London Heathrow Airport", nameBn: "লন্ডন হিথ্রো বিমানবন্দর", cityEn: "London", cityBn: "লন্ডন", country: "UK", region: "EUROPE" },
    { iata: "MAN", nameEn: "Manchester Airport", nameBn: "ম্যানচেস্টার বিমানবন্দর", cityEn: "Manchester", cityBn: "ম্যানচেস্টার", country: "UK", region: "EUROPE" },
    { iata: "CDG", nameEn: "Charles de Gaulle Airport", nameBn: "শার্ল দ্য গল বিমানবন্দর", cityEn: "Paris", cityBn: "প্যারিস", country: "France", region: "EUROPE" },
    { iata: "FCO", nameEn: "Rome Fiumicino Airport", nameBn: "রোম ফিউমিচিনো বিমানবন্দর", cityEn: "Rome", cityBn: "রোম", country: "Italy", region: "EUROPE" },

    // North America
    { iata: "JFK", nameEn: "John F. Kennedy Int'l Airport", nameBn: "জেএফকে বিমানবন্দর", cityEn: "New York", cityBn: "নিউ ইয়র্ক", country: "USA", region: "NORTH_AMERICA" },
    { iata: "YYZ", nameEn: "Toronto Pearson Int'l Airport", nameBn: "টরোন্টো পিয়ারসন বিমানবন্দর", cityEn: "Toronto", cityBn: "টরোন্টো", country: "Canada", region: "NORTH_AMERICA" },
  ] as Airport[],

  routes: [
    {
      id: "dac-dxb",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "DXB",
      destName: "Dubai",
      region: "Middle East",
      flightDuration: "4h 45m",
      frequency: "Multiple daily flights",
      popularFor: "Business & Transit",
      coordinates: { origin: [23.8433, 90.3978], dest: [25.2532, 55.3657] },
    },
    {
      id: "dac-jed",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "JED",
      destName: "Jeddah",
      region: "Middle East",
      flightDuration: "6h 20m",
      frequency: "Daily direct service",
      popularFor: "Umrah & Hajj",
      coordinates: { origin: [23.8433, 90.3978], dest: [21.6796, 39.1565] },
    },
    {
      id: "dac-bkk",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "BKK",
      destName: "Bangkok",
      region: "Southeast Asia",
      flightDuration: "2h 30m",
      frequency: "3+ daily flights",
      popularFor: "Holiday & Medical",
      coordinates: { origin: [23.8433, 90.3978], dest: [13.6900, 100.7501] },
    },
    {
      id: "dac-sin",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "SIN",
      destName: "Singapore",
      region: "Southeast Asia",
      flightDuration: "4h 10m",
      frequency: "Daily flights",
      popularFor: "Leisure & Corporate",
      coordinates: { origin: [23.8433, 90.3978], dest: [1.3644, 103.9915] },
    },
    {
      id: "dac-kul",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "KUL",
      destName: "Kuala Lumpur",
      region: "Southeast Asia",
      flightDuration: "3h 50m",
      frequency: "Multiple daily",
      popularFor: "Travel & Education",
      coordinates: { origin: [23.8433, 90.3978], dest: [2.7456, 101.7099] },
    },
    {
      id: "dac-lhr",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "LHR",
      destName: "London",
      region: "Europe",
      flightDuration: "10h 30m",
      frequency: "Direct & One-Stop",
      popularFor: "Diaspora & Study",
      coordinates: { origin: [23.8433, 90.3978], dest: [51.4700, -0.4543] },
    },
    {
      id: "dac-ist",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "IST",
      destName: "Istanbul",
      region: "Europe / Transcontinental",
      flightDuration: "8h 15m",
      frequency: "Daily direct",
      popularFor: "Tourism & EU Transit",
      coordinates: { origin: [23.8433, 90.3978], dest: [41.2753, 28.7519] },
    },
    {
      id: "dac-cxb",
      originIata: "DAC",
      originName: "Dhaka",
      destIata: "CXB",
      destName: "Cox's Bazar",
      region: "Domestic Bangladesh",
      flightDuration: "1h 05m",
      frequency: "Hourly departures",
      popularFor: "Beach Holiday",
      coordinates: { origin: [23.8433, 90.3978], dest: [21.4522, 91.9639] },
    },
  ] as AtlasRoute[],

  services: [
    {
      id: "air-ticketing",
      titleEn: "Air Ticketing",
      titleBn: "এয়ার টিকেট বুকিং সহায়তা",
      descEn: "Fast, accurate flight quotations across 100+ global and domestic airlines with expert reissuance handling.",
      descBn: "দেশীয় ও আন্তর্জাতিক শতাধিক এয়ারলাইন্সের সেরা ভাড়ায় টিকেট কোটেশন ও দ্রুত রি-ইস্যু সুবিধা।",
      icon: "Plane",
      badgeEn: "Core Service",
      badgeBn: "প্রধান সেবা",
    },
    {
      id: "visa-processing",
      titleEn: "Visa Facilitation",
      titleBn: "ভিসা প্রসেসিং ও ডকুমেন্টেশন",
      descEn: "End-to-end documentation audit, file preparation, appointment assistance, and transparent consulate guidance.",
      descBn: "নির্ভুল ফাইল প্রসেসিং, অ্যাপয়েন্টমেন্ট শিডিউলিং ও দূতাবাস নির্দেশিকা অনুযায়ী পেশাদার সহায়তা।",
      icon: "FileCheck",
    },
    {
      id: "umrah-hajj",
      titleEn: "Umrah Packages",
      titleBn: "উমরাহ ও হজ প্যাকেজ",
      descEn: "Tailored religious travel packages with premium hotel stays near Haram Sharif and private ground logistics.",
      descBn: "হারাম শরীফের কাছাকাছি হোটেল, ভিআইপি পরিবহন এবং সম্পূর্ণ শরীয়াহসম্মত নির্ভরযোগ্য উমরাহ সেবা।",
      icon: "Compass",
      badgeEn: "Specialized",
      badgeBn: "বিশেষ সেবা",
    },
    {
      id: "holiday-packages",
      titleEn: "Curated Holidays",
      titleBn: "হলিডে ও ট্যুর প্যাকেজ",
      descEn: "Customized leisure packages for families, couples, and adventurers across Southeast Asia, Europe, and domestic spots.",
      descBn: "পরিবার ও বন্ধুদের নিয়ে স্বাচ্ছন্দ্যময় ভ্রমণের কাস্টমাইজড অভ্যন্তরীণ ও আন্তর্জাতিক হলিডে ট্যুর।",
      icon: "Palmtree",
    },
    {
      id: "corporate-travel",
      titleEn: "Corporate Mobility",
      titleBn: "কর্পোরেট ট্রাভেল ম্যানেজমেন্ট",
      descEn: "Dedicated account manager, structured invoicing, change flexibility, and consolidated travel expense control.",
      descBn: "ব্যবসায়িক প্রতিষ্ঠানের জন্য বিশেষ কর্পোরেট ফেয়ার, নমনীয় পরিবর্তন সুবিধা ও সেন্ট্রাল ইনভয়েসিং।",
      icon: "Briefcase",
      badgeEn: "B2B Priority",
      badgeBn: "কর্পোরেট",
    },
    {
      id: "hotel-reservations",
      titleEn: "Global Hotels",
      titleBn: "হোটেল ও রিসোর্ট বুকিং",
      descEn: "Vetted 3-star to 5-star properties worldwide with instant confirmation support and negotiated amenities.",
      descBn: "বিশ্বব্যাপী যাচাইকৃত বাজেট থেকে ৫-তারকা হোটেল ও রিসোর্টে বিশেষ ভাড়ায় নিশ্চিত রুম রিজার্ভেশন।",
      icon: "Building2",
    },
    {
      id: "travel-insurance",
      titleEn: "Travel Insurance",
      titleBn: "ভ্রমণ বীমা সহায়তা",
      descEn: "Schengen and worldwide compliant medical and baggage travel insurance policies from accredited underwriters.",
      descBn: "শেভেন ও আন্তর্জাতিক ভ্রমণ উপযোগী চিকিৎসা ও লাগেজ কভারেজ নিশ্চিতকারী অনুমোদিত ট্রাভেল ইনস্যুরেন্স।",
      icon: "ShieldCheck",
    },
    {
      id: "b2b-agency-desk",
      titleEn: "Agency Desk (B2B)",
      titleBn: "ট্রাভেল এজেন্সি অংশীদারিত্ব",
      descEn: "Empowering non-IATA and independent agencies with wholesale inventory, sub-agent margins, and operational desks.",
      descBn: "নন-আয়াটা ট্রাভেল এজেন্সির জন্য বিশেষ হোলসেল ফেয়ার, স্বচ্ছ মার্জিন এবং ডেডিকেটেড অপারেশন সাপোর্ট।",
      icon: "Users2",
      badgeEn: "For Travel Agents",
      badgeBn: "এজেন্টদের জন্য",
    },
  ] as ServiceItem[],

  b2bDesks: [
    {
      id: "fare-desk",
      titleEn: "FareDesk™",
      titleBn: "ফেয়ারডেস্ক",
      descEn: "Aggregated GDS, LCC, and group contract fares sourced in minutes for your sub-agency clients.",
      descBn: "আপনার ক্লায়েন্টদের জন্য জিডিএস, এলসিসি ও স্পেশাল গ্রুপ ভাড়ার দ্রুততম সোর্সিং ব্যবস্থা।",
    },
    {
      id: "booking-desk",
      titleEn: "BookingDesk™",
      titleBn: "বুকিংডেস্ক",
      descEn: "High-accuracy PNR management and rapid quotation turnaround with verified split-fare transparency.",
      descBn: "নির্ভুল পিএনআর তৈরি ও দ্রুত কোটেশন প্রক্রিয়াকরণ যেখানে কোনো অপ্রকাশিত ফি থাকে না।",
    },
    {
      id: "clear-margin",
      titleEn: "ClearMargin™",
      titleBn: "ক্লিয়ারমার্জিন",
      descEn: "Zero hidden markups. Real-time sub-agent ledger and instant commission reconciliation.",
      descBn: "১০০% স্বচ্ছ কমিশন লেজার। প্রতিটি টিকেটে আপনার এজেন্সির অর্জিত মার্জিন তাৎক্ষণিক দেখুন।",
    },
    {
      id: "after-care",
      titleEn: "AfterCare Desk™",
      titleBn: "আফটার-কেয়ার ডেস্ক",
      descEn: "Dedicated specialist team for reissues, emergency rerouting, cancellations, and airline waivers.",
      descBn: "ফ্লাইট পরিবর্তন, রি-ইস্যু, রিফান্ড ও জরুরি প্রয়োজনে নিরবচ্ছিন্ন ২৪/৭ সাপোর্ট টিম।",
    },
    {
      id: "verified-workflow",
      titleEn: "Verified Workflow™",
      titleBn: "ভেরিফায়েড ওয়ার্কফ্লো",
      descEn: "Strict passenger name verification to eliminate costly reissue penalties before issuing tickets.",
      descBn: "টিকিট ইস্যুর পূর্বে প্যাসেঞ্জার নাম ও পাসপোর্ট তথ্যের ডাবল-ভেরিফিকেশন যাতে ভুল প্রতিরোধ হয়।",
    },
    {
      id: "partner-growth",
      titleEn: "PartnerGrowth™",
      titleBn: "পার্টনারগ্রোথ",
      descEn: "Volume incentives, agency training workshops, and branded promotional material support.",
      descBn: "ভলিউম ইনসেনটিভ, কর্মীদের দক্ষতা বৃদ্ধির প্রশিক্ষণ এবং মার্কেটিং সাপোর্ট।",
    },
  ],
};
