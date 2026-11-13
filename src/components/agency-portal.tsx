"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TrendingUp, Calculator, CheckCircle2, Users, Sparkles, ArrowUpRight, Radio } from "lucide-react";
import { animate, stagger } from "animejs";
import {
  agencyErrors,
  agencyWhatsappHref,
  initialAgencyFields,
  type AgencyFields,
} from "@/lib/agency";
import { AGENCY_PRICING, SAFARIA_CONFIG } from "@/config/constants";
import { focusInvalidField } from "@/lib/validation-motion";
import type { Language } from "@/lib/atlas-data";

function createAgencyFallbackRef(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `B2B-${dateStr}-${rand}`;
}

const ONBOARDING_STEPS = [
  {
    id: 0,
    bnLabel: "১. এজেন্সি প্রোফাইল",
    enLabel: "1. Agency Profile",
    bnDesc: "আবেদনের ধরন, এজেন্সির নাম ও অবস্থান",
    enDesc: "Application tier, agency identity & location",
  },
  {
    id: 1,
    bnLabel: "২. ব্যবসায়িক পরিধি",
    enLabel: "2. Commercial Scope",
    bnDesc: "অভিজ্ঞতা, মাসিক টিকেট ভলিউম ও প্রধান চাহিদা",
    enDesc: "Operating history, monthly ticket volume & primary desk",
  },
  {
    id: 2,
    bnLabel: "৩. যোগাযোগ ও সম্মতি",
    enLabel: "3. Contact & Verification",
    bnDesc: "প্রধান যোগাযোগকারী এবং ৭২ ঘণ্টার ট্রায়াল শর্ত",
    enDesc: "Lead contact details & 72-hour pilot verification terms",
  },
] as const;

interface B2BMarketingHook {
  id: string;
  corridor: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  hookBn: string;
  hookEn: string;
  marginTagBn: string;
  marginTagEn: string;
  requirement: "air" | "tour" | "hotel" | "visa" | "other";
  prefillNoteBn: string;
  prefillNoteEn: string;
}

const B2B_OFFER_HOOKS: B2BMarketingHook[] = [
  {
    id: "umrah-ksa",
    corridor: "DAC ➔ JED / RUH",
    badgeBn: "সৌদি ও ওমরাহ ব্লক",
    badgeEn: "Saudi & Umrah Blocks",
    titleBn: "ওমরাহ কাফেলা ও সৌদি লেবার ফেয়ার",
    titleEn: "Umrah Group PNR & Saudi Worker Net Fares",
    hookBn: "০% SAFARIA মার্কআপে জেদ্দা ও রিয়াদ রুটে গ্রুপ সিট হোল্ড এবং পাসপোর্ট নাম অডিট।",
    hookEn: "Lock group seat blocks on DAC–JED/RUH with 0% SAFARIA markup and pre-issuance name audit.",
    marginTagBn: "গড় মার্জিন +৳৩,২০০/টিকেট",
    marginTagEn: "Avg Margin +৳3,200/pax",
    requirement: "air",
    prefillNoteBn: "সৌদি ওমরাহ ও জেদ্দা/রিয়াদ গ্রুপ ব্লক হোলসেল ফেয়ারে আগ্রহী।",
    prefillNoteEn: "Interested in Saudi Umrah & DAC-JED/RUH wholesale group blocks.",
  },
  {
    id: "gulf-expat",
    corridor: "DAC ➔ DXB / DOH",
    badgeBn: "মধ্যপ্রাচ্য এক্সপ্যাট হাব",
    badgeEn: "Gulf Expat Corridors",
    titleBn: "দুবাই, শারজাহ ও কাতার ইনস্ট্যান্ট নেট কোট",
    titleEn: "Dubai, Doha & Gulf Expat Wholesale Desk",
    hookBn: "জিডিএস ছাড়াই ১২ মিনিটে এমিরেটস, কাতার ও বিমানের নেট ফেয়ার কোটেশন এবং ২৪/৭ রি-ইস্যু।",
    hookEn: "12-minute FareDesk™ net quotes on Emirates, Qatar & Biman without GDS terminal overhead.",
    marginTagBn: "১২ মি. ফাস্ট কোট SLA",
    marginTagEn: "12-Min Net Quote SLA",
    requirement: "air",
    prefillNoteBn: "দুবাই ও মধ্যপ্রাচ্য রুটে দ্রুত হোলসেল এয়ার টিকিট কোটেশনে আগ্রহী।",
    prefillNoteEn: "Interested in rapid wholesale net fares for UAE & Gulf corridors.",
  },
  {
    id: "student-longhaul",
    corridor: "DAC ➔ LON / YTO",
    badgeBn: "স্টুডেন্ট ও লং-হল",
    badgeEn: "Student & UK/Canada",
    titleBn: "সিলেট-লন্ডন, টরন্টো ও স্টুডেন্ট ব্যাগেজ ফেয়ার",
    titleEn: "UK, Canada & Student Extra-Baggage Fares",
    hookBn: "শিক্ষার্থী ও প্রবাসী যাত্রীদের জন্য অতিরিক্ত ব্যাগেজ এবং জটিল মাল্টি-সিটি স্প্লিট পিএনআর সাপোর্ট।",
    hookEn: "Student extra-baggage allocations and error-free multi-city split ticketing for UK & Canada.",
    marginTagBn: "৳০ নাম-পেনাল্টি গ্যারান্টি",
    marginTagEn: "Zero Naming Fine Gate",
    requirement: "air",
    prefillNoteBn: "ইউকে, কানাডা ও স্টুডেন্ট রুটের স্পেশাল ফেয়ার এবং ভিসা সাপোর্টে আগ্রহী।",
    prefillNoteEn: "Interested in UK/Canada student airfares and split-ticket PNR support.",
  },
  {
    id: "asean-visa-pack",
    corridor: "DAC ➔ KUL / SIN / BKK",
    badgeBn: "আসিয়ান ভিসা ও ট্যুর",
    badgeEn: "ASEAN Visa & Holidays",
    titleBn: "মালয়েশিয়া, সিঙ্গাপুর ও থাইল্যান্ড B2B প্যাক",
    titleEn: "Malaysia, Singapore & Bangkok B2B Combos",
    hookBn: "এয়ার টিকিটের পাশাপাশি ভিসা প্রসেসিং, হোটেল ও ট্রান্সফার কম্বোতে এজেন্সির জন্য বাড়তি কমিশন।",
    hookEn: "Bundle wholesale airfares with visa assistance, hotels, and airport transfers for higher agency yield.",
    marginTagBn: "কম্বো মার্জিন বুস্টার",
    marginTagEn: "High-Yield Land + Air",
    requirement: "visa",
    prefillNoteBn: "মালয়েশিয়া, সিঙ্গাপুর ও থাইল্যান্ডের ভিসা, ট্যুর ও এয়ার টিকিট B2B প্যাকেজে আগ্রহী।",
    prefillNoteEn: "Interested in ASEAN visa, holiday packages, and wholesale air ticketing.",
  },
];

export function AgencyPortal({ language }: { language: Language }) {
  const bn = language === "bn";
  const [fields, setFields] = useState<AgencyFields>(initialAgencyFields);
  const [touched, setTouched] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showMarkup, setShowMarkup] = useState(false);
  const [simTickets, setSimTickets] = useState<number>(35);
  const [animatedSavings, setAnimatedSavings] = useState<number>(35 * 2200);
  const [activeOnboardingStep, setActiveOnboardingStep] = useState<number>(0);
  const [activeHookId, setActiveHookId] = useState<string>("umrah-ksa");

  const priceRef = useRef<HTMLElement>(null);
  const formFieldsRef = useRef<HTMLDivElement>(null);
  const stepBannerRef = useRef<HTMLDivElement>(null);
  const hooksGridRef = useRef<HTMLDivElement>(null);
  const communityCardRef = useRef<HTMLDivElement>(null);
  const orbitRingRef = useRef<SVGCircleElement>(null);

  const errors = agencyErrors(fields);
  const set = <K extends keyof AgencyFields>(key: K, value: AgencyFields[K]) =>
    setFields((current) => ({ ...current, [key]: value }));
  const touch = (key: string) =>
    setTouched((current) => (current.includes(key) ? current : [...current, key]));
  const invalid = (key: string) => errors.includes(key) && (touched.includes(key) || submitted);
  const message = (key: string) =>
    invalid(key) && (
      <small className="field-error">{bn ? "এই তথ্যটি যাচাই করুন" : "Please check this field"}</small>
    );

  // anime.js continuous orbital pulse on the B2B Network Hub SVG & initial hook cards entrance
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (orbitRingRef.current) {
      animate(orbitRingRef.current, {
        strokeDashoffset: [180, 0],
        duration: 6000,
        loop: true,
        ease: "linear",
      });
    }
  }, []);

  // anime.js animated ROI counter when ticket slider changes
  useEffect(() => {
    const targetVal = simTickets * 2200;
    const isReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obj = { val: animatedSavings };
    const animInstance = animate(obj, {
      val: targetVal,
      duration: isReduced ? 1 : 420,
      ease: "outQuad",
      onUpdate: () => setAnimatedSavings(Math.round(obj.val)),
    });
    return () => {
      animInstance.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simTickets]);

  // anime.js subtle scale pop on price display when plan toggles
  useEffect(() => {
    if (!priceRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    animate(priceRef.current, {
      scale: [0.95, 1],
      duration: 320,
      ease: "outBack",
    });
  }, [fields.interest]);

  // anime.js sequential reveal animation when navigating between Agency Onboarding Wizard steps
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (stepBannerRef.current) {
      animate(stepBannerRef.current, {
        opacity: [0.5, 1],
        translateY: [6, 0],
        duration: 280,
        ease: "outQuad",
      });
    }

    if (formFieldsRef.current) {
      const stageFields = formFieldsRef.current.querySelectorAll(
        `[data-onboarding-step="${activeOnboardingStep}"]`,
      );
      if (stageFields.length > 0) {
        animate(stageFields, {
          opacity: [0.35, 1],
          translateY: [10, 0],
          scale: [0.985, 1],
          delay: stagger(55),
          duration: 380,
          ease: "outExpo",
        });
      }
    }
  }, [activeOnboardingStep]);

  const handleSelectMarketingHook = (hook: B2BMarketingHook) => {
    setActiveHookId(hook.id);
    set("requirement", hook.requirement);
    set("businessNotes", bn ? hook.prefillNoteBn : hook.prefillNoteEn);
    setActiveOnboardingStep(1);

    const isReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isReduced && hooksGridRef.current) {
      const cards = hooksGridRef.current.querySelectorAll(".b2b-hook-card");
      animate(cards, {
        scale: [0.985, 1],
        delay: stagger(35),
        duration: 320,
        ease: "outQuad",
      });
    }
  };

  function input(
    key: "agencyName" | "location" | "website" | "years" | "volume" | "fullName" | "phone" | "email",
    label: string,
    stepGroup: number,
    type = "text",
  ) {
    const isFocusedStage = activeOnboardingStep === stepGroup;
    return (
      <label
        className={`field transition-shadow ${isFocusedStage ? "ring-1 ring-[#386258]/35 rounded-lg p-1.5 -m-1.5 bg-[#fffdf7]/60" : ""}`}
        data-onboarding-step={stepGroup}
        onFocusCapture={() => {
          if (activeOnboardingStep !== stepGroup) setActiveOnboardingStep(stepGroup);
        }}
      >
        {label}
        <input
          data-agency-field={key}
          type={type}
          value={fields[key]}
          onChange={(event) => set(key, event.target.value)}
          onBlur={() => touch(key)}
          aria-invalid={invalid(key)}
          autoComplete={
            key === "fullName" ? "name" : key === "phone" ? "tel" : key === "email" ? "email" : undefined
          }
          min={key === "years" ? 0 : undefined}
          max={key === "years" ? 150 : undefined}
          maxLength={key === "phone" ? 24 : 120}
        />
        {message(key)}
      </label>
    );
  }

  function select(
    key: "applicationType" | "businessStatus" | "requirement" | "contactMethod",
    label: string,
    stepGroup: number,
    options: [string, string, string][],
  ) {
    const isFocusedStage = activeOnboardingStep === stepGroup;
    return (
      <label
        className={`field transition-shadow ${isFocusedStage ? "ring-1 ring-[#386258]/35 rounded-lg p-1.5 -m-1.5 bg-[#fffdf7]/60" : ""}`}
        data-onboarding-step={stepGroup}
        onFocusCapture={() => {
          if (activeOnboardingStep !== stepGroup) setActiveOnboardingStep(stepGroup);
        }}
      >
        {label}
        <select
          data-agency-field={key}
          value={fields[key]}
          onChange={(event) => set(key, event.target.value)}
          onBlur={() => touch(key)}
          aria-invalid={invalid(key)}
        >
          <option value="">{bn ? "নির্বাচন করুন" : "Select"}</option>
          {options.map(([value, b, e]) => (
            <option value={value} key={value}>
              {bn ? b : e}
            </option>
          ))}
        </select>
        {message(key)}
      </label>
    );
  }

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    referenceNo: string;
    whatsAppUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.length) {
      focusInvalidField(`[data-agency-field="${errors[0]}"]`);
      return;
    }

    const fallbackWhatsApp = agencyWhatsappHref(fields, language);
    if (typeof window !== "undefined") {
      (window as unknown as { __draftUrl?: string }).__draftUrl = fallbackWhatsApp;
    }

    setSubmitting(true);
    try {
      const vol = fields.volume.toLowerCase();
      const monthlyVol = vol.includes("100")
        ? "OVER_100"
        : vol.includes("50")
          ? "50_TO_100"
          : vol.includes("20")
            ? "20_TO_50"
            : "UNDER_20";
      const tradeLic =
        fields.website.trim() || `TL-${(fields.location || "DHK").slice(0, 3).toUpperCase()}-PENDING`;
      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName: fields.agencyName.trim(),
          contactPerson: fields.fullName.trim(),
          phone: fields.phone.trim(),
          email: fields.email.trim(),
          city: fields.location.trim() || "Dhaka",
          tradeLicenseNumber: tradeLic,
          yearsInBusiness: Number(fields.years) || 1,
          monthlyTicketVolume: monthlyVol,
          notes: `[Plan: ${fields.interest}] [Type: ${fields.applicationType}] [Req: ${fields.requirement}] ${fields.businessNotes}`.trim(),
          consentAgreed: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.referenceNo) {
        setSubmittedData({
          referenceNo: data.referenceNo,
          whatsAppUrl: data.whatsAppUrl || fallbackWhatsApp,
        });
      } else {
        setSubmittedData({
          referenceNo: createAgencyFallbackRef(),
          whatsAppUrl: fallbackWhatsApp,
        });
      }
    } catch {
      setSubmittedData({
        referenceNo: createAgencyFallbackRef(),
        whatsAppUrl: fallbackWhatsApp,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const annual = fields.interest === "annualPlan";
  const number = (value: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(value);
  const currentStepMeta = ONBOARDING_STEPS[activeOnboardingStep] ?? ONBOARDING_STEPS[0];

  return (
    <section id="sf-agency" className="content-section agency-section" aria-labelledby="agency-title">
      <div className="section-heading">
        <p className="eyebrow">04 / AGENCY PARTNERS &amp; B2B SUBSCRIPTION</p>
        <h2 id="agency-title" className="display-heading">
          {bn ? "এজেন্সির জন্য নতুন সম্ভাবনা" : "Built for travel agencies"}
        </h2>
        <p>
          {bn
            ? "নন-আয়াটা ও স্বাধীন ট্রাভেল এজেন্সির জন্য ০% SAFARIA মার্কআপে হোলসেল ফেয়ার, ৬টি অপারেশনাল ডেস্ক এবং ৭২ ঘণ্টার পাইলট সুবিধা।"
            : "Empowering Bangladeshi travel agencies with 0% SAFARIA markup, 6 dedicated operational desks, and a 72-hour verified pilot."}
        </p>
      </div>

      {/* High-Converting B2B Corridor & Offer Hooks Bar (Tailored for Bangladeshi Sub-Agents) */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#cfb57c] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[#10b981]" />
            <span>
              {bn
                ? "বাংলাদেশি এজেন্সির জন্য হাই-মার্জিন রুট ও অফার হুক (ক্লিক করে আবেদন প্রি-ফিল করুন)"
                : "High-Margin Bangladeshi B2B Corridor Hooks (Click to pre-fill subscription enquiry)"}
            </span>
          </div>
          <a
            href={SAFARIA_CONFIG.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#10b981]/50 bg-[#06241e] px-3 py-1.5 text-xs font-bold text-[#10b981] hover:bg-[#10b981] hover:text-[#041713] transition-colors self-start sm:self-auto"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>
              {bn ? "অফিসিয়াল B2B WhatsApp চ্যানেলে যুক্ত হোন" : "Join Official B2B WhatsApp Channel"}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div ref={hooksGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {B2B_OFFER_HOOKS.map((hook) => {
            const isSelected = activeHookId === hook.id;
            return (
              <button
                key={hook.id}
                type="button"
                onClick={() => handleSelectMarketingHook(hook)}
                className={`b2b-hook-card rounded-2xl border p-4 text-left transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "border-[#cfb57c] bg-[#092c27] shadow-[0_14px_34px_rgba(0,0,0,0.35)] ring-1 ring-[#cfb57c]/60"
                    : "border-[rgba(207,181,124,0.22)] bg-[rgba(6,36,30,0.75)] hover:border-[rgba(207,181,124,0.55)]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#cfb57c] bg-[#041713] px-2 py-0.5 rounded border border-[rgba(207,181,124,0.3)]">
                      {hook.corridor}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#10b981]">
                      {bn ? hook.marginTagBn : hook.marginTagEn}
                    </span>
                  </div>
                  <strong className="block text-sm font-bold text-[#f3f0e7]">
                    {bn ? hook.titleBn : hook.titleEn}
                  </strong>
                  <p className="text-xs text-[#b1c3bc] leading-relaxed">
                    {bn ? hook.hookBn : hook.hookEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-[rgba(207,181,124,0.16)] flex items-center justify-between text-[11px] font-semibold text-[#cfb57c]">
                  <span>{bn ? hook.badgeBn : hook.badgeEn}</span>
                  <span>{isSelected ? (bn ? "✓ নির্বাচিত" : "✓ Selected") : bn ? "প্রি-ফিল →" : "Pre-fill →"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="agency-layout">
        <div className="agency-pricing">
          <div className="plan-toggle" role="group" aria-label={bn ? "প্ল্যান বেছে নিন" : "Choose plan"}>
            <button
              type="button"
              aria-pressed={!annual}
              onClick={() => set("interest", "monthlyPlan")}
            >
              {bn ? "মাসিক" : "Monthly"}
            </button>
            <button
              type="button"
              aria-pressed={annual}
              onClick={() => set("interest", "annualPlan")}
            >
              {bn ? "বার্ষিক" : "Annual"}
            </button>
          </div>

          <div className="price-display">
            <span>{bn ? "এজেন্সি সাবস্ক্রিপশন" : "Agency subscription"}</span>
            <strong ref={priceRef}>
              ৳{number(annual ? AGENCY_PRICING.annual : AGENCY_PRICING.monthly)}
            </strong>
            <small>/ {annual ? (bn ? "বছর" : "year") : bn ? "মাস" : "month"}</small>
          </div>

          {annual && (
            <p className="savings-badge">
              ✦ Save ৳{new Intl.NumberFormat("bn-BD").format(AGENCY_PRICING.annualSavings)}/year
            </p>
          )}

          {/* Interactive Sub-Agent Margin & ROI Simulator */}
          <div className="mt-6 rounded-xl border border-[rgba(207,181,124,0.28)] bg-[#06241e] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[#cfb57c]">
                <Calculator className="h-3.5 w-3.5 text-[#10b981]" />
                <span>{bn ? "মাসিক মার্জিন সিমুলেটর" : "Monthly Margin Simulator"}</span>
              </span>
              <span className="font-mono font-bold text-[#f3f0e7] tabular-nums">
                {number(simTickets)} {bn ? "টিকেট/মাস" : "Tickets/mo"}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={simTickets}
              aria-label={bn ? "মাসিক টিকেট সংখ্যা" : "Monthly ticket volume"}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSimTickets(val);
                if (!touched.includes("volume")) {
                  set("volume", `${val} tickets/month`);
                }
              }}
              className="w-full accent-[#cfb57c] cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1 border-t border-[rgba(207,181,124,0.18)] text-xs">
              <span className="text-[#b1c3bc] flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#10b981]" />
                <span>{bn ? "সম্ভাব্য সাশ্রয় ও মার্জিন:" : "Est. Protected Margin:"}</span>
              </span>
              <strong className="font-mono text-sm text-[#10b981] tabular-nums">
                +৳{number(animatedSavings)} / {bn ? "মাস" : "mo"}
              </strong>
            </div>
          </div>

          {/* Official SAFARIA B2B WhatsApp Community Broadcast Hub */}
          <div
            ref={communityCardRef}
            className="mt-4 rounded-xl border border-[#10b981]/40 bg-gradient-to-br from-[#062821] to-[#041713] p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <svg className="h-7 w-7 shrink-0" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <circle cx="18" cy="18" r="15" stroke="rgba(207,181,124,0.25)" strokeWidth="1.2" />
                  <circle
                    ref={orbitRingRef}
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeDasharray="28 66"
                  />
                  <circle cx="18" cy="18" r="5" fill="#cfb57c" />
                </svg>
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                    {bn ? "লাইভ ট্রেড কমিউনিটি" : "LIVE B2B TRADE CHANNEL"}
                  </span>
                  <strong className="text-xs font-bold text-[#f3f0e7]">
                    {bn ? "SAFARIA এজেন্সি নেটওয়ার্ক হাব" : "SAFARIA Bangladesh Agency Hub"}
                  </strong>
                </div>
              </div>
              <Users className="h-4 w-4 text-[#cfb57c] shrink-0" />
            </div>

            <p className="text-xs text-[#b1c3bc] leading-relaxed">
              {bn
                ? "প্রতিদিনের ঢাকা-জেদ্দা/দুবাই হোলসেল ফেয়ার ড্রপ, গ্রুপ ব্লক সিট অ্যালার্ট এবং এয়ারলাইন সার্কুলার সবার আগে পেতে আমাদের অফিসিয়াল হোয়াটসঅ্যাপ চ্যানেলে ফলো করুন।"
                : "Get daily Dhaka wholesale fare drops, Umrah seat block alerts, and instant airline waiver circulars in our official Bangladesh B2B WhatsApp channel."}
            </p>

            <a
              href={SAFARIA_CONFIG.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (communityCardRef.current) {
                  animate(communityCardRef.current, {
                    scale: [0.98, 1.01, 1],
                    duration: 320,
                    ease: "outQuad",
                  });
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-3.5 py-2 text-xs font-bold text-[#041713] hover:bg-[#34d399] transition-colors"
            >
              <span>{bn ? "WhatsApp কমিউনিটি চ্যানেলে যুক্ত হোন" : "Follow Official WhatsApp Channel"}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="agency-benefit">
            <strong>0% SAFARIA Markup</strong>
            <button
              type="button"
              onClick={() => setShowMarkup((current) => !current)}
              aria-expanded={showMarkup}
              aria-controls="markup-rule"
            >
              ⓘ {bn ? "নিয়ম দেখুন" : "How it works"}
            </button>
            <p id="markup-rule" hidden={!showMarkup}>
              {bn
                ? "শুধু যোগ্য এয়ার টিকিটে SAFARIA-এর নিজস্ব মার্কআপ ০%; এয়ারলাইন কর ও সরবরাহকারীর ফি এর বাইরে। যোগ্যতা ও শর্ত যাচাই সাপেক্ষে।"
                : "0% SAFARIA markup applies only to eligible air tickets. Airline taxes and supplier fees are excluded. Eligibility and terms require verification."}
            </p>
          </div>

          <p className="agency-fineprint">
            {bn
              ? "দাম প্রদর্শন আবেদন বা ট্রায়াল সক্রিয় করে না। বুকিং, ক্রেডিট ও সাবস্ক্রিপশন আলাদা লিখিত শর্ত সাপেক্ষে।"
              : "Displayed prices do not activate a subscription or trial. Booking, credits and subscription terms require written confirmation."}
          </p>
        </div>

        {submittedData ? (
          <div className="agency-form ivory-surface space-y-5">
            <h3 className="display-heading">
              {bn ? "আবেদন সফলভাবে গ্রহণ করা হয়েছে" : "Application Received"}
            </h3>
            <div className="rounded-xl border border-safaria-line bg-[#f1dfb9] p-5 text-center space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-[#386258] uppercase">
                {bn ? "B2B পার্টনারশিপ ট্র্যাকিং কোড" : "B2B Intake Reference"}
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-extrabold text-[#062b27]">
                  {submittedData.referenceNo}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(submittedData.referenceNo);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="rounded border border-[#386258]/40 bg-[#fffdf7] px-2.5 py-1 text-xs font-semibold text-[#062b27] hover:bg-white"
                >
                  {copied ? (bn ? "কপি হয়েছে!" : "Copied!") : bn ? "কপি" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-[#386258] leading-relaxed max-w-md mx-auto">
                {bn
                  ? "আপনার ট্রাভেল এজেন্সির তথ্য আমাদের অপারেশন্স ডেস্কে নিবন্ধিত হয়েছে। ভেরিফিকেশন সাপেক্ষে ৭২ ঘণ্টার ট্রায়াল ও সাব-এজেন্ট লেজার দ্রুত কার্যকর করা হবে।"
                  : "Your agency application has been recorded in our operations desk. Trade verification and 72-hour trial credentials will be reviewed promptly."}
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <a
                href={submittedData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-gold w-full text-center flex items-center justify-center gap-2"
              >
                <span>{bn ? "WhatsApp-এ আবেদন খসড়া পাঠান" : "Relay to SAFARIA via WhatsApp"}</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a
                href={SAFARIA_CONFIG.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#062b27] bg-[#062b27] px-4 py-2.5 text-xs font-bold text-[#f3f0e7] hover:opacity-90 transition-opacity"
              >
                <Radio className="h-3.5 w-3.5 text-[#10b981]" />
                <span>
                  {bn
                    ? "অফিসিয়াল B2B WhatsApp কমিউনিটি চ্যানেলে যুক্ত হোন"
                    : "Join SAFARIA B2B WhatsApp Community Channel"}
                </span>
                <span aria-hidden="true">↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setSubmitted(false);
                }}
                className="w-full py-2 text-xs font-bold text-[#062b27] hover:underline"
              >
                {bn ? "আরেকটি আবেদন করুন" : "Submit Another Application"}
              </button>
            </div>
          </div>
        ) : (
          <form id="sf-agency-form" className="agency-form ivory-surface" onSubmit={submit} noValidate>
            <h3 className="display-heading">{bn ? "এজেন্সির আবেদন" : "Agency application"}</h3>
            <p>
              {bn
                ? "১৬টি তথ্য দিয়ে আবেদন তৈরি করুন। অপারেশন্স ডেস্কে সরাসরি সংরক্ষিত হবে।"
                : "Complete the 16-field application; automatically synced to the triage desk."}
            </p>

            {/* Interactive 3-Step Agency Onboarding Wizard Navigation Bar (anime.js sequential reveal) */}
            <div className="my-4 rounded-xl border border-[#386258]/25 bg-[#f1dfb9]/65 p-3 space-y-2.5">
              <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label={bn ? "এজেন্সি অনবোর্ডিং ধাপ" : "Agency onboarding steps"}>
                {ONBOARDING_STEPS.map((st) => {
                  const isCurrent = activeOnboardingStep === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => setActiveOnboardingStep(st.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-[#062b27] text-[#f3f0e7] shadow-sm"
                          : "bg-[#fffdf7]/80 text-[#386258] hover:bg-[#fffdf7]"
                      }`}
                    >
                      <span className="block truncate">{bn ? st.bnLabel : st.enLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div
                ref={stepBannerRef}
                className="flex items-center justify-between gap-2 text-xs text-[#062b27] px-1"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0f766e] shrink-0" />
                  <span>{bn ? currentStepMeta.bnDesc : currentStepMeta.enDesc}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {activeOnboardingStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveOnboardingStep((prev) => Math.max(0, prev - 1))}
                      className="rounded border border-[#386258]/30 bg-[#fffdf7] px-2 py-0.5 text-[11px] font-bold text-[#062b27] hover:bg-white"
                    >
                      {bn ? "পূর্ববর্তী" : "Prev"}
                    </button>
                  )}
                  {activeOnboardingStep < 2 && (
                    <button
                      type="button"
                      onClick={() => setActiveOnboardingStep((prev) => Math.min(2, prev + 1))}
                      className="rounded bg-[#062b27] px-2 py-0.5 text-[11px] font-bold text-[#f3f0e7] hover:opacity-90"
                    >
                      {bn ? "পরবর্তী ধাপ →" : "Next Step →"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div ref={formFieldsRef} className="agency-fields">
              {select("applicationType", bn ? "আবেদনের ধরন *" : "Application type *", 0, [
                ["trialRequest", "৭২ ঘণ্টার ট্রায়াল আবেদন", "72-hour trial application"],
                ["subscriptionRequest", "সাবস্ক্রিপশন আবেদন", "Subscription application"],
              ])}
              {input("agencyName", bn ? "এজেন্সির নাম *" : "Agency name *", 0)}
              {input("location", bn ? "অবস্থান *" : "Location *", 0)}
              {input("website", bn ? "ওয়েবসাইট (ঐচ্ছিক)" : "Website (optional)", 0, "url")}
              {select("businessStatus", bn ? "ব্যবসার অবস্থা *" : "Business status *", 1, [
                ["established", "চলমান", "Established"],
                ["starting", "শুরু হচ্ছে", "Starting"],
              ])}
              {input("years", bn ? "কত বছর ধরে" : "Years in business", 1, "number")}
              {input("volume", bn ? "আনুমানিক মাসিক ভলিউম" : "Estimated monthly volume", 1)}
              {select("requirement", bn ? "প্রধান চাহিদা *" : "Primary requirement *", 1, [
                ["air", "এয়ার টিকিট", "Air tickets"],
                ["tour", "ট্যুর", "Tours"],
                ["hotel", "হোটেল", "Hotels"],
                ["visa", "ভিসা", "Visa"],
                ["other", "অন্যান্য", "Other"],
              ])}
              <label
                className={`field field-wide transition-shadow ${activeOnboardingStep === 1 ? "ring-1 ring-[#386258]/35 rounded-lg p-1.5 -m-1.5 bg-[#fffdf7]/60" : ""}`}
                data-onboarding-step={1}
                onFocusCapture={() => {
                  if (activeOnboardingStep !== 1) setActiveOnboardingStep(1);
                }}
              >
                {bn ? "ব্যবসার অতিরিক্ত তথ্য" : "Business notes"}
                <textarea
                  value={fields.businessNotes}
                  maxLength={500}
                  rows={2}
                  onChange={(event) => set("businessNotes", event.target.value)}
                />
              </label>
              {input("fullName", bn ? "যোগাযোগকারীর নাম *" : "Contact name *", 2)}
              {input("phone", bn ? "ফোন / WhatsApp *" : "Phone / WhatsApp *", 2, "tel")}
              {input("email", bn ? "ইমেইল *" : "Email *", 2, "email")}
              {select("contactMethod", bn ? "যোগাযোগের মাধ্যম *" : "Contact method *", 2, [
                ["whatsapp", "WhatsApp", "WhatsApp"],
                ["phone", "ফোন", "Phone"],
                ["email", "ইমেইল", "Email"],
              ])}
              <label
                className="consent-field field-wide"
                data-onboarding-step={2}
                onFocusCapture={() => {
                  if (activeOnboardingStep !== 2) setActiveOnboardingStep(2);
                }}
              >
                <input
                  data-agency-field="consent"
                  type="checkbox"
                  checked={fields.consent}
                  onChange={(event) => {
                    set("consent", event.target.checked);
                    touch("consent");
                  }}
                  aria-invalid={invalid("consent")}
                />
                {bn
                  ? "আবেদন যাচাইয়ের জন্য আমার তথ্য ব্যবহার করতে সম্মতি দিচ্ছি।"
                  : "I consent to use of my details for application review."}
              </label>
              {message("consent")}
              <label
                className="consent-field field-wide"
                data-onboarding-step={2}
                onFocusCapture={() => {
                  if (activeOnboardingStep !== 2) setActiveOnboardingStep(2);
                }}
              >
                <input
                  data-agency-field="trialConsent"
                  type="checkbox"
                  checked={fields.trialConsent}
                  onChange={(event) => {
                    set("trialConsent", event.target.checked);
                    touch("trialConsent");
                  }}
                  aria-invalid={invalid("trialConsent")}
                />
                {bn
                  ? "আমি বুঝেছি ৭২ ঘণ্টার বিনামূল্যের ট্রায়াল যাচাই ও fair-use শর্তসাপেক্ষ; এই আবেদন ট্রায়াল সক্রিয় করে না।"
                  : "I understand the 72-hour free trial is subject to verification and fair use; this application does not activate it."}
              </label>
              {message("trialConsent")}
            </div>
            <button type="submit" disabled={submitting} className="button button-gold">
              {submitting
                ? bn
                  ? "সংরক্ষণ করা হচ্ছে…"
                  : "Submitting…"
                : bn
                  ? "আবেদন জমা দিন ও WhatsApp খসড়া খুলুন"
                  : "Submit Agency Application"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <p className="form-handoff">
              {bn
                ? "আবেদনের পর একটি ট্র্যাকিং কোড পাবেন।"
                : "You will receive an intake tracking code upon submission."}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
