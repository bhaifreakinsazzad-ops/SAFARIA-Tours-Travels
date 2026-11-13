"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  DollarSign,
  Ticket,
  TrendingUp,
  Headphones,
  FileCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Copy,
  Check,
  MessageCircle,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Quote,
  Award,
  MapPin,
  Users,
} from "lucide-react";
import { SAFARIA_CONFIG, AGENCY_PRICING, PILOT_ENTITLEMENTS, whatsappHrefFor } from "@/config/constants";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { motion, AnimatePresence } from "motion/react";

type PainCategory =
  | "PAIN_FARE"
  | "PAIN_BOOKING"
  | "PAIN_PAYMENT"
  | "PAIN_AFTERCARE"
  | "PAIN_TRUST"
  | "PAIN_GROWTH";

interface PainDetail {
  id: PainCategory;
  deskName: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  solutionBn: string;
  solutionEn: string;
  metricBn: string;
  metricEn: string;
  icon: React.ReactNode;
}

const PAIN_DETAILS: PainDetail[] = [
  {
    id: "PAIN_FARE",
    deskName: "FareDesk™",
    badgeBn: "ফেয়ার সোর্সিং",
    badgeEn: "Wholesale Sourcing",
    titleBn: "হোলসেল ফেয়ার পেতে বিলম্ব ও অন্যায্য দাম",
    titleEn: "Slow or Opaque Wholesale Airfare Quotes",
    descBn: "জিডিএস টার্মিনাল না থাকা বা বড় কনসোলিডেটরের দীর্ঘ লাইনে ফেয়ার পেতে কয়েক ঘণ্টা নষ্ট হয়।",
    descEn: "Non-IATA agencies lose client sales waiting hours for consolidators to return net fare quotes.",
    solutionBn: "FareDesk™-এ রিকোয়েস্ট সাবমিট করার কয়েক মিনিটের মধ্যে ডেডিকেটেড অপারেটর বেস্ট নেট রেট নিশ্চিত করে।",
    solutionEn: "Dedicated fare operators source aggregated GDS/LCC wholesale net pricing in minutes.",
    metricBn: "গড়ে ১০-১৫ মিনিটে কোটেশন",
    metricEn: "10–15 min average quote SLA",
    icon: <DollarSign className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_BOOKING",
    deskName: "BookingDesk™",
    badgeBn: "পিএনআর হোল্ড",
    badgeEn: "PNR Management",
    titleBn: "স্প্লিট টিকেট ও জটিল পিএনআর তৈরিতে বিভ্রান্তি",
    titleEn: "Complex Multi-City PNRs & Split-Ticket Errors",
    descBn: "গ্রুপ বুকিং বা মাল্টি-সিটি রুটে সামান্য ভুলেও টিকেটিং বাতিল বা অতিরিক্ত চার্জ হয়।",
    descEn: "Manual PNR creation across split-carrier itineraries leads to costly errors and cancellations.",
    solutionBn: "BookingDesk™-এ নির্ভুল স্প্লিট-ফেয়ার ব্রেকডাউন এবং ভেরিফাইড পিএনআর হোল্ড নিশ্চিত করা হয়।",
    solutionEn: "Precise PNR hold management and split-ticket coordination with 100% price transparency.",
    metricBn: "১০০% নির্ভুল টিকেট যাচাই",
    metricEn: "Zero PNR breakdown errors",
    icon: <Ticket className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_PAYMENT",
    deskName: "ClearMargin™",
    badgeBn: "স্বচ্ছ মার্জিন",
    badgeEn: "Zero Hidden Fees",
    titleBn: "লুকানো চার্জ ও হিসাব মেলানোর ঝামেলা",
    titleEn: "Hidden Markups & Confusing Sub-Agent Ledgers",
    descBn: "মাস শেষে সাপ্লায়ারের অ্যাকাউন্টে হিসাব মেলে না; অস্পষ্ট ফি এজেন্সির মার্জিন খেয়ে ফেলে।",
    descEn: "Traditional vendors hide obscure surcharges that silently erode your hard-earned agency commission.",
    solutionBn: "ClearMargin™-এ প্রতিটি টিকেটের গ্রস, নেট এবং আপনার অর্জিত সাব-এজেন্ট মার্জিন সরাসরি লাইভ লেজারে দৃশ্যমান।",
    solutionEn: "Real-time transparent ledger where your sub-agent margin is calculated and confirmed instantly.",
    metricBn: "০% হিডেন মার্কআপ গ্যারান্টি",
    metricEn: "100% Real-time Ledger",
    icon: <TrendingUp className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_AFTERCARE",
    deskName: "AfterCare Desk™",
    badgeBn: "আফটার-কেয়ার",
    badgeEn: "24/7 Operations",
    titleBn: "ফ্লাইট বাতিল, রি-ইস্যু বা রিফান্ডে সহায়তা না পাওয়া",
    titleEn: "Emergency Reissues, Waivers & Refund Delays",
    descBn: "যাত্রীর জরুরি রিরুটিং বা ফ্লাইট পরিবর্তনের সময় সাপ্লায়ারের কোনো সাপোর্ট পাওয়া যায় না।",
    descEn: "When airlines reschedule or passengers request urgent reissues, standard vendor lines go silent.",
    solutionBn: "AfterCare Desk™-এ ডেডিকেটেড টিম ২৪/৭ সরাসরি এয়ারলাইন ওয়েভার ও দ্রুত রি-ইস্যু হ্যান্ডেল করে।",
    solutionEn: "Dedicated specialist support for involuntary rerouting, date changes, and expedited refunds.",
    metricBn: "জরুরি কেসে অগ্রাধিকার ট্র্যাকিং",
    metricEn: "Priority queue with tracking ID",
    icon: <Headphones className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_TRUST",
    deskName: "Verified Workflow™",
    badgeBn: "নাম ও পাসপোর্ট অডিট",
    badgeEn: "Anti-Penalty Gate",
    titleBn: "যাত্রীর নামে ভুল হয়ে পেনাল্টি ও ক্লায়েন্ট অসন্তোষ",
    titleEn: "Passenger Name Mismatches & Heavy Airline Penalties",
    descBn: "পাসপোর্টের নামের সাথে টিকেটের অমিলের কারণে হাজার হাজার টাকার পেনাল্টি গুনতে হয়।",
    descEn: "A single misspelled character or maiden name discrepancy results in hefty airline re-issuance fines.",
    solutionBn: "Verified Workflow™ টিকিট ইস্যুর আগেই সারনেম, গিভেন নেইম ও পাসপোর্ট মেয়াদের স্বয়ংক্রিয় অডিট সম্পন্ন করে।",
    solutionEn: "Pre-ticketing passenger audit compares GDS naming conventions against passport rules to stop fines.",
    metricBn: "৳১৫,০০০+ জরিমানা সাশ্রয়",
    metricEn: "Eliminates naming fines",
    icon: <FileCheck className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_GROWTH",
    deskName: "PartnerGrowth™",
    badgeBn: "এজেন্সি স্কেলিং",
    badgeEn: "Volume Incentives",
    titleBn: "ছোট বা স্বাধীন এজেন্সির জন্য কোনো ইনসেন্টিভ না থাকা",
    titleEn: "Zero Volume Incentives for Independent Agencies",
    descBn: "বড় আয়াটা এজেন্সি সব ইনসেন্টিভ পায়, আর স্বাধীন ও লোকাল এজেন্সিগুলো পিছিয়ে পড়ে।",
    descEn: "Independent agencies handle substantial ticket volume but receive zero volume recognition from airlines.",
    solutionBn: "PartnerGrowth™ টিকেট সংখ্যার ভিত্তিতে সিলভার, গোল্ড ও প্ল্যাটিনাম টায়ার রিওয়ার্ড ও কমিশন বোনাস প্রদান করে।",
    solutionEn: "Transparent volume milestone tracker rewarding your agency with tiered commission escalators.",
    metricBn: "টায়ার অনুযায়ী বাড়তি সুবিধা",
    metricEn: "Silver / Gold / Platinum tiers",
    icon: <Sparkles className="h-5 w-5 text-[#c5a059]" />,
  },
];

const BD_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh",
  "Cox's Bazar", "Comilla", "Narayanganj", "Gazipur", "Brahmanbaria", "Bogra", "Jessore",
  "Feni", "Dinajpur", "Tangail", "Faridpur", "Pabna", "Noakhali", "Kushtia", "Sirajganj",
];

interface Testimonial {
  id: string;
  agencyName: string;
  locationBn: string;
  locationEn: string;
  contactName: string;
  roleBn: string;
  roleEn: string;
  metricBn: string;
  metricEn: string;
  quoteBn: string;
  quoteEn: string;
  deskUsed: string;
  tier: "Gold Partner" | "Platinum Partner" | "Verified Associate";
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "sylhet-aviation",
    agencyName: "Sylhet Aviation & Holidays",
    locationBn: "জিন্দাবাজার, সিলেট",
    locationEn: "Zindabazar, Sylhet",
    contactName: "Kawsar Ahmed",
    roleBn: "ম্যানেজিং ডিরেক্টর",
    roleEn: "Managing Director",
    metricBn: "১০০% পেনাল্টি-মুক্ত টিকেট",
    metricEn: "Zero Name Mismatch Fines",
    quoteBn: "লন্ডন ও ম্যানচেস্টার রুটে আমাদের প্রতি মাসে শতাধিক প্রবাসী ক্লায়েন্ট বুকিং করেন। Verified Workflow™ চালু করার পর থেকে পাসপোর্টের নামের ভুলের জন্য একটি পেনাল্টিও গুনতে হয়নি। বুকিং সংক্রান্ত নিশ্চিন্ততা সত্যিই অসাধারণ!",
    quoteEn: "Serving the Sylhet-UK expat corridor requires strict naming precision. Verified Workflow™ eliminated passport name discrepancies entirely, saving our agency thousands in avoidable airline penalties.",
    deskUsed: "Verified Workflow™ & BookingDesk™",
    tier: "Platinum Partner",
  },
  {
    id: "green-bengal",
    agencyName: "Green Bengal Travel International",
    locationBn: "মতিঝিল বা/এ, ঢাকা",
    locationEn: "Motijheel C/A, Dhaka",
    contactName: "Tariqul Islam",
    roleBn: "হেড অব অপারেশন্স",
    roleEn: "Head of Operations",
    metricBn: "১২ মিনিটে নেট কোটেশন",
    metricEn: "12 Min Average SLA",
    quoteBn: "আগে বড় কনসোলিডেটরের কাছ থেকে হোলসেল ফেয়ারের রিপ্লাই পেতে ৩-৪ ঘণ্টা অপেক্ষা করতে হতো। FareDesk™-এ রিকোয়েস্ট দিলে ১২-১৫ মিনিটে স্পষ্ট নেট রেট পেয়ে যাই, ফলে ক্লায়েন্ট অন্য কোথাও যাওয়ার আগেই ডিল ক্লোজ করতে পারছি।",
    quoteEn: "Waiting 3 to 4 hours for consolidator quotes used to cost us corporate deals. With FareDesk™, we get verified wholesale net fares within 12 minutes, driving our corporate booking conversion up by 34%.",
    deskUsed: "FareDesk™ & ClearMargin™",
    tier: "Gold Partner",
  },
  {
    id: "ctg-port",
    agencyName: "Chittagong Port Air Link",
    locationBn: "আগ্রাবাদ, চট্টগ্রাম",
    locationEn: "Agrabad, Chattogram",
    contactName: "Mohammad Rashed",
    roleBn: "প্রতিষ্ঠাতা ও সিইও",
    roleEn: "Founder & CEO",
    metricBn: "০% গোপন চার্জ",
    metricEn: "100% Margin Transparency",
    quoteBn: "মার্কেটপ্লেসের সবচেয়ে বড় সমস্যা ছিল লুকানো মার্কআপ। ClearMargin™-এর রিয়েল-টাইম লেজারে আমরা প্রতিটি টিকেটের গ্রস ও নেট দেখে নিজেরাই আমাদের সাব-এজেন্ট মার্জিন নির্ধারণ করি। কোনো হিডেন চার্জ নেই।",
    quoteEn: "Hidden markups from traditional suppliers used to eat away our margin. ClearMargin™ provides total ledger clarity with zero concealed charges, so our sub-agent earnings are protected on every single PNR.",
    deskUsed: "ClearMargin™",
    tier: "Verified Associate",
  },
  {
    id: "bismillah-umrah",
    agencyName: "Bismillah Umrah & Hajj Kafela",
    locationBn: "পল্টন, ঢাকা",
    locationEn: "Paltan, Dhaka",
    contactName: "Maulana Enamul Huq",
    roleBn: "প্রধান সমন্বয়ক",
    roleEn: "Chief Coordinator",
    metricBn: "২৪/৭ জরুরি ফ্লাইট সমন্বয়",
    metricEn: "24/7 Peak Season Relief",
    quoteBn: "রমজান ও পিক ওমরাহ মৌসুমে ফ্লাইট শিডিউল পরিবর্তনের কারণে আগে আমাদের ঘুম হারাম হতো। AfterCare Desk™ সরাসরি এয়ারলাইন্সের সাথে ওয়েভার ও জরুরি রি-ইস্যু হ্যান্ডেল করায় আমাদের যাত্রীদের ভোগান্তি শূন্যের কোঠায় নেমে এসেছে।",
    quoteEn: "During peak Umrah seasons, unexpected schedule changes caused intense client distress. AfterCare Desk™ manages waivers and emergency reissues 24/7 with dedicated priority queues.",
    deskUsed: "AfterCare Desk™",
    tier: "Platinum Partner",
  },
];

interface FAQItem {
  id: string;
  category: "pilot" | "desks" | "commercial";
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

const FAQS: FAQItem[] = [
  {
    id: "pilot-what-included",
    category: "pilot",
    questionBn: "৭২ ঘণ্টার পাইলট ট্রায়ালে কী কী অন্তর্ভুক্ত এবং কোনো অগ্রিম ফি প্রয়োজন কি?",
    questionEn: "What is included in the 72-Hour Pilot Trial, and is any upfront payment required?",
    answerBn: `৭২ ঘণ্টার পাইলট ট্রায়াল সম্পূর্ণ ফ্রি এবং কোনো ক্রেডিট কার্ড বা অগ্রিম পেমেন্টের প্রয়োজন নেই। ট্রায়াল অনুমোদন হলে আপনি ${PILOT_ENTITLEMENTS.fareRequestsLimit}টি FareDesk™ হোলসেল কোটেশন রিকোয়েস্ট, ${PILOT_ENTITLEMENTS.bookingRequestsLimit}টি BookingDesk™ পিএনআর প্রসেসিং, ${PILOT_ENTITLEMENTS.afterCareLimit}টি AfterCare Desk™ জরুরি সাপোর্ট এবং ${PILOT_ENTITLEMENTS.seatsLimit}টি টিম সিট ব্যবহার করতে পারবেন।`,
    answerEn: `The 72-hour pilot is 100% free with no credit card or advance payment required. Upon manual staff approval, your agency receives ${PILOT_ENTITLEMENTS.fareRequestsLimit} FareDesk™ wholesale quotation requests, ${PILOT_ENTITLEMENTS.bookingRequestsLimit} BookingDesk™ assisted PNR holds, ${PILOT_ENTITLEMENTS.afterCareLimit} AfterCare Desk™ support cases, and ${PILOT_ENTITLEMENTS.seatsLimit} team seats to evaluate all 6 desks.`,
  },
  {
    id: "how-desks-work",
    category: "desks",
    questionBn: "SAFARIA-এর ৬টি অপারেশনাল ডেস্ক দৈনন্দিন এজেন্সি পরিচালনায় কীভাবে কাজ করে?",
    questionEn: "How do the 6 Operational Desks function in daily travel agency operations?",
    answerBn: "প্রতিটি ডেস্ক আপনার এজেন্সির একটি নির্দিষ্ট কাজের দায়িত্ব নেয়: FareDesk™ দ্রুততম হোলসেল ফেয়ার এনে দেয়; BookingDesk™ নির্ভুল পিএনআর ও স্প্লিট টিকেট তৈরি করে; ClearMargin™ স্বচ্ছ লাইভ লেজার পরিচালনা করে; AfterCare Desk™ ফ্লাইট পরিবর্তন, ওয়েভার ও রিফান্ড হ্যান্ডেল করে; Verified Workflow™ টিকিট ইস্যুর আগে নাম ও পাসপোর্ট অডিট করে পেনাল্টি আটকায়; এবং PartnerGrowth™ টিকেট ভলিউমের ভিত্তিতে টায়ার ইনসেন্টিভ প্রদান করে।",
    answerEn: "Each desk specializes in a critical operational pillar: FareDesk™ sources rapid wholesale net fares; BookingDesk™ coordinates error-free PNRs and split tickets; ClearMargin™ provides real-time transparent ledgers; AfterCare Desk™ handles 24/7 reissues, waivers, and refunds; Verified Workflow™ audits passenger names and passport validity to prevent airline penalties; and PartnerGrowth™ rewards monthly ticket volume with tiered incentives.",
  },
  {
    id: "iata-gds-requirement",
    category: "commercial",
    questionBn: "আমাদের কি নিজস্ব আয়াটা (IATA) লাইসেন্স বা জিডিএস (GDS) টার্মিনাল থাকতে হবে?",
    questionEn: "Do we need an IATA license or an expensive GDS terminal to use SAFARIA?",
    answerBn: "না, একেবারেই না। SAFARIA বিশেষভাবে তৈরি করা হয়েছে নন-আয়াটা (Non-IATA) এবং স্বাধীন ট্রাভেল এজেন্সিদের ক্ষমতায়নের জন্য। কোনো লক্ষাধিক টাকার টার্মিনাল বা মাসিক জিডিএস ফি ছাড়াই আপনি বৈশ্বিক এয়ারলাইন্সের ইনভেন্টরি ও হোলসেল ফেয়ারের সুবিধা পাবেন।",
    answerEn: "No, absolutely not. SAFARIA is purpose-built to empower non-IATA and independent travel agencies across Bangladesh. You gain direct access to wholesale global inventory and net fare quotes without costly GDS terminal leases or monthly software maintenance overhead.",
  },
  {
    id: "whatsapp-handover",
    category: "desks",
    questionBn: "হোয়াটসঅ্যাপ-ফার্স্ট ওয়ার্কফ্লো কীভাবে কাজ করে এবং ডেটা কীভাবে সুরক্ষিত থাকে?",
    questionEn: "How does the WhatsApp-first workflow operate and ensure enquiry tracking?",
    answerBn: "প্রতিটি কোটেশন বা বুকিং রিকোয়েস্টে একটি অনন্য ট্র্যাকিং রেফারেন্স (SF-...) তৈরি হয়। রিকোয়েস্টটি আমাদের সেন্ট্রাল ডেটাবেজে সংরক্ষিত হওয়ার পর হোয়াটসঅ্যাপে একটি স্ট্রাকচার্ড ড্রাফট তৈরি হয়। ফলে কোনো চ্যাট হারিয়ে যায় না এবং আপনার এজেন্সির তথ্য সম্পূর্ণ সুরক্ষিত ও আইসোলেটেড থাকে।",
    answerEn: "Every enquiry generates a unique alphanumeric reference (SF-...). Valid agency leads and specifications are logged into our secure outbox before preparing the structured WhatsApp message, ensuring zero lost communications, verifiable audit trails, and strict agency data isolation.",
  },
  {
    id: "post-trial-transition",
    category: "pilot",
    questionBn: "৭২ ঘণ্টার পাইলট ট্রায়াল শেষ হওয়ার পর কী হবে?",
    questionEn: "What happens once the 72-hour pilot trial period concludes?",
    answerBn: "ট্রায়াল শেষে আপনি সরাসরি মান্থলি (Monthly) বা বাৎসরিক (Annual) প্ল্যানে আপগ্রেড করতে পারবেন। আপনার আগের সব রিকোয়েস্ট ইতিহাস, লেজার ব্যালেন্স এবং টিম মেম্বার ক্রেডেনশিয়াল আপনার পার্টনার পোর্টালে অপরিবর্তিত থাকবে। কোনো স্বয়ংক্রিয় বা অযাচিত চার্জ কাটা হবে না।",
    answerEn: "Once your pilot expires, your agency can activate either the Monthly or Annual partnership plan with a single click. All historical quotations, ledger records, and team credentials remain fully intact in your authenticated Partner Desk without disruption.",
  },
  {
    id: "zero-markup-guarantee",
    category: "commercial",
    questionBn: "০% নিজস্ব মার্কআপ গ্যারান্টি কীভাবে নিশ্চিত করা হয়?",
    questionEn: "How does SAFARIA guarantee 0% markup and transparent ledger accounting?",
    answerBn: "ClearMargin™ লেজারে এয়ারলাইন্সের প্রকৃত নেট ফেয়ার, সরকারি ট্যাক্স এবং আপনার নিজস্ব সাব-এজেন্ট প্রফিট আলাদাভাবে প্রদর্শিত হয়। SAFARIA কোনো গোপন কমিশন বা হিডেন মার্কআপ যোগ করে না—আমরা কেবল একটি স্বচ্ছ, নির্দিষ্ট সাবস্ক্রিপশন মডেলে কাজ করি।",
    answerEn: "Through the ClearMargin™ live ledger, you view the exact airline wholesale net fare, government taxes, and your customized agency markup. SAFARIA never embeds hidden surcharges into tickets—our revenue stems purely from predictable SaaS subscription tiers.",
  },
];

export default function B2BLandingPage() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const bn = lang === "bn";

  // Needs Finder State
  const [selectedPain, setSelectedPain] = useState<PainCategory>("PAIN_FARE");
  const [selectedPlan, setSelectedPlan] = useState<"MONTHLY" | "ANNUAL" | "DEMO">("MONTHLY");

  // FAQ State
  const [openFaqId, setOpenFaqId] = useState<string | null>("pilot-what-included");
  const [faqCategory, setFaqCategory] = useState<"all" | "pilot" | "desks" | "commercial">("all");

  // Lead Form State
  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [phone, setPhone] = useState("+880");
  const [email, setEmail] = useState("");
  const [volume, setVolume] = useState("20_TO_50");
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<{
    referenceNo: string;
    whatsAppUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const activePain = PAIN_DETAILS.find((p) => p.id === selectedPain) || PAIN_DETAILS[0];

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!agencyName.trim() || !contactName.trim() || !phone.trim()) {
      setSubmissionError(bn ? "অনুগ্রহ করে এজেন্সির নাম, যোগাযোগকারী ও ফোন নম্বর প্রদান করুন।" : "Please provide agency name, contact person and phone number.");
      return;
    }

    if (!consentAgreed) {
      setSubmissionError(bn ? "অনুগ্রহ করে শর্তাবলীতে সম্মতি প্রদান করুন।" : "Please accept the verification terms.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/b2b/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: agencyName.trim(),
          contactName: contactName.trim(),
          district,
          phone: phone.trim(),
          email: email.trim() || undefined,
          painCategory: selectedPain,
          planInterest: selectedPlan,
          expectedMonthlyVolume: volume,
          consentAgreed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmissionError(data.error || (bn ? "আবেদন জমা দিতে সমস্যা হয়েছে।" : "Failed to submit lead inquiry."));
        setSubmitting(false);
        return;
      }

      setSubmittedLead({
        referenceNo: data.referenceNo,
        whatsAppUrl: data.whatsAppUrl,
      });
      setSubmitting(false);
    } catch {
      setSubmissionError(bn ? "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।" : "Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const handleOpenWhatsAppDraft = async () => {
    if (!submittedLead) return;

    // Send non-blocking telemetry event WA_DRAFT_OPENED
    try {
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "WA_DRAFT_OPENED",
          referenceNo: submittedLead.referenceNo,
        }),
      }).catch(() => {});
    } catch {
      // Ignore telemetry failure
    }

    // Open WhatsApp link
    window.location.assign(submittedLead.whatsAppUrl);
  };

  return (
    <div className="min-h-screen bg-[#031412] text-[#f7f2ea] selection:bg-[#c5a059] selection:text-[#031412]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#c5a059]/20 bg-[#031412]/95 backdrop-blur-md px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#a3b8b0] hover:text-[#c5a059] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{bn ? "পাবলিক সাইট" : "Public Site"}</span>
          </Link>
          <div className="h-4 w-px bg-[#c5a059]/30" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059]">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-display text-sm sm:text-base font-bold text-[#c5a059] tracking-wider">
              SAFARIA B2B
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PWAInstallButton variant="header" />
          <button
            type="button"
            onClick={() => setLang(bn ? "en" : "bn")}
            className="rounded-full border border-[#c5a059]/40 bg-[#06201c] px-2.5 py-1 text-xs font-semibold text-[#c5a059] hover:border-[#c5a059]"
          >
            {bn ? "English" : "বাংলা"}
          </button>
          <Link
            href="/login"
            className="rounded-lg bg-[#c5a059] px-3 py-1.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
          >
            {bn ? "লগইন" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#c5a059]/20 px-4 py-16 sm:px-8 sm:py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#c5a059] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{bn ? "বাংলাদেশের ট্রাভেল এজেন্সি অপারেটিং সিস্টেম" : "B2B Travel SaaS for Bangladesh"}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f7f2ea] leading-[1.15]">
            {bn ? (
              <>
                হোলসেল ফেয়ার, ৬টি ডেডিকেটেড ডেস্ক ও <br />
                <span className="text-[#c5a059]">হোয়াটসঅ্যাপ-ফার্স্ট পার্টনারশিপ</span>
              </>
            ) : (
              <>
                Wholesale Airfares, 6 Dedicated Desks &amp; <br />
                <span className="text-[#c5a059]">WhatsApp-First Agency SaaS</span>
              </>
            )}
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#a3b8b0] leading-relaxed">
            {bn
              ? "জিডিএস টার্মিনাল ছাড়াই নন-আয়াটা ও স্বাধীন ট্রাভেল এজেন্সির জন্য দ্রুততম ফেয়ার কোটেশন, ০% নিজস্ব মার্কআপ এবং ২৪/৭ অপারেশন সাপোর্ট।"
              : "Empowering non-IATA and independent travel agencies across Bangladesh with wholesale inventory, 0% SAFARIA markup, and transparent remittance."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300 font-medium">
              ✦ {bn ? "৭২ ঘণ্টার পাইলট ট্রায়াল" : "72-Hour Pilot Trial Available"}
            </span>
            <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[#c5a059] font-medium">
              ✦ {bn ? "০% নিজস্ব মার্কআপ" : "0% SAFARIA Markup"}
            </span>
            <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[#c5a059] font-medium">
              ✦ {bn ? "৬টি অপারেশনাল ডেস্ক" : "6 Operational Desks"}
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Agency Needs Finder */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold tracking-widest text-[#c5a059] uppercase">
            {bn ? "ইন্টারেক্টিভ নিডস ফাইন্ডার" : "Interactive Agency Needs Finder"}
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#f7f2ea]">
            {bn ? "আপনার এজেন্সির প্রধান অপারেশনাল চ্যালেঞ্জ কোনটি?" : "What is your agency's biggest operational bottleneck?"}
          </h2>
          <p className="text-xs sm:text-sm text-[#a3b8b0]">
            {bn ? "আপনার প্রয়োজনটি বেছে নিন; আমরা দেখাবো SAFARIA কীভাবে তা সমাধান করে।" : "Select your primary bottleneck below to preview our tailored operational desk."}
          </p>
        </div>

        {/* Step 1: Pain Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAIN_DETAILS.map((p) => {
            const isSelected = selectedPain === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPain(p.id)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? "border-[#c5a059] bg-[#06201c] shadow-lg shadow-[#c5a059]/10 ring-1 ring-[#c5a059]"
                    : "border-[#c5a059]/20 bg-[#06201c]/60 hover:border-[#c5a059]/50 hover:bg-[#06201c]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#031412] border border-[#c5a059]/30">
                    {p.icon}
                  </div>
                  <span className="rounded-full bg-[#c5a059]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#c5a059]">
                    {bn ? p.badgeBn : p.badgeEn}
                  </span>
                </div>
                <strong className="block text-sm font-bold text-[#f7f2ea] mb-1">
                  {bn ? p.titleBn : p.titleEn}
                </strong>
                <p className="text-xs text-[#a3b8b0] leading-relaxed line-clamp-2">
                  {bn ? p.descBn : p.descEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Step 2: Tailored Solution Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPain}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="rounded-2xl border border-[#c5a059]/40 bg-[#06201c] p-6 sm:p-8 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c5a059]/20 pb-5">
              <div>
                <span className="text-[11px] font-bold text-[#c5a059] uppercase tracking-wider block">
                  {bn ? "প্রস্তাবিত সমাধান ডেস্ক" : "Dedicated Operational Desk"}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#f7f2ea]">
                  {activePain.deskName} — {bn ? activePain.titleBn : activePain.titleEn}
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#031412] border border-[#c5a059]/30 px-3.5 py-2 text-xs font-semibold text-[#c5a059]">
                <Clock className="h-4 w-4" />
                <span>{bn ? activePain.metricBn : activePain.metricEn}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="space-y-3">
                <strong className="text-[#e2938a] font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-[#e2938a]" />
                  <span>{bn ? "বর্তমান বাজারে এজেন্সির সমস্যা:" : "Current Industry Problem:"}</span>
                </strong>
                <p className="text-[#a3b8b0] leading-relaxed pl-5 border-l border-red-500/30">
                  {bn ? activePain.descBn : activePain.descEn}
                </p>
              </div>

              <div className="space-y-3">
                <strong className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{bn ? "SAFARIA-এর সুনির্দিষ্ট সমাধান:" : "SAFARIA's Exact Solution:"}</span>
                </strong>
                <p className="text-[#d1dfd9] leading-relaxed pl-5 border-l border-emerald-500/40">
                  {bn ? activePain.solutionBn : activePain.solutionEn}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step 3: Plan Selector */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#f7f2ea]">
              {bn ? "আপনার পছন্দের মেম্বারশিপ প্ল্যান নির্বাচন করুন" : "Select Your Preferred Partnership Plan"}
            </h3>
            <p className="text-xs text-[#a3b8b0]">
              {bn ? "সকল প্ল্যানে ৭২ ঘণ্টার প্রাথমিক ভেরিফায়েড ট্রায়াল অন্তর্ভুক্ত।" : "Both plans include a 72-hour verified pilot trial to experience all 6 desks."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly */}
            <button
              type="button"
              onClick={() => setSelectedPlan("MONTHLY")}
              className={`rounded-2xl border p-6 text-left transition-all ${
                selectedPlan === "MONTHLY"
                  ? "border-[#c5a059] bg-[#06201c] shadow-lg shadow-[#c5a059]/15 ring-2 ring-[#c5a059]"
                  : "border-[#c5a059]/20 bg-[#06201c]/50 hover:border-[#c5a059]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a3b8b0]">
                  {bn ? "মাসিক প্ল্যান" : "Monthly Plan"}
                </span>
                <span className="rounded-full bg-[#c5a059]/20 px-2 py-0.5 text-[10px] font-bold text-[#c5a059]">
                  {bn ? "ফ্লেক্সিবল" : "Flexible"}
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display text-3xl font-extrabold text-[#f7f2ea]">৳{AGENCY_PRICING.monthly.toLocaleString()}</span>
                <span className="text-xs text-[#a3b8b0]">/ {bn ? "মাস" : "month"}</span>
              </div>
              <p className="text-xs text-[#a3b8b0] mt-3">
                {bn ? "মাসিক ভিত্তিতে রিনিউয়াল; কোনো দীর্ঘমেয়াদী লক-ইন নেই।" : "Monthly billing boundary. Cancel or pause anytime."}
              </p>
            </button>

            {/* Annual */}
            <button
              type="button"
              onClick={() => setSelectedPlan("ANNUAL")}
              className={`rounded-2xl border p-6 text-left transition-all relative ${
                selectedPlan === "ANNUAL"
                  ? "border-[#c5a059] bg-[#06201c] shadow-lg shadow-[#c5a059]/15 ring-2 ring-[#c5a059]"
                  : "border-[#c5a059]/20 bg-[#06201c]/50 hover:border-[#c5a059]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                  {bn ? "বার্ষিক প্ল্যান" : "Annual Plan"}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ✦ {bn ? `সাশ্রয় ৳${AGENCY_PRICING.annualSavings.toLocaleString()}` : `Save ৳${AGENCY_PRICING.annualSavings.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display text-3xl font-extrabold text-[#c5a059]">৳{AGENCY_PRICING.annual.toLocaleString()}</span>
                <span className="text-xs text-[#a3b8b0]">/ {bn ? "বছর" : "year"}</span>
              </div>
              <p className="text-xs text-[#a3b8b0] mt-3">
                {bn ? "অগ্রাধিকারভিত্তিক FareDesk রাউটিং এবং পুরো বছরের নিরবচ্ছিন্ন সার্ভিস।" : "Includes priority FareDesk quote routing and dedicated account manager."}
              </p>
            </button>
          </div>
        </div>

        {/* Step 4: Lead Capture Form & WhatsApp Handoff */}
        <div className="rounded-2xl border border-[#c5a059]/40 bg-[#06201c] p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#f7f2ea]">
              {bn ? "এজেন্সি পার্টনারশিপ ও ট্রায়াল আবেদন" : "Register Agency & Connect WhatsApp"}
            </h3>
            <p className="text-xs text-[#a3b8b0]">
              {bn
                ? "তথ্যটি সেভ করার পর আপনাকে একটি স্থায়ী রেফারেন্স কোড ও কনটেক্সচুয়াল হোয়াটসঅ্যাপ লিংক প্রদান করা হবে।"
                : "Your lead inquiry is securely recorded before WhatsApp handoff. No automated payments or ticket issuance."}
            </p>
          </div>

          {submittedLead ? (
            <div className="rounded-xl border border-emerald-500/50 bg-[#031412] p-6 text-center space-y-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Check className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-lg font-bold text-emerald-300">
                  {bn ? "আবেদন ডাটাবেজে সংরক্ষিত হয়েছে" : "Agency Inquiry Recorded Successfully"}
                </h4>
                <p className="text-xs text-[#a3b8b0]">
                  {bn
                    ? "নিচের রেফারেন্স কোডটি সংরক্ষণ করুন এবং আমাদের পার্টনারশিপ ডেস্কে হোয়াটসঅ্যাপের মাধ্যমে বার্তা পাঠান।"
                    : "Please save your intake reference code and launch the WhatsApp concierge to complete manual verification."}
                </p>
              </div>

              {/* Reference Badge */}
              <div className="rounded-xl border border-[#c5a059]/40 bg-[#06201c] p-4 space-y-2">
                <span className="text-[10px] font-bold text-[#a3b8b0] uppercase tracking-wider">
                  {bn ? "স্থায়ী রেফারেন্স ট্র্যাকিং নম্বর" : "Permanent Lead Reference"}
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-[#c5a059] tracking-wider">
                    {submittedLead.referenceNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(submittedLead.referenceNo);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="rounded-lg border border-[#c5a059]/30 bg-[#031412] p-1.5 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#031412] transition-colors"
                    title="Copy reference code"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Launch Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppDraft}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{bn ? "হোয়াটসঅ্যাপে পরবর্তী ধাপ জানুন" : "Open WhatsApp Concierge Draft"}</span>
                </button>

                <p className="text-[11px] text-[#a3b8b0] leading-relaxed">
                  {bn ? (
                    <>
                      <strong>স্বচ্ছতা বিজ্ঞপ্তি:</strong> হোয়াটসঅ্যাপ ড্রাফট ওপেন হওয়া মানেই আবেদন সম্পন্ন হওয়া নয়। আমাদের টিম থেকে সরাসরি বার্তার উত্তর দেওয়ার পর ভেরিফিকেশন ও ট্রায়াল অ্যাকাউন্ট সক্রিয় করা হবে।
                    </>
                  ) : (
                    <>
                      <strong>Transparency Notice:</strong> Opening WhatsApp creates your prefilled draft. You must click Send in WhatsApp to contact our desk. SAFARIA does not claim an inquiry is confirmed until an operator acknowledges receipt.
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#a3b8b0] font-semibold">
                  {bn ? "এজেন্সির নাম *" : "Travel Agency Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder={bn ? "উদা: মেঘনা ট্রাভেলস ইন্টারন্যাশনাল" : "e.g. Meghna Travels International"}
                  className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#a3b8b0] font-semibold">
                    {bn ? "যোগাযোগকারীর নাম *" : "Contact Person *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={bn ? "উদা: রফিকুল ইসলাম" : "e.g. Rafiqul Islam"}
                    className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#a3b8b0] font-semibold">
                    {bn ? "জেলা / শহর *" : "District / Operating City *"}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#a3b8b0] font-semibold">
                    {bn ? "হোয়াটসঅ্যাপ নম্বর *" : "WhatsApp Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#a3b8b0] font-semibold">
                    {bn ? "ব্যবসায়িক ইমেইল (ঐচ্ছিক)" : "Business Email (Optional)"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@agency.com"
                    className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#a3b8b0] font-semibold">
                  {bn ? "মাসিক টিকেট ভলিউম" : "Expected Monthly Ticket Volume"}
                </label>
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full rounded-xl border border-[#c5a059]/30 bg-[#031412] px-3.5 py-2.5 text-sm text-[#f7f2ea] focus:border-[#c5a059] focus:outline-none"
                >
                  <option value="UNDER_20">{bn ? "২০টির নিচে" : "Under 20 tickets / month"}</option>
                  <option value="20_TO_50">{bn ? "২০ থেকে ৫০টি" : "20 to 50 tickets / month"}</option>
                  <option value="50_TO_100">{bn ? "৫০ থেকে ১০০টি" : "50 to 100 tickets / month"}</option>
                  <option value="OVER_100">{bn ? "১০০টির বেশি" : "Over 100 tickets / month"}</option>
                </select>
              </div>

              {/* Consent checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-[#a3b8b0]">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#c5a059] bg-[#031412] text-[#c5a059] focus:ring-0"
                  />
                  <span>
                    {bn
                      ? "আমি নিশ্চিত করছি যে আমাদের এজেন্সি তথ্য সঠিক এবং আমি SAFARIA-এর ভেরিফিকেশন ও প্রাইভেসি শর্তাবলীতে সম্মত।"
                      : "I agree to SAFARIA's verification and privacy terms, and confirm that an application does not guarantee automatic ticketing without written contract."}
                  </span>
                </label>
              </div>

              {submissionError && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                  {submissionError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#c5a059] px-6 py-3 text-sm font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors shadow-btn disabled:opacity-60"
              >
                {submitting ? (
                  <span>{bn ? "সংরক্ষণ করা হচ্ছে…" : "Saving Lead…"}</span>
                ) : (
                  <>
                    <span>{bn ? "আবেদন সেভ করুন ও হোয়াটসঅ্যাপে যান" : "Save Lead & Prepare WhatsApp"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* The 6 Operational Desks Showcase */}
      <section className="border-t border-[#c5a059]/20 bg-[#06201c]/40 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-[#c5a059] uppercase">
              {bn ? "পূর্ণাঙ্গ অপারেশনাল অবকাঠামো" : "Comprehensive B2B Infrastructure"}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#f7f2ea]">
              {bn ? "SAFARIA-এর ৬টি ডেডিকেটেড অপারেশনাল ডেস্ক" : "The 6 Core Operational Desks"}
            </h2>
            <p className="text-xs sm:text-sm text-[#a3b8b0] max-w-2xl mx-auto">
              {bn
                ? "প্রতিটি এজেন্সির কাজ নির্বিঘ্নে পরিচালনার জন্য আলাদা আলাদা বিশেষায়িত ডেস্ক।"
                : "A unified system replacing fragmented supplier phone calls with structured digital workflows."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PAIN_DETAILS.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-[#c5a059]/30 bg-[#06201c] p-6 space-y-4 hover:border-[#c5a059] transition-colors shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#031412] border border-[#c5a059]/30">
                    {p.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#c5a059]">{p.deskName}</span>
                </div>
                <h4 className="font-display text-lg font-bold text-[#f7f2ea]">
                  {bn ? p.badgeBn : p.badgeEn}
                </h4>
                <p className="text-xs text-[#a3b8b0] leading-relaxed">
                  {bn ? p.solutionBn : p.solutionEn}
                </p>
                <div className="pt-2 border-t border-[#c5a059]/15 flex items-center justify-between text-[11px]">
                  <span className="text-[#718b82]">{bn ? "সুবিধা:" : "Key Metric:"}</span>
                  <span className="font-semibold text-emerald-400">{bn ? p.metricBn : p.metricEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency Partner Testimonials Section (Social Proof) */}
      <section className="border-t border-[#c5a059]/20 bg-[#041916]/70 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3.5 py-1 text-xs font-semibold text-[#c5a059] uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              <span>{bn ? "পার্টনার এজেন্সিদের বাস্তব অভিজ্ঞতা" : "Verified Agency Partner Social Proof"}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#f7f2ea]">
              {bn
                ? "বাংলাদেশের শীর্ষস্থানীয় ট্রাভেল এজেন্সিসমূহ কেন SAFARIA বেছে নিয়েছে"
                : "Why Independent Agencies Across Bangladesh Scale with SAFARIA"}
            </h2>
            <p className="text-xs sm:text-sm text-[#a3b8b0] max-w-2xl mx-auto">
              {bn
                ? "ঢাকা, সিলেট ও চট্টগ্রামের স্বাধীন ও নন-আয়াটা এজেন্সিদের বাস্তব কর্মদক্ষতা ও সাফল্যের চিত্র।"
                : "Real operations leaders, real wholesale turnaround improvements, and zero airline naming penalties."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#c5a059]/30 bg-[#06201c] p-6 sm:p-7 shadow-lg transition-all hover:border-[#c5a059] hover:shadow-[0_12px_36px_rgba(197,160,89,0.15)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/40 bg-[#031412] px-2.5 py-0.5 text-[11px] font-semibold text-[#c5a059]">
                      <Award className="h-3 w-3" />
                      {t.tier}
                    </span>
                    <span className="font-mono text-[10px] text-[#a3b8b0] bg-[#031412] px-2 py-0.5 rounded border border-[#c5a059]/20">
                      {t.deskUsed}
                    </span>
                  </div>

                  {/* 5-star rating */}
                  <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-[#c5a059] text-[#c5a059]" />
                    ))}
                  </div>

                  {/* Operational impact callout */}
                  <div className="flex items-center gap-2 rounded-xl bg-[#031412] border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{bn ? t.metricBn : t.metricEn}</span>
                  </div>

                  {/* Quote Body */}
                  <div className="relative pl-3 border-l-2 border-[#c5a059]/40 text-xs sm:text-sm text-[#d1dfd9] leading-relaxed italic">
                    <Quote className="h-4 w-4 text-[#c5a059]/40 mb-1" />
                    <span>&ldquo;{bn ? t.quoteBn : t.quoteEn}&rdquo;</span>
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 mt-4 border-t border-[#c5a059]/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#f7f2ea]">{t.agencyName}</h4>
                    <p className="text-[11px] text-[#718b82]">
                      {t.contactName} • <span className="text-[#a3b8b0]">{bn ? t.roleBn : t.roleEn}</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-[#a3b8b0] bg-[#031412] px-2.5 py-1 rounded-lg border border-[#c5a059]/20">
                    <MapPin className="h-3 w-3 text-[#c5a059]" />
                    <span>{bn ? t.locationBn : t.locationEn}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Stats Bar */}
          <div className="rounded-2xl border border-[#c5a059]/30 bg-[#031412] p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[#c5a059]">১২ মি.</span>
              <span className="text-[11px] text-[#a3b8b0]">{bn ? "গড় কোটেশন এসএলএ" : "Average Quote SLA"}</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-emerald-400">৳০</span>
              <span className="text-[11px] text-[#a3b8b0]">{bn ? "পাসপোর্ট নাম পেনাল্টি" : "Naming Discrepancy Fines"}</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[#c5a059]">০%</span>
              <span className="text-[11px] text-[#a3b8b0]">{bn ? "লুকানো নিজস্ব মার্কআপ" : "Hidden SAFARIA Markup"}</span>
            </div>
            <div>
              <span className="block font-display text-2xl sm:text-3xl font-bold text-[#f7f2ea]">২৪/৭</span>
              <span className="text-[11px] text-[#a3b8b0]">{bn ? "জরুরি রি-ইস্যু ও ওয়েভার" : "Emergency Flight Support"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="border-t border-[#c5a059]/20 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3.5 py-1 text-xs font-semibold text-[#c5a059] uppercase tracking-wider">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{bn ? "সাধারণ প্রশ্নোত্তর" : "Frequently Asked Questions"}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#f7f2ea]">
              {bn ? "৭২ ঘণ্টার পাইলট ও ৬টি ডেস্ক সম্পর্কে সব তথ্য" : "Answers on the 72-Hour Pilot & 6 Operational Desks"}
            </h2>
            <p className="text-xs sm:text-sm text-[#a3b8b0]">
              {bn
                ? "এজেন্সি পার্টনারশিপ, পাইলট ট্রায়াল সীমা ও দৈনিক পরিচালনা সম্পর্কিত স্পষ্ট বিবরণ।"
                : "Clear operational details regarding trial limits, desk coverage, and commercial transparency."}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="FAQ Categories">
            {[
              { id: "all", labelBn: "সব প্রশ্ন", labelEn: "All Questions" },
              { id: "pilot", labelBn: "৭২ ঘণ্টার পাইলট", labelEn: "72-Hour Pilot" },
              { id: "desks", labelBn: "৬টি অপারেশনাল ডেস্ক", labelEn: "6 Operational Desks" },
              { id: "commercial", labelBn: "বাণিজ্যিক ও মূল্য", labelEn: "Commercial & Pricing" },
            ].map((cat) => {
              const active = faqCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFaqCategory(cat.id as typeof faqCategory)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#c5a059] text-[#031412] shadow-md shadow-[#c5a059]/20"
                      : "bg-[#06201c] text-[#a3b8b0] hover:text-[#f7f2ea] border border-[#c5a059]/20"
                  }`}
                >
                  {bn ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {FAQS.filter((f) => faqCategory === "all" || f.category === faqCategory).map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#c5a059]/30 bg-[#06201c] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-body-${faq.id}`}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-[#031412]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#031412] border border-[#c5a059]/30 text-xs font-bold text-[#c5a059]">
                        ?
                      </span>
                      <span className="font-display text-sm sm:text-base font-bold text-[#f7f2ea]">
                        {bn ? faq.questionBn : faq.questionEn}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-[#c5a059]">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-body-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="overflow-hidden border-t border-[#c5a059]/20 bg-[#031412]/60 px-5 py-4 sm:px-6 sm:py-5"
                      >
                        <p className="text-xs sm:text-sm text-[#a3b8b0] leading-relaxed">
                          {bn ? faq.answerBn : faq.answerEn}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Quick Concierge Support Bar */}
          <div className="rounded-2xl border border-[#c5a059]/30 bg-gradient-to-r from-[#06201c] via-[#041916] to-[#06201c] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <strong className="text-sm font-bold text-[#f7f2ea] block">
                {bn ? "অন্য কোনো বিশেষ অপারেশনাল প্রশ্ন আছে?" : "Have a specific agency workflow question?"}
              </strong>
              <p className="text-xs text-[#a3b8b0]">
                {bn
                  ? "আমাদের সেন্ট্রাল পার্টনার ডেস্কে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।"
                  : "Speak directly with our B2B onboarding lead via verified WhatsApp channel."}
              </p>
            </div>
            <a
              href={whatsappHrefFor("Hello SAFARIA B2B Operations, I would like to consult about our agency's operational requirements.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-xs font-bold text-[#031412] hover:bg-[#20ba59] transition-all shadow-md flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{bn ? "হোয়াটসঅ্যাপে কথা বলুন" : "Chat on WhatsApp"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Transparent Entitlement Disclosure */}
      <section className="border-t border-[#c5a059]/20 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#c5a059]/30 bg-[#06201c] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-[#c5a059]" />
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#c5a059]">
              {bn ? "পাইলট মেম্বারশিপ ও অপারেশনাল নিয়মাবলী" : "Pilot Entitlements & Operational Governance"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#c5a059]/20 bg-[#031412] p-4 space-y-2">
              <strong className="text-[#f7f2ea] font-bold block">
                {bn ? "৭২ ঘণ্টার পাইলট ট্রায়াল সীমা:" : "72-Hour Pilot Trial Entitlements:"}
              </strong>
              <ul className="space-y-1 text-[#a3b8b0]">
                <li>• {PILOT_ENTITLEMENTS.fareRequestsLimit} {bn ? "টি FareDesk™ কোটেশন রিকোয়েস্ট" : "FareDesk™ quotation requests"}</li>
                <li>• {PILOT_ENTITLEMENTS.bookingRequestsLimit} {bn ? "টি BookingDesk™ পিএনআর প্রসেসিং" : "BookingDesk™ assisted bookings"}</li>
                <li>• {PILOT_ENTITLEMENTS.afterCareLimit} {bn ? "টি AfterCare Desk™ রিরুটিং/রিফান্ড কেস" : "AfterCare Desk™ support cases"}</li>
                <li>• {PILOT_ENTITLEMENTS.seatsLimit} {bn ? "টি টিম সিট" : "Team seats included"}</li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#c5a059]/20 bg-[#031412] p-4 space-y-2">
              <strong className="text-[#f7f2ea] font-bold block">
                {bn ? "০% মার্কআপের আইনি শর্ত:" : "0% Markup Commercial Scope:"}
              </strong>
              <p className="text-[#a3b8b0] leading-relaxed">
                {bn
                  ? "শুধু যোগ্য এয়ার টিকিটে SAFARIA-এর নিজস্ব মার্কআপ ০%; এয়ারলাইন কর ও সরবরাহকারীর ফি এর বাইরে। বুকিং ও ক্রেডিট সুবিধা আলাদা লিখিত শর্ত সাপেক্ষে।"
                  : "0% SAFARIA markup applies solely to eligible air tickets. Airline taxes and third-party supplier fees are excluded. Ticket issuance requires verified settlement."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c5a059]/20 bg-[#031412] px-4 py-8 text-center text-xs text-[#a3b8b0] space-y-3">
        <p>© 2026 SAFARIA Tours &amp; Travels. Dhaka, Bangladesh. All rights reserved.</p>
        <p className="text-[11px] text-[#718b82]">
          B2B Travel SaaS Platform • Support WhatsApp: +{SAFARIA_CONFIG.whatsappNumber}
        </p>
      </footer>
    </div>
  );
}
