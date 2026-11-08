"use client";

import React from "react";
import { Plane, Compass, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface HeroSectionProps {
  lang: "bn" | "en";
}

export function HeroSection({ lang }: HeroSectionProps) {
  const isBn = lang === "bn";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-0 via-surface-100 to-surface-0 py-16 sm:py-24 border-b border-safaria-line">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-safaria-emerald/20 blur-[120px]" />
        <div className="absolute top-1/3 right-10 h-[300px] w-[350px] rounded-full bg-safaria-gold/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Eyebrow kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-safaria-gold/40 bg-surface-200/80 px-3.5 py-1.5 text-xs text-safaria-gold shadow-sm backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-safaria-gold"></span>
              <span className="font-semibold tracking-wider uppercase">
                {isBn ? "সাফারিয়া ট্যুরস অ্যান্ড ট্রাভেলস" : "SAFARIA Tours & Travels"}
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-safaria-ink leading-[1.15]">
              {isBn ? (
                <>
                  <span className="text-safaria-gold">সঠিক ফ্লাইটে</span> শুরু হোক যাত্রা।
                </>
              ) : (
                <>
                  Your Gateway to <span className="text-safaria-gold">Global Travel</span>.
                </>
              )}
            </h1>

            {/* Subtitle / Intro */}
            <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-safaria-inkMuted leading-relaxed">
              {isBn ? SITE_CONFIG.brand.subTaglineBn : SITE_CONFIG.brand.subTaglineEn}
            </p>

            {/* Verified Feature Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-lg border border-safaria-line/60 bg-surface-200/50 p-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-safaria-gold" />
                <span className="text-xs font-medium text-safaria-ink">
                  {isBn ? "১০০+ এয়ারলাইন্স কোটেশন" : "100+ Global Airlines"}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-safaria-line/60 bg-surface-200/50 p-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-safaria-success" />
                <span className="text-xs font-medium text-safaria-ink">
                  {isBn ? "স্বচ্ছ ফেয়ার ও নো হিডেন ফি" : "Transparent Airfares"}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-safaria-line/60 bg-surface-200/50 p-2.5">
                <Plane className="h-4 w-4 shrink-0 text-safaria-gold" />
                <span className="text-xs font-medium text-safaria-ink">
                  {isBn ? "জরুরি রি-ইস্যু সহায়তা" : "Emergency Re-issues"}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#flight-quote"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo px-6 py-3.5 text-sm font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all transform hover:-translate-y-0.5"
              >
                <Plane className="h-4 w-4" />
                <span>{isBn ? "ফ্লাইট কোটেশন অনুরোধ করুন" : "Request Flight Quote"}</span>
              </a>

              <a
                href="#sf-atlas"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-btn border border-safaria-line px-6 py-3.5 text-sm font-semibold text-safaria-ink hover:border-safaria-gold hover:text-safaria-gold hover:bg-surface-200/40 transition-all"
              >
                <Compass className="h-4 w-4 text-safaria-gold" />
                <span>{isBn ? "জার্নি অ্যাটলাস দেখুন" : "Explore Journey Atlas"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Hero Visual / Highlight Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md rounded-2xl border border-safaria-line bg-gradient-to-br from-surface-200/90 to-surface-100/90 p-6 shadow-panel backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-safaria-line/60">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-safaria-success animate-pulse"></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-safaria-gold">
                    {isBn ? "লাইভ কোটেশন সাপোর্ট ডেস্ক" : "Live Quotation Support"}
                  </span>
                </div>
                <span className="text-[11px] text-safaria-inkMuted font-mono">BST (UTC+6)</span>
              </div>

              {/* Sample route preview snippet */}
              <div className="py-4 space-y-3">
                <div className="rounded-lg bg-surface-input p-3 border border-safaria-line/40">
                  <div className="flex items-center justify-between text-xs text-safaria-inkMuted mb-1">
                    <span>{isBn ? "জনপ্রিয় আন্তর্জাতিক রুট" : "Popular Flight Route"}</span>
                    <span className="text-safaria-gold font-medium">Daily Direct</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm font-bold text-safaria-ink">
                    <div className="flex flex-col">
                      <span className="text-base text-safaria-gold">DAC</span>
                      <span className="text-[10px] text-safaria-inkMuted font-sans">Dhaka, BD</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] text-safaria-inkFaint">4h 45m</span>
                      <div className="w-20 border-t border-dashed border-safaria-line relative my-1">
                        <Plane className="h-3 w-3 text-safaria-gold absolute -top-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                      <span className="text-[9px] text-safaria-success">Non-stop</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-base text-safaria-gold">DXB</span>
                      <span className="text-[10px] text-safaria-inkMuted font-sans">Dubai, UAE</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-surface-input p-3 border border-safaria-line/40">
                  <div className="flex items-center justify-between text-xs text-safaria-inkMuted mb-1">
                    <span>{isBn ? "উমরাহ ও ধর্মীয় যাত্রা" : "Umrah & Religious Travel"}</span>
                    <span className="text-safaria-gold font-medium">Biman / Saudia</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm font-bold text-safaria-ink">
                    <div className="flex flex-col">
                      <span className="text-base text-safaria-gold">DAC</span>
                      <span className="text-[10px] text-safaria-inkMuted font-sans">Dhaka</span>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="text-[10px] text-safaria-inkFaint">6h 20m</span>
                      <div className="w-20 border-t border-dashed border-safaria-line relative my-1">
                        <Plane className="h-3 w-3 text-safaria-gold absolute -top-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                      <span className="text-[9px] text-safaria-gold">Special Group Fare</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-base text-safaria-gold">JED</span>
                      <span className="text-[10px] text-safaria-inkMuted font-sans">Jeddah, SA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer footer on hero card */}
              <p className="text-[11px] text-safaria-inkFaint leading-normal border-t border-safaria-line/40 pt-3">
                {isBn
                  ? "কোটেশন প্রাপ্তির পর এয়ারলাইন্স সিট রুলস অনুযায়ী টিকিট ইস্যু সম্পন্ন হয়।"
                  : "Quotations are reviewed by human specialists before issuing confirmed e-tickets."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
