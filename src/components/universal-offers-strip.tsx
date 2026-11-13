"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Headphones, ReceiptText, RefreshCw, SlidersHorizontal } from "lucide-react";
import { animate, stagger } from "animejs";
import {
  SPECIALIST_CAMPAIGNS,
  UNIVERSAL_BENEFITS,
  UNIVERSAL_DISCLOSURE,
  type UniversalLocale,
} from "@/data/universal-marketing";

const BENEFIT_ICONS = [SlidersHorizontal, ReceiptText, RefreshCw, Headphones] as const;

/**
 * A compact, truthful enquiry gateway for the handwritten Universal offers.
 * Reuses existing quotation routes; no new inventory, ticketing, or backend API.
 */
export function UniversalOffersStrip({
  language,
  onSelect,
}: {
  language: UniversalLocale;
  onSelect: (offerId: string) => void;
}) {
  const bn = language === "bn";
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const cards = el.querySelectorAll<HTMLElement>("[data-campaign-id]");
        if (cards.length > 0) {
          animate(cards, {
            opacity: [0, 1],
            translateY: [14, 0],
            scale: [0.98, 1],
            delay: stagger(45),
            duration: 460,
            ease: "outQuad",
          });
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sf-universal"
      aria-labelledby="sf-universal-heading"
      className="relative mx-auto w-full max-w-[1420px] px-5 py-12 sm:px-9 lg:px-[68px] lg:py-16"
    >
      <div className="mb-7 flex flex-col justify-between gap-4 border-t border-[#cfb57c]/25 pt-9 sm:flex-row sm:items-end">
        <div className="max-w-[790px]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#cfb57c]">
            UNIVERSAL / SAFARIA CARE
          </p>
          <h2
            id="sf-universal-heading"
            className="font-display text-3xl leading-tight text-[#f3f0e7] sm:text-4xl lg:text-5xl"
          >
            {bn ? "সঠিক ফেয়ার। পরিষ্কার শর্ত। নির্ভরযোগ্য ফলো-আপ।" : "Better fare choices. Clear terms. Thoughtful follow-up."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b1c3bc]">
            {bn
              ? "ভাড়া যাচাই থেকে পরিবর্তন বা রিফান্ডের নিয়ম—আপনার প্রয়োজন অনুযায়ী কোটেশন ও সহায়তার অনুরোধ করুন।"
              : "From fare comparisons to change and refund rules, start with a clear enquiry tailored to your trip."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {UNIVERSAL_BENEFITS.map((item, index) => {
          const Icon = BENEFIT_ICONS[index];
          return (
            <button
              key={item.id}
              type="button"
              data-campaign-id={item.id}
              onClick={() => onSelect(item.offerId)}
              className="group flex min-h-[158px] flex-col items-start rounded-2xl border border-[#cfb57c]/25 bg-[#062b27]/70 p-5 text-left transition-colors hover:border-[#cfb57c]/70 hover:bg-[#0a3830] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f1cf8e]"
            >
              <div className="mb-5 flex w-full items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#cfb57c]/30 bg-[#041713] text-[#cfb57c]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#cfb57c] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </div>
              <strong className="text-[15px] font-semibold text-[#f3f0e7]">{item.title[language]}</strong>
              <span className="mt-2 text-xs leading-6 text-[#b1c3bc]">{item.description[language]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#cfb57c]">
            {bn ? "বিশেষ ভ্রমণ প্রয়োজন" : "CURATED ENQUIRIES"}
          </p>
          <h3 className="mt-1 font-display text-2xl text-[#f3f0e7] sm:text-3xl">
            {bn ? "স্টুডেন্ট থেকে Business Class" : "From student travel to Business Class"}
          </h3>
        </div>
        <a
          href="#sf26-offers"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#cfb57c] hover:underline"
        >
          {bn ? "সব সেবা দেখুন" : "View all services"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SPECIALIST_CAMPAIGNS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-campaign-id={item.id}
            onClick={() => onSelect(item.offerId)}
            className="group flex min-h-[157px] flex-col items-start rounded-xl border border-[#cfb57c]/15 bg-[#08241f] p-5 text-left transition-colors hover:border-[#cfb57c]/50 hover:bg-[#0b3029] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f1cf8e]"
          >
            <span className="text-[10px] font-bold tracking-[0.12em] text-[#cfb57c]">{item.label[language]}</span>
            <strong className="mt-3 text-[15px] font-semibold text-[#f3f0e7]">{item.title[language]}</strong>
            <span className="mt-2 flex-1 text-xs leading-6 text-[#b1c3bc]">{item.description[language]}</span>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#cfb57c] group-hover:underline">
              {bn ? "যোগ্যতা / ফেয়ার যাচাই করুন" : "Check options"}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-[#cfb57c]/25 bg-[#10243a]/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-semibold text-[#f3f0e7]">
            {bn ? "ট্রাভেল এজেন্সি পরিচালনা করেন?" : "Run a travel agency?"}
          </p>
          <p className="mt-1 text-xs leading-6 text-[#b1c3bc]">
            {bn
              ? "B2B পার্টনারশিপ, অপারেশনাল সাপোর্ট ও কমিশনের লিখিত শর্ত জানতে আবেদন করুন।"
              : "Enquire about B2B partnership, operational support and verified commission terms."}
          </p>
        </div>
        <Link
          href="/b2b#b2b-subscription-enquiry"
          data-campaign-id="agency-partnership"
          className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#cfb57c] px-5 py-3 text-sm font-bold text-[#041713] transition-colors hover:bg-[#f0d6a1]"
        >
          {bn ? "B2B পার্টনারশিপ জানুন" : "Explore B2B partnership"}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-5 text-[11px] leading-5 text-[#b1c3bc]">{UNIVERSAL_DISCLOSURE[language]}</p>
    </section>
  );
}
