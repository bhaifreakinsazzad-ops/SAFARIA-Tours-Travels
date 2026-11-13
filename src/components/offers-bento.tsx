"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Compass, Radio, ArrowUpRight } from "lucide-react";
import { offers, offerCategories, type OfferCategory } from "@/data/catalog";
import { OFFER_CATEGORY_MEDIA, STUDIO_AND_B2B_MEDIA } from "@/data/marketing-assets";
import { SAFARIA_CONFIG } from "@/config/constants";
import type { Language } from "@/lib/atlas-data";

const labels: Record<string, [string, string]> = {
  flights: ["ফ্লাইট", "Flights"],
  student: ["শিক্ষার্থী", "Student"],
  saudi: ["সৌদি রুট", "Saudi"],
  premium: ["প্রিমিয়াম", "Premium"],
  care: ["যাত্রা-পরবর্তী সহায়তা", "Care"],
  services: ["অন্যান্য সেবা", "Services"],
};

export function OffersBento({
  language,
  onSelect,
}: {
  language: Language;
  onSelect: (id: string) => void;
}) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<OfferCategory | "all">("all");
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [autoSpotlight, setAutoSpotlight] = useState<boolean>(true);
  const bn = language === "bn";

  // motion.dev scroll-linked parallax pipeline for .offer-card elements
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Multi-depth parallax motion values so featured, even, and odd .offer-card elements shift smoothly on scroll
  const parallaxFeaturedY = useTransform(smoothScrollProgress, [0, 0.5, 1], [16, 0, -16]);
  const parallaxEvenY = useTransform(smoothScrollProgress, [0, 0.5, 1], [11, 0, -11]);
  const parallaxOddY = useTransform(smoothScrollProgress, [0, 0.5, 1], [-11, 0, 11]);
  const parallaxEvenX = useTransform(smoothScrollProgress, [0, 0.5, 1], [-3, 0, 3]);
  const parallaxOddX = useTransform(smoothScrollProgress, [0, 0.5, 1], [3, 0, -3]);

  // Automatic Spotlight Cycler across featured offers
  useEffect(() => {
    if (!autoSpotlight || reduceMotion) return;
    const timer = window.setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % offers.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [autoSpotlight, reduceMotion]);

  const handleCategoryFocus = async (cat: OfferCategory | "all") => {
    setActiveCategory(cat);
    if (!root.current) return;
    if (cat === "all") {
      if (!reduceMotion) {
        const { animate, stagger } = await import("animejs");
        const allCards = root.current.querySelectorAll<HTMLElement>(".offer-card");
        animate(allCards, {
          scale: [0.98, 1],
          delay: stagger(18),
          duration: 360,
          ease: "outQuad",
        });
      }
      return;
    }
    const targetGroup = root.current.querySelector<HTMLElement>(`[data-offer-group="${cat}"]`);
    if (targetGroup) {
      targetGroup.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      if (!reduceMotion) {
        const { animate, stagger } = await import("animejs");
        const groupCards = targetGroup.querySelectorAll<HTMLElement>(".offer-card");
        animate(groupCards, {
          scale: [0.96, 1.02, 1],
          delay: stagger(45),
          duration: 480,
          ease: "outCubic",
        });
      }
    }
  };

  const currentSpotlightOffer = offers[spotlightIndex] || offers[0];

  return (
    <section
      id="sf26-offers"
      className="content-section offers-section"
      ref={root}
      aria-labelledby="offers-title"
      onMouseEnter={() => setAutoSpotlight(false)}
      onMouseLeave={() => setAutoSpotlight(true)}
    >
      <div className="section-heading">
        <p className="eyebrow">01 / CURATED SERVICES</p>
        <h2 id="offers-title" className="display-heading">
          {bn ? "যাত্রার প্রতিটি পর্যায়ে" : "Every part of the journey"}
        </h2>
        <p>
          {bn
            ? "আপনার পরিকল্পনার জন্য বিকল্প জানতে একটি কোটেশন অনুরোধ করুন।"
            : "Explore options for your plans and request a tailored quotation."}
        </p>
      </div>

      {/* Interactive Category Navigator & Live Spotlight Bar */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-[rgba(207,181,124,0.28)] bg-[rgba(6,43,39,0.55)] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label={bn ? "সেবা বিভাগ" : "Service categories"}>
          <button
            type="button"
            onClick={() => handleCategoryFocus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeCategory === "all"
                ? "bg-[#cfb57c] text-[#041713] font-bold"
                : "text-[#b1c3bc] hover:text-[#f3f0e7] hover:bg-[#092c27]"
            }`}
          >
            {bn ? "সব সেবা (২৬)" : "All Services (26)"}
          </button>
          {offerCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryFocus(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? "bg-[#cfb57c] text-[#041713] font-bold"
                  : "text-[#b1c3bc] hover:text-[#f3f0e7] hover:bg-[#092c27]"
              }`}
            >
              {labels[cat][bn ? 0 : 1]}
            </button>
          ))}
        </div>

        {/* Auto-Cycling Live Service Spotlight */}
        <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 border-[rgba(207,181,124,0.2)] pt-2.5 lg:pt-0 text-xs">
          <div className="flex items-center gap-2 text-[#b1c3bc] truncate">
            <Compass className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
            <span className="text-[#cfb57c] font-mono text-[11px] shrink-0">
              {bn ? "স্পটলাইট:" : "Spotlight:"}
            </span>
            <span className="text-[#f3f0e7] font-medium truncate max-w-[220px]">
              {bn ? currentSpotlightOffer.bn_title : currentSpotlightOffer.en_title}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(currentSpotlightOffer.id)}
            className="text-[#cfb57c] hover:underline font-bold text-[11px] whitespace-nowrap shrink-0"
          >
            {bn ? "কোটেশন ↗" : "Quote ↗"}
          </button>
        </div>
      </div>

      {offerCategories.map((category, groupIndex) => {
        const categoryOffers = offers.filter((item) => item.category === category);
        const categoryMedia = OFFER_CATEGORY_MEDIA[category];
        const isDimmed = activeCategory !== "all" && activeCategory !== category;
        return (
          <div
            className={`offer-group transition-opacity duration-300 ${isDimmed ? "opacity-50" : "opacity-100"}`}
            key={category}
            data-offer-group={category}
          >
            <div className="mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="!mb-0">
                {labels[category][bn ? 0 : 1]}{" "}
                <span>{String(categoryOffers.length).padStart(2, "0")}</span>
              </h3>
              <span className="text-xs text-[#b1c3bc]">
                {bn ? categoryMedia.captionBn : categoryMedia.captionEn}
              </span>
            </div>

            <div className="offer-grid">
              {categoryOffers.map((offer, index) => {
                const isSpotlighted = currentSpotlightOffer.id === offer.id;
                const isFeatured = index === 0;
                const isEvenCard = (groupIndex + index) % 2 === 0;
                const cardParallaxY = isFeatured
                  ? parallaxFeaturedY
                  : isEvenCard
                    ? parallaxEvenY
                    : parallaxOddY;
                const cardParallaxX = isFeatured ? 0 : isEvenCard ? parallaxEvenX : parallaxOddX;

                return (
                  <motion.button
                    key={offer.id}
                    type="button"
                    className={`offer-card ${isFeatured ? "offer-card-featured" : ""} ${
                      isSpotlighted ? "ring-1 ring-[#cfb57c]/70" : ""
                    }`}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.08 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.44,
                      delay: reduceMotion ? 0 : Math.min((index % 4) * 0.055, 0.22),
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={
                      reduceMotion
                        ? undefined
                        : {
                            y: cardParallaxY,
                            x: cardParallaxX,
                          }
                    }
                    onClick={() => onSelect(offer.id)}
                    variants={{
                      hover: {
                        scale: 1.015,
                        borderColor: "#cfb57c",
                        boxShadow:
                          "0 20px 52px rgba(0,0,0,.32), inset 0 0 0 1px rgba(207,181,124,.32)",
                      },
                      focus: { borderColor: "#cfb57c" },
                    }}
                    whileHover={reduceMotion ? undefined : "hover"}
                    whileFocus={reduceMotion ? undefined : "focus"}
                  >
                    {isFeatured && (
                      <div className="relative mb-3 h-36 sm:h-40 w-full overflow-hidden rounded-xl border border-[rgba(207,181,124,0.28)] bg-[#041713] shrink-0">
                        <Image
                          src={categoryMedia.src}
                          alt={bn ? categoryMedia.altBn : categoryMedia.altEn}
                          fill
                          sizes="(max-width: 768px) 100vw, 480px"
                          referrerPolicy="no-referrer"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: categoryMedia.objectPosition || "center" }}
                        />
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(4, 23, 19, 0.14) 0%, rgba(4, 23, 19, 0.56) 55%, rgba(4, 23, 19, 0.90) 100%)",
                          }}
                        />
                        <span className="absolute bottom-2.5 left-2.5 rounded-md border border-[rgba(207,181,124,0.4)] bg-[#041713]/85 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#cfb57c]">
                          {bn ? categoryMedia.badgeBn : categoryMedia.badgeEn}
                        </span>
                      </div>
                    )}
                    <div className="w-full flex items-center justify-between text-[11px]">
                      <span className="offer-index">{String(index + 1).padStart(2, "0")}</span>
                      {offer.badge && (
                        <span className="text-[#cfb57c] font-mono text-[10px] tracking-wider">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                    <strong>{bn ? offer.bn_title : offer.en_title}</strong>
                    <span className="offer-description">
                      {bn ? offer.bn_description : offer.en_description}
                    </span>
                    <motion.span
                      className="offer-action"
                      variants={{ hover: { x: 3 } }}
                      aria-hidden="true"
                    >
                      {bn ? "জানুন" : "Ask"} <span>↗</span>
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* B2B Sub-Agent Wholesale Hook & Official WhatsApp Community Channel Callout */}
      <div className="mt-10 rounded-2xl border border-[rgba(207,181,124,0.34)] bg-gradient-to-r from-[#06241e] via-[#041713] to-[#06241e] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[rgba(207,181,124,0.35)] bg-[#041713]">
            <Image
              src={STUDIO_AND_B2B_MEDIA.b2bHero.src}
              alt={bn ? STUDIO_AND_B2B_MEDIA.b2bHero.altBn : STUDIO_AND_B2B_MEDIA.b2bHero.altEn}
              fill
              sizes="160px"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
              <Radio className="h-3.5 w-3.5" />
              <span>
                {bn
                  ? "ট্রাভেল এজেন্সি ও বি২বি পার্টনার স্পেশাল"
                  : "FOR BANGLADESHI TRAVEL AGENCIES & SUB-AGENTS"}
              </span>
            </span>
            <h4 className="font-display text-base sm:text-lg font-bold text-[#f3f0e7]">
              {bn
                ? "এই ২৬টি সেবায় ০% SAFARIA মার্কআপে বি২বি হোলসেল রেট ও ডেইলি ফেয়ার আপডেট চান?"
                : "Want 0% SAFARIA Markup on All 26 Services + Daily Dhaka Net Fare Drops?"}
            </h4>
            <p className="text-xs text-[#b1c3bc]">
              {bn
                ? "৭২ ঘণ্টার পাইলট ট্রায়ালের জন্য আবেদন করুন অথবা আমাদের অফিসিয়াল WhatsApp চ্যানেলে যুক্ত থাকুন।"
                : "Enquire for a 72-hour B2B subscription pilot or follow our official WhatsApp community broadcast channel."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="#sf-agency"
            className="rounded-xl bg-[#cfb57c] px-4 py-2 text-xs font-bold text-[#041713] hover:opacity-90 transition-opacity"
          >
            {bn ? "B2B সাবস্ক্রিপশন এনকোয়ারি →" : "Enquire B2B Subscription →"}
          </a>
          <a
            href={SAFARIA_CONFIG.whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#10b981]/55 bg-[#092c27] px-4 py-2 text-xs font-bold text-[#10b981] hover:bg-[#10b981] hover:text-[#041713] transition-colors"
          >
            <span>{bn ? "WhatsApp চ্যানেলে যুক্ত হোন" : "Join WhatsApp Channel"}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
