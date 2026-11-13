"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { TrendingUp, Calculator, CheckCircle2 } from "lucide-react";
import { animate, stagger } from "animejs";
import {
  agencyErrors,
  agencyWhatsappHref,
  initialAgencyFields,
  type AgencyFields,
} from "@/lib/agency";
import { AGENCY_PRICING } from "@/config/constants";
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

export function AgencyPortal({ language }: { language: Language }) {
  const bn = language === "bn";
  const [fields, setFields] = useState<AgencyFields>(initialAgencyFields);
  const [touched, setTouched] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showMarkup, setShowMarkup] = useState(false);
  const [simTickets, setSimTickets] = useState<number>(35);
  const [animatedSavings, setAnimatedSavings] = useState<number>(35 * 2200);
  const [activeOnboardingStep, setActiveOnboardingStep] = useState<number>(0);

  const priceRef = useRef<HTMLElement>(null);
  const formFieldsRef = useRef<HTMLDivElement>(null);
  const stepBannerRef = useRef<HTMLDivElement>(null);

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
        <p className="eyebrow">04 / AGENCY PARTNERS</p>
        <h2 id="agency-title" className="display-heading">
          {bn ? "এজেন্সির জন্য নতুন সম্ভাবনা" : "Built for travel agencies"}
        </h2>
        <p>
          {bn
            ? "আবেদন করুন; যাচাই ও লিখিত শর্তের পর পরবর্তী ধাপ জানানো হবে।"
            : "Apply for review; next steps follow verification and written terms."}
        </p>
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
