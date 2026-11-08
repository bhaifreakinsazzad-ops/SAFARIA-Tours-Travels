"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Headphones,
  DollarSign,
  Ticket,
  Sparkles,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { B2BApplicationModal } from "./B2BApplicationModal";

interface B2BAgencySectionProps {
  lang: "bn" | "en";
}

export function B2BAgencySection({ lang }: B2BAgencySectionProps) {
  const isBn = lang === "bn";
  const [modalOpen, setModalOpen] = useState(false);

  const deskIcons: Record<string, React.ReactNode> = {
    "fare-desk": <DollarSign className="h-5 w-5 text-safaria-gold" />,
    "booking-desk": <Ticket className="h-5 w-5 text-safaria-gold" />,
    "clear-margin": <TrendingUp className="h-5 w-5 text-safaria-gold" />,
    "after-care": <Headphones className="h-5 w-5 text-safaria-gold" />,
    "verified-workflow": <FileCheck className="h-5 w-5 text-safaria-gold" />,
    "partner-growth": <Sparkles className="h-5 w-5 text-safaria-gold" />,
  };

  return (
    <section id="b2b-agency" className="bg-surface-100 py-16 sm:py-24 border-b border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-safaria-gold">
            <Building2 className="h-4 w-4" />
            <span>{isBn ? "নন-আয়াটা ও স্বাধীন ট্রাভেল এজেন্সির জন্য" : "For Non-IATA Travel Agencies"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-safaria-ink">
            {isBn ? "সাফারিয়া বিটুবি এজেন্সি প্ল্যাটফর্ম" : "SAFARIA Agency Infrastructure"}
          </h2>
          <p className="text-sm sm:text-base text-safaria-inkMuted">
            {isBn
              ? "৬টি বিশেষায়িত অপারেশনাল ডেস্কের মাধ্যমে আপনার ট্রাভেল এজেন্সির এয়ার টিকেটিং ব্যবসাকে দিন নতুন গতি।"
              : "Empowering non-IATA travel agents with wholesale inventories, sub-agent margins, and operations desks."}
          </p>
        </div>

        {/* 6 Desks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SITE_CONFIG.b2bDesks.map((desk) => (
            <div
              key={desk.id}
              className="rounded-xl border border-safaria-line/70 bg-surface-200/80 p-5 space-y-3 hover:border-safaria-gold/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-0 border border-safaria-line/60">
                  {deskIcons[desk.id]}
                </div>
                <h3 className="font-display text-lg font-bold text-safaria-ink">
                  {isBn ? desk.titleBn : desk.titleEn}
                </h3>
              </div>
              <p className="text-xs text-safaria-inkMuted leading-relaxed">
                {isBn ? desk.descBn : desk.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing & Trial Notice Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-surface-0 rounded-2xl border border-safaria-line p-6 sm:p-10 shadow-panel">
          {/* Left: 72h Trial Information */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-safaria-gold/40 bg-surface-200 px-3 py-1 text-xs font-semibold text-safaria-gold">
              <span>{isBn ? "৭২ ঘণ্টার যাচাইকৃত পাইলট ট্রায়াল" : "72-Hour Verified Pilot Trial"}</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-safaria-ink">
              {isBn ? "আপনার এজেন্সির জন্য পরীক্ষা করে দেখুন" : "Experience the Operations Platform"}
            </h3>

            <p className="text-sm text-safaria-inkMuted leading-relaxed">
              {isBn
                ? "কোনো গোপন চার্জ নেই। ভেরিফায়েড ট্রেড লাইসেন্সধারী যেকোনো বাংলাদেশি ট্রাভেল এজেন্সি প্রাথমিক পাইলট অ্যাক্সেসের জন্য আবেদন করতে পারেন।"
                : "No hidden setup costs. Any licensed Bangladeshi travel agency can apply for an audit review and pilot workspace access."}
            </p>

            <div className="space-y-2 pt-1 text-xs text-safaria-ink">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-safaria-success shrink-0" />
                <span>{isBn ? "জিডিএস ও এলসিসি হোলসেল ফেয়ারের অ্যাক্সেস" : "GDS & LCC wholesale inventory access"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-safaria-success shrink-0" />
                <span>{isBn ? "স্বচ্ছ সাব-এজেন্ট কমিশন ও বুকিং লেজার" : "Real-time commission and sub-agent ledger"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-safaria-success shrink-0" />
                <span>{isBn ? "আফটার-কেয়ার রি-ইস্যু ও রিফান্ড বিশেষজ্ঞ সহায়তা" : "Dedicated aftercare desk for re-issues"}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo px-6 py-3.5 text-sm font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all transform hover:-translate-y-0.5"
              >
                <Building2 className="h-4 w-4" />
                <span>{isBn ? "এজেন্সি পার্টনারশিপ আবেদন করুন" : "Apply for Agency Partnership"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Pricing Box with Explicit Draft Notice */}
          <div className="lg:col-span-5 rounded-xl border border-safaria-gold/40 bg-surface-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-safaria-line/40 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-safaria-gold">
                {isBn ? "মাসিক সাবস্ক্রিপশন (খসড়া)" : "Monthly Subscription (Draft)"}
              </span>
              <span className="text-[10px] font-semibold uppercase rounded bg-safaria-gold/20 text-safaria-gold px-2 py-0.5">
                Pilot Tier
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-safaria-ink">
                  ৳{SITE_CONFIG.pricing.b2bMonthlyPriceBdt.toLocaleString()}
                </span>
                <span className="text-xs text-safaria-inkMuted">/ month (est.)</span>
              </div>
              <p className="text-xs text-safaria-inkFaint mt-1">
                {isBn ? "অথবা পূর্ণাঙ্গ স্যুটঃ ৳২০,০০০/মাস (পাইলট পর্যালোচনায়)" : "Or Full Suite: ৳20,000/mo (Under Pilot Review)"}
              </p>
            </div>

            {/* Crucial Spec/Conflict Truthful Notice */}
            <div className="rounded-lg border border-safaria-line/60 bg-surface-input p-3 text-[11px] text-safaria-inkMuted leading-relaxed space-y-1">
              <span className="font-semibold text-safaria-gold block">
                {isBn ? "মূল্য সংক্রান্ত ঘোষণা:" : "Pricing Status Note:"}
              </span>
              <p>
                {isBn
                  ? SITE_CONFIG.pricing.pricingDisclaimerBn
                  : SITE_CONFIG.pricing.pricingDisclaimerEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded B2B Application Intake Dialog */}
      <B2BApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lang={lang}
      />
    </section>
  );
}
