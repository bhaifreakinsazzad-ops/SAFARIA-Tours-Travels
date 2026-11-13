"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Compass } from "lucide-react";
import { offers, offerCategories, type OfferCategory } from "@/data/catalog";
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

  // IntersectionObserver + anime.js staggered card reveal
  useEffect(() => {
    if (!root.current || reduceMotion) return;
    const groups = Array.from(root.current.querySelectorAll<HTMLElement>(".offer-group"));
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const cards = Array.from(entry.target.querySelectorAll<HTMLElement>(".offer-card"));
          const { animate, stagger } = await import("animejs");
          animate(cards, {
            opacity: [0, 1],
            scale: [0.95, 1],
            y: [20, 0],
            delay: stagger(55),
            duration: 540,
            ease: "outQuad",
          });
        }
      },
      { threshold: 0.08 },
    );
    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, [reduceMotion]);

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
        const isDimmed = activeCategory !== "all" && activeCategory !== category;
        return (
          <div
            className={`offer-group transition-opacity duration-300 ${isDimmed ? "opacity-50" : "opacity-100"}`}
            key={category}
            data-offer-group={category}
          >
            <h3>
              {labels[category][bn ? 0 : 1]}{" "}
              <span>{String(categoryOffers.length).padStart(2, "0")}</span>
            </h3>
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
    </section>
  );
}
