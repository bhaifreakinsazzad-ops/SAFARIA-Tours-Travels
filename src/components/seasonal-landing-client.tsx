"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Compass, FileCheck2, MessageCircle, ShieldCheck } from "lucide-react";
import { RouteEnquiryDialog } from "@/components/route-enquiry-dialog";
import { useSiteStore } from "@/lib/site-store";
import {
  SEASONAL_DISCLOSURE,
  SEASONAL_CAMPAIGN_STATUS,
  getSeasonalCampaigns,
  type SeasonalAudience,
} from "@/data/seasonal-campaigns";

const BENEFITS = [
  {
    icon: Compass,
    bn: "আপনার প্রয়োজন অনুযায়ী রুট ও বিকল্প",
    en: "Route-focused travel enquiries",
  },
  {
    icon: FileCheck2,
    bn: "চার্জ ও শর্ত আগে যাচাই",
    en: "Clarify charges and conditions",
  },
  {
    icon: Clock3,
    bn: "২৪/৭ সাপোর্ট টিমে যোগাযোগ",
    en: "24/7 staffed support contact",
  },
  {
    icon: ShieldCheck,
    bn: "যাচাইসাপেক্ষ কোটেশন ও পার্টনারশিপ",
    en: "Verification-first quotations and partnerships",
  },
] as const;

/**
 * Dedicated seasonal campaign landing page.
 * This is a marketing and enquiry surface, not a fare inventory or a
 * replacement for the existing Travel Studio, B2B desk or ticketing workflow.
 */
export function SeasonalLandingClient() {
  const language = useSiteStore((state) => state.language);
  const setLanguage = useSiteStore((state) => state.setLanguage);
  const selectedOfferId = useSiteStore((state) => state.selectedOfferId);
  const selectedCode = useSiteStore((state) => state.selectedCode);
  const enquiryOpen = useSiteStore((state) => state.enquiryOpen);
  const openOfferEnquiry = useSiteStore((state) => state.openOfferEnquiry);
  const closeEnquiry = useSiteStore((state) => state.closeEnquiry);

  const bn = language === "bn";
  const [audience, setAudience] = useState<SeasonalAudience>("b2c");
  const [dialogVisited, setDialogVisited] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("audience");
    if (selected === "b2b") setAudience("b2b");
  }, []);

  const launchQuote = (offerId: string) => {
    setDialogVisited(true);
    openOfferEnquiry(offerId);
  };

  const cards = getSeasonalCampaigns(audience);
  const b2b = audience === "b2b";
  const heroImage = b2b ? "/marketing/web/b2b-hero.jpg" : "/marketing/web/travel-studio.jpg";

  return (
    <div className="min-h-screen overflow-x-clip bg-[#041713] text-[#f3f0e7]">
      <header className="relative z-10 border-b border-[#cfb57c]/25 bg-[#03130f]/95">
        <nav aria-label={bn ? "সিজনাল নেভিগেশন" : "Seasonal navigation"} className="mx-auto flex max-w-[1420px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-9 lg:px-[68px]">
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 text-[#cfb57c]" aria-label={bn ? "SAFARIA হোমপেজ" : "SAFARIA homepage"}>
            <Image src="/images/logo-inverted.webp" width={42} height={42} alt="" />
            <span className="text-base font-bold tracking-[0.15em] sm:text-xl">SAFARIA</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 text-xs text-[#b1c3bc] hover:text-[#cfb57c]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {bn ? "হোম" : "Home"}
            </Link>
            <Link href="/b2b" className="inline-flex min-h-11 items-center text-xs text-[#cfb57c] hover:underline">
              {bn ? "এজেন্সি" : "Agencies"}
            </Link>
            <button
              type="button"
              onClick={() => setLanguage(bn ? "en" : "bn")}
              aria-label={bn ? "Switch to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
              className="min-h-11 rounded-lg border border-[#cfb57c]/45 px-3 text-xs font-bold text-[#cfb57c] hover:border-[#cfb57c]"
            >
              {bn ? "EN" : "বাংলা"}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-[#cfb57c]/20" aria-labelledby="seasonal-title">
          <div className="absolute inset-0 -z-10">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#041713] via-[#041713]/95 to-[#041713]/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041713] via-transparent to-[#041713]/25" />
          </div>
          <div className="mx-auto grid min-h-[520px] max-w-[1420px] items-center px-5 py-14 sm:px-9 lg:min-h-[590px] lg:px-[68px]">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex rounded-full border border-[#cfb57c]/40 bg-[#041713]/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#cfb57c]">
                SAFARIA / {bn ? "সিজনাল ট্রাভেল প্ল্যানিং" : "SEASONAL TRAVEL PLANNING"}
              </span>
              <h1 id="seasonal-title" className="font-display text-4xl font-medium leading-[1.2] sm:text-5xl lg:text-[clamp(3.1rem,5vw,5.4rem)]">
                {b2b
                  ? (bn ? "পিক সিজনের চাপ, গুছানো এজেন্সি ওয়ার্কফ্লো।" : "Peak demand. Organized agency operations.")
                  : (bn ? "পরের যাত্রার পরিকল্পনা হোক আরও সহজ।" : "Your next journey, thoughtfully planned.")}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-[#d1dfd9] sm:text-base">
                {b2b
                  ? (bn
                    ? "৬টি অপারেশনাল ডেস্ক, ২৪/৭ সাপোর্ট টিম ও আগাম পার্টনারশিপ নিবন্ধনের ব্যবস্থা দেখুন। সাপ্লায়ার চুক্তি এখনো আলোচনাধীন।"
                    : "Explore six operational desk workflows, staffed 24/7 support, and agency pre-registration. Supplier agreements remain under negotiation.")
                  : (bn
                    ? "ডোমেস্টিক, সৌদি, স্টুডেন্ট ও প্রিমিয়াম ট্রাভেলের জন্য নিজের রুট ও প্রয়োজন অনুযায়ী কোটেশন অনুরোধ করুন।"
                    : "Explore domestic, Saudi, student and premium travel enquiries matched to your destination and plans.")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {b2b ? (
                  <Link href="/b2b#b2b-subscription-enquiry" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#cfb57c] px-6 text-sm font-bold text-[#041713] hover:bg-[#f0d6a1]" data-campaign-id="seasonal-agency-hero">
                    {bn ? "এজেন্সি আগ্রহ নিবন্ধন করুন" : "Register agency interest"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => launchQuote("fare-options")} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#cfb57c] px-6 text-sm font-bold text-[#041713] hover:bg-[#f0d6a1]" data-campaign-id="seasonal-traveller-hero">
                    {bn ? "ফেয়ার অপশন জানতে চান" : "Request fare options"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <Link href={b2b ? "/b2b" : "/#sf-travel-form"} className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-[#cfb57c]/60 bg-[#041713]/60 px-6 text-sm font-semibold text-[#f3f0e7] hover:border-[#cfb57c]">
                  {b2b ? (bn ? "B2B ওয়ার্কফ্লো দেখুন" : "Explore B2B workflows") : (bn ? "ট্রাভেল স্টুডিও" : "Open Travel Studio")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1420px] px-5 py-10 sm:px-9 lg:px-[68px]" aria-label={bn ? "সার্ভিস সুবিধা" : "Service principles"}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.en} className="flex min-h-[85px] items-center gap-3 rounded-xl border border-[#cfb57c]/20 bg-[#062b27]/70 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#cfb57c]/30 text-[#cfb57c]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold leading-6 sm:text-sm">{bn ? benefit.bn : benefit.en}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-[1420px] px-5 pb-16 sm:px-9 lg:px-[68px]" aria-labelledby="seasonal-campaigns-title">
          <div className="flex flex-col justify-between gap-4 border-t border-[#cfb57c]/20 pt-8 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#cfb57c]">{bn ? "আপনার প্রয়োজন বেছে নিন" : "CHOOSE YOUR PATH"}</span>
              <h2 id="seasonal-campaigns-title" className="mt-2 font-display text-3xl sm:text-4xl">
                {bn ? "ট্রাভেলার, নাকি এজেন্সি পার্টনার?" : "Travel planning or agency partnership?"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#b1c3bc]">
                {bn ? "দুই ধরনের প্রয়োজনের জন্য দুটি আলাদা, সহজ কনভার্সন পথ।" : "Two focused enquiry journeys, with no unverified ticket or discount guarantees."}
              </p>
            </div>
            <div role="group" aria-label={bn ? "অডিয়েন্স নির্বাচন করুন" : "Select audience"} className="inline-flex self-start rounded-xl border border-[#cfb57c]/30 bg-[#062b27] p-1 sm:self-auto">
              <button
                type="button"
                aria-pressed={!b2b}
                onClick={() => setAudience("b2c")}
                className={`min-h-11 rounded-lg px-4 text-xs font-bold transition-colors sm:px-5 ${!b2b ? "bg-[#cfb57c] text-[#041713]" : "text-[#f3f0e7] hover:bg-[#0b352a]"}`}
              >
                {bn ? "ভ্রমণকারী" : "Travellers"}
              </button>
              <button
                type="button"
                aria-pressed={b2b}
                onClick={() => setAudience("b2b")}
                className={`min-h-11 rounded-lg px-4 text-xs font-bold transition-colors sm:px-5 ${b2b ? "bg-[#cfb57c] text-[#041713]" : "text-[#f3f0e7] hover:bg-[#0b352a]"}`}
              >
                {bn ? "ট্রাভেল এজেন্সি" : "Agencies"}
              </button>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
            {cards.map((card) => (
              <article key={card.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#cfb57c]/25 bg-[#062b27]/80">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={card.imageSrc} alt={card.imageAlt[language]} fill sizes="(min-width: 1280px) 280px, (min-width: 640px) 48vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#041713]/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-md border border-[#cfb57c]/35 bg-[#041713]/85 px-2 py-1 text-[10px] font-bold tracking-[0.09em] text-[#cfb57c]">{card.label[language]}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-semibold leading-7">{card.title[language]}</h3>
                  <p className="mt-2 flex-1 text-xs leading-6 text-[#b1c3bc]">{card.description[language]}</p>
                  {b2b ? (
                    <Link href="/b2b#b2b-subscription-enquiry" data-campaign-id={card.id} className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-[#cfb57c]/45 px-3 text-xs font-semibold text-[#cfb57c] hover:bg-[#0b352a]">
                      <span>{card.cta[language]}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : (
                    <button type="button" onClick={() => card.existingOfferId && launchQuote(card.existingOfferId)} data-campaign-id={card.id} className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-[#cfb57c]/45 px-3 text-left text-xs font-semibold text-[#cfb57c] hover:bg-[#0b352a]">
                      <span>{card.cta[language]}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#cfb57c]/25 bg-[#10243a]/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{bn ? "সরাসরি টিমের সাথে কথা বলতে চান?" : "Want to speak with the team?"}</p>
              <p className="mt-1 text-xs leading-6 text-[#b1c3bc]">
                {bn ? "২৪/৭ সাপোর্ট টিমে যোগাযোগের জন্য আপনার প্রয়োজন অনুযায়ী অনুরোধ পাঠান।" : "Send your enquiry for staffed 24/7 contact and follow-up."}
              </p>
            </div>
            <Link href={b2b ? "/b2b#b2b-subscription-enquiry" : "/#sf-travel-form"} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#cfb57c] px-5 text-xs font-bold text-[#041713] hover:bg-[#f0d6a1]">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {b2b ? (bn ? "এজেন্সি আগ্রহ জানান" : "Agency enquiry") : (bn ? "ট্রাভেল পরিকল্পনা পাঠান" : "Plan your trip")}
            </Link>
          </div>
          <p className="mt-5 max-w-5xl text-[11px] leading-6 text-[#b1c3bc]" data-campaign-status={SEASONAL_CAMPAIGN_STATUS}>{SEASONAL_DISCLOSURE[language]}</p>
        </section>
      </main>

      <footer className="border-t border-[#cfb57c]/20 bg-[#03130f] px-5 py-7 sm:px-9">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 text-xs text-[#b1c3bc]">
          <span>© 2026 SAFARIA Tours &amp; Travels</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#cfb57c]">{bn ? "হোম" : "Home"}</Link>
            <Link href="/b2b" className="hover:text-[#cfb57c]">{bn ? "বি২বি" : "B2B"}</Link>
          </div>
        </div>
      </footer>

      {dialogVisited && (
        <RouteEnquiryDialog
          open={enquiryOpen}
          selectedCode={selectedCode}
          selectedOfferId={selectedOfferId}
          language={language}
          onClose={closeEnquiry}
        />
      )}
    </div>
  );
}
