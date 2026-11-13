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
  Radio,
  ArrowUpRight,
} from "lucide-react";
import { SAFARIA_CONFIG, AGENCY_PRICING, PILOT_ENTITLEMENTS, whatsappHrefFor } from "@/config/constants";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { B2BThreeCommandHub } from "@/components/b2b-three-hub";

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
    solutionBn: "FareDesk™-এ এজেন্সির ফেয়ার অনুরোধ, প্রয়োজনীয় তথ্য এবং ফলো-আপ একটি প্রক্রিয়ায় সংগঠিত করুন। সরবরাহকারীর কোটেশন চুক্তি ও নিশ্চিতকরণসাপেক্ষ।",
    solutionEn: "Organize agency fare requests and follow-ups in one workflow. Supplier quotes depend on finalized contracts and confirmation.",
    metricBn: "সংগঠিত ফেয়ার রিকোয়েস্ট",
    metricEn: "Structured fare requests",
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
    solutionBn: "BookingDesk™-এ যাত্রীর তথ্য, অনুরোধ ও অগ্রগতি সংগঠিত করুন; বাস্তব বুকিং ও PNR ইস্যু অনুমোদিত সরবরাহকারীর ওপর নির্ভরশীল।",
    solutionEn: "Manage booking requests, passenger details and status. Live PNR holds and issuance require authorized supplier access.",
    metricBn: "রিকোয়েস্ট ও স্ট্যাটাস ট্র্যাকিং",
    metricEn: "Request status tracking",
    icon: <Ticket className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_PAYMENT",
    deskName: "ClearMargin™",
    badgeBn: "স্বচ্ছ মার্জিন",
    badgeEn: "Transparent Fee Records",
    titleBn: "লুকানো চার্জ ও হিসাব মেলানোর ঝামেলা",
    titleEn: "Hidden Markups & Confusing Sub-Agent Ledgers",
    descBn: "মাস শেষে সাপ্লায়ারের অ্যাকাউন্টে হিসাব মেলে না; অস্পষ্ট ফি এজেন্সির মার্জিন খেয়ে ফেলে।",
    descEn: "Traditional vendors hide obscure surcharges that silently erode your hard-earned agency commission.",
    solutionBn: "ClearMargin™-এ অনুমোদিত বুকিংয়ের খরচ, ফি ও মার্জিন নথিভুক্ত করার ওয়ার্কফ্লো দেখুন; প্রকৃত কমিশন চুক্তি অনুযায়ী নির্ধারিত হবে।",
    solutionEn: "Explore structured cost, fee and margin records. Actual agency commissions require confirmed written commercial terms.",
    metricBn: "লিখিত চার্জ ব্রেকডাউন",
    metricEn: "Documented fee breakdown",
    icon: <TrendingUp className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_AFTERCARE",
    deskName: "AfterCare Desk™",
    badgeBn: "আফটার-কেয়ার",
    badgeEn: "24/7 Staffed Contact",
    titleBn: "ফ্লাইট বাতিল, রি-ইস্যু বা রিফান্ডে সহায়তা না পাওয়া",
    titleEn: "Emergency Reissues, Waivers & Refund Delays",
    descBn: "যাত্রীর জরুরি রিরুটিং বা ফ্লাইট পরিবর্তনের সময় সাপ্লায়ারের কোনো সাপোর্ট পাওয়া যায় না।",
    descEn: "When airlines reschedule or passengers request urgent reissues, standard vendor lines go silent.",
    solutionBn: "SAFARIA-এর ২৪/৭ সাপোর্ট টিমে ফলো-আপ অনুরোধ জানান। এয়ারলাইন ওয়েভার, রি-ইস্যু বা রিফান্ডের সিদ্ধান্ত সংশ্লিষ্ট সরবরাহকারীর।",
    solutionEn: "Reach our staffed 24/7 support team for follow-up. Airline waivers, reissues and refunds depend on provider rules.",
    metricBn: "২৪/৭ টিমে যোগাযোগ",
    metricEn: "24/7 staffed contact",
    icon: <Headphones className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_TRUST",
    deskName: "Verified Workflow™",
    badgeBn: "নাম ও পাসপোর্ট অডিট",
    badgeEn: "Passenger Data Checks",
    titleBn: "যাত্রীর নামে ভুল হয়ে পেনাল্টি ও ক্লায়েন্ট অসন্তোষ",
    titleEn: "Passenger Name Mismatches & Heavy Airline Penalties",
    descBn: "পাসপোর্টের নামের সাথে টিকেটের অমিলের কারণে হাজার হাজার টাকার পেনাল্টি গুনতে হয়।",
    descEn: "A single misspelled character or maiden name discrepancy results in hefty airline re-issuance fines.",
    solutionBn: "Verified Workflow™-এ দেওয়া নাম ও পাসপোর্ট মেয়াদ যাচাই করার সহায়ক টুল ব্যবহার করুন; চূড়ান্ত নিয়ম এয়ারলাইনভেদে আলাদা।",
    solutionEn: "Use passenger-name and passport-expiry checks as a pre-issuance aid; airlines retain final acceptance rules.",
    metricBn: "নাম ও ডকুমেন্ট চেক",
    metricEn: "Name and document checks",
    icon: <FileCheck className="h-5 w-5 text-[#c5a059]" />,
  },
  {
    id: "PAIN_GROWTH",
    deskName: "PartnerGrowth™",
    badgeBn: "এজেন্সি স্কেলিং",
    badgeEn: "Partner Growth Planning",
    titleBn: "ছোট বা স্বাধীন এজেন্সির জন্য কোনো ইনসেন্টিভ না থাকা",
    titleEn: "Zero Volume Incentives for Independent Agencies",
    descBn: "বড় আয়াটা এজেন্সি সব ইনসেন্টিভ পায়, আর স্বাধীন ও লোকাল এজেন্সিগুলো পিছিয়ে পড়ে।",
    descEn: "Independent agencies handle substantial ticket volume but receive zero volume recognition from airlines.",
    solutionBn: "PartnerGrowth™-এ পার্টনার অনুরোধ ও পারফরম্যান্স ট্র্যাকিং পরিকল্পনা দেখুন। কমিশন ও ইনসেন্টিভ চুক্তি সম্পন্ন না হওয়া পর্যন্ত ঘোষণা করা হচ্ছে না।",
    solutionEn: "Explore partner activity tracking. Commission and incentive rates will be offered only under finalized written agreements.",
    metricBn: "পার্টনার আগ্রহ নিবন্ধন",
    metricEn: "Partner pre-registration",
    icon: <Sparkles className="h-5 w-5 text-[#c5a059]" />,
  },
];

const BD_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh",
  "Cox's Bazar", "Comilla", "Narayanganj", "Gazipur", "Brahmanbaria", "Bogra", "Jessore",
  "Feni", "Dinajpur", "Tangail", "Faridpur", "Pabna", "Noakhali", "Kushtia", "Sirajganj",
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
  const [selectedCorridorHook, setSelectedCorridorHook] = useState<string>("DAC ➔ JED / RUH / MED");
  const leadFormCardRef = React.useRef<HTMLDivElement>(null);

  const activePain = PAIN_DETAILS.find((p) => p.id === selectedPain) || PAIN_DETAILS[0];

  const handleSelectOfferHook = (
    pain: PainCategory,
    plan: "MONTHLY" | "ANNUAL",
    corridorLabel: string,
  ) => {
    setSelectedPain(pain);
    setSelectedPlan(plan);
    setSelectedCorridorHook(corridorLabel);
    if (leadFormCardRef.current) {
      leadFormCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      animate(leadFormCardRef.current, {
        scale: [0.98, 1.015, 1],
        duration: 420,
        ease: "outBack",
      });
    }
  };

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
              ? "স্বাধীন ট্রাভেল এজেন্সির জন্য ৬টি অপারেশনাল ডেস্কের ওয়ার্কফ্লো, ২৪/৭ সাপোর্ট টিম ও আগাম পার্টনারশিপ নিবন্ধন। এয়ারলাইন/সাপ্লায়ার চুক্তি আলোচনা পর্যায়ে।"
              : "Explore six agency desk workflows and staffed 24/7 support. Partner registrations are open while airline and supplier agreements are being negotiated."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300 font-medium">
              ✦ {bn ? "যাচাইসাপেক্ষ পাইলট ডেমো" : "Pilot demo on approval"}
            </span>
            <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[#c5a059] font-medium">
              ✦ {bn ? "পার্টনার প্রি-রেজিস্ট্রেশন" : "Partner pre-registration"}
            </span>
            <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[#c5a059] font-medium">
              ✦ {bn ? "৬টি অপারেশনাল ডেস্ক" : "6 Operational Desks"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <a
              href="#b2b-subscription-enquiry"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c5a059] px-5 py-3 text-xs sm:text-sm font-bold text-[#031412] hover:bg-[#d6b26c] transition-all shadow-lg"
            >
              <span>
                {bn ? "B2B পার্টনার হতে আগ্রহ জানান" : "Register B2B partnership interest"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={SAFARIA_CONFIG.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#10b981]/60 bg-[#06201c] px-5 py-3 text-xs sm:text-sm font-bold text-[#10b981] hover:bg-[#10b981] hover:text-[#031412] transition-all"
            >
              <Radio className="h-4 w-4" />
              <span>
                {bn ? "অফিসিয়াল B2B WhatsApp চ্যানেলে যুক্ত হোন" : "Join Official B2B WhatsApp Channel"}
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Three.js 3D Command Core & Bangladeshi B2B Offer Hooks */}
      <B2BThreeCommandHub
        bn={bn}
        selectedPain={selectedPain}
        onSelectHook={handleSelectOfferHook}
      />

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
        <div
          id="b2b-subscription-enquiry"
          ref={leadFormCardRef}
          className="rounded-2xl border border-[#c5a059]/40 bg-[#06201c] p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/40 bg-[#031412] px-3 py-0.5 font-mono text-[10px] font-bold text-[#10b981]">
              <span>{bn ? "নির্বাচিত করিডোর ফোকাস:" : "SELECTED CORRIDOR FOCUS:"}</span>
              <span className="text-[#c5a059]">{selectedCorridorHook}</span>
            </span>
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
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppDraft}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{bn ? "হোয়াটসঅ্যাপে পরবর্তী ধাপ জানুন" : "Open WhatsApp Concierge Draft"}</span>
                </button>

                <a
                  href={SAFARIA_CONFIG.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#c5a059]/50 bg-[#06201c] px-5 py-2.5 text-xs font-bold text-[#c5a059] hover:bg-[#c5a059] hover:text-[#031412] transition-colors"
                >
                  <Radio className="h-4 w-4" />
                  <span>
                    {bn
                      ? "অফিসিয়াল B2B WhatsApp চ্যানেলে যুক্ত হোন (ডেইলি ফেয়ার অ্যালার্ট)"
                      : "Follow Official B2B WhatsApp Channel (Daily Fare Alerts)"}
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>

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

      {/* Pre-registration proof of process — never display invented agency reviews */}
      <section className="border-t border-[#c5a059]/20 bg-[#041916]/70 px-4 py-16 sm:px-8" aria-labelledby="partner-launch-heading">
        <div className="mx-auto max-w-6xl space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c5a059]">
            {bn ? "বর্তমান অংশীদারিত্বের অবস্থা" : "PARTNERSHIP LAUNCH STATUS"}
          </p>
          <h2 id="partner-launch-heading" className="font-display text-2xl sm:text-4xl font-bold text-[#f7f2ea]">
            {bn ? "প্রথমেই স্বচ্ছতা, তারপর পার্টনারশিপ।" : "Clarity before commercial commitments."}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-[#a3b8b0]">
            {bn
              ? "আমাদের B2B ওয়ার্কফ্লো ও সাপোর্ট টিম সম্পর্কে জেনে আগাম আগ্রহ নিবন্ধন করুন। এয়ারলাইন ও সরবরাহকারীদের সঙ্গে চুক্তি আলোচনাধীন। লাইভ টিকেটিং, কমিশন, ইনভেন্টরি ও চূড়ান্ত মূল্য এখনো নিশ্চিত নয়।"
              : "Register interest in our B2B workflows and support team. Airline and supplier agreements are under negotiation; live ticketing, commissions, inventory and final commercial terms are not yet confirmed."}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [bn ? "ওয়ার্কফ্লো ডেমো" : "Workflow preview", bn ? "৬টি অপারেশনাল ডেস্কের সম্ভাব্য ব্যবহার দেখুন।" : "Explore how the six operations desks are designed to work."],
              [bn ? "২৪/৭ সাপোর্ট টিম" : "24/7 support staff", bn ? "অনুরোধ ও ফলো-আপের জন্য আমাদের টিমে যোগাযোগ করুন।" : "Contact our staffed team for questions and follow-up."],
              [bn ? "যাচাইসাপেক্ষ পরবর্তী ধাপ" : "Verification-first onboarding", bn ? "চুক্তি ও অনুমোদন নিশ্চিত হলে লিখিত শর্ত জানানো হবে।" : "Receive written commercial terms after supplier and approval checks."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-[#c5a059]/25 bg-[#06201c] p-5">
                <h3 className="font-semibold text-[#f7f2ea]">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#a3b8b0]">{desc}</p>
              </div>
            ))}
          </div>
          <a href="#b2b-subscription-enquiry" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#c5a059] px-5 py-3 text-sm font-bold text-[#031412]">
            {bn ? "এজেন্সি আগ্রহ নিবন্ধন করুন" : "Register agency interest"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
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
