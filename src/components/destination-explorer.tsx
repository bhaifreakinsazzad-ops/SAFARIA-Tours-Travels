"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { animate, stagger } from "animejs";
import { cityName, countryName, destinations, type Destination } from "@/data/catalog";
import { getDestinationMedia } from "@/data/marketing-assets";
import { useFavoriteStore } from "@/lib/favorites-store";
import type { Language } from "@/lib/atlas-data";

type Filter = "all" | "domestic" | "international" | "favorites";

const DAC_LAT = 23.84;
const DAC_LON = 90.4;
const PARTICLE_POOL_SIZE = 18;

function computeFlightMetrics(dest: Destination) {
  if (dest.origin || dest.code === "DAC") {
    return { distanceNm: 0, durationEn: "Origin Hub", durationBn: "যাত্রা শুরুর হাব" };
  }
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(dest.lat - DAC_LAT);
  const dLon = toRad(dest.lon - DAC_LON);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(DAC_LAT)) * Math.cos(toRad(dest.lat)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = 6371 * c;
  const distanceNm = Math.max(45, Math.round(distanceKm * 0.539957));
  const totalMinutes = Math.max(45, Math.round((distanceNm / 455) * 60 + 35));
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round((totalMinutes % 60) / 5) * 5;
  const durationEn = hours > 0 ? `~${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim() : `~${mins}m`;
  const durationBn = hours > 0 ? `~${hours} ঘণ্টা ${mins > 0 ? `${mins} মি.` : ""}`.trim() : `~${mins} মি.`;
  return { distanceNm, durationEn, durationBn };
}

export function DestinationExplorer({
  language,
  onEnquire,
}: {
  language: Language;
  onEnquire: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const particleIndexRef = useRef<number>(0);
  const lastSpawnRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const reduceMotion = useReducedMotion();
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggle);

  useEffect(() => {
    Promise.resolve(useFavoriteStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  const prevFilterRef = useRef<Filter>(filter);

  // anime.js subtle pulse when user actively switches destination filter
  useEffect(() => {
    if (prevFilterRef.current === filter) return;
    prevFilterRef.current = filter;
    if (!gridRef.current || reduceMotion) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wraps = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".destination-card-wrap"));
    if (!wraps.length) return;
    animate(wraps, {
      scale: [0.97, 1],
      delay: stagger(14),
      duration: 280,
      ease: "outQuad",
    });
  }, [filter, reduceMotion]);

  // Custom anime.js interactive cursor + trailing particle emitter for desktop mouse hover only
  const isMouseHoverCapable = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || reduceMotion) return false;
    if (typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  const handleCardPointerEnter = (code: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isMouseHoverCapable(event)) return;
    setHoveredCode(code);

    const { clientX, clientY } = event;
    if (cursorDotRef.current) {
      animate(cursorDotRef.current, {
        translateX: clientX,
        translateY: clientY,
        scale: [0.4, 1],
        opacity: 1,
        duration: 180,
        ease: "outQuad",
      });
    }
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        translateX: clientX,
        translateY: clientY,
        scale: [0.75, 1],
        opacity: 1,
        duration: 260,
        ease: "outBack",
      });
    }
  };

  const handleCardPointerMove = (code: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isMouseHoverCapable(event)) return;
    if (hoveredCode !== code) setHoveredCode(code);

    const { clientX, clientY } = event;

    if (cursorDotRef.current) {
      animate(cursorDotRef.current, {
        translateX: clientX,
        translateY: clientY,
        opacity: 1,
        duration: 65,
        ease: "outQuad",
      });
    }
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        translateX: clientX,
        translateY: clientY,
        opacity: 1,
        duration: 210,
        ease: "outExpo",
      });
    }

    // Spawn trailing anime.js particle from pooled DOM nodes when cursor travels >= 6px
    const dx = clientX - lastSpawnRef.current.x;
    const dy = clientY - lastSpawnRef.current.y;
    if (dx * dx + dy * dy < 36) return;

    lastSpawnRef.current = { x: clientX, y: clientY };
    const seq = particleIndexRef.current;
    const idx = seq % PARTICLE_POOL_SIZE;
    particleIndexRef.current = seq + 1;
    const particleEl = particleRefs.current[idx];
    if (!particleEl) return;

    const goldenAngle = seq * 2.3999632;
    const spread = 14 + (seq % 5) * 4.5;
    const driftX = Math.cos(goldenAngle) * spread;
    const driftY = Math.sin(goldenAngle) * spread - 8;

    animate(particleEl, {
      translateX: [clientX, clientX + driftX],
      translateY: [clientY, clientY + driftY],
      scale: [1.2, 0],
      opacity: [0.9, 0],
      duration: 540,
      ease: "outExpo",
    });
  };

  const handleCardPointerLeave = () => {
    setHoveredCode(null);
    if (cursorDotRef.current) {
      animate(cursorDotRef.current, {
        scale: 0.4,
        opacity: 0,
        duration: 180,
        ease: "outQuad",
      });
    }
    if (cursorRingRef.current) {
      animate(cursorRingRef.current, {
        scale: 0.75,
        opacity: 0,
        duration: 220,
        ease: "outQuad",
      });
    }
  };

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const shell = document.querySelector<HTMLElement>(".site-shell");
    shell?.setAttribute("inert", "");
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => modalRef.current?.querySelector<HTMLElement>("button")?.focus(), 0);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelected(null);
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>("button"));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", keydown);
      shell?.removeAttribute("inert");
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, [selected]);

  const normalized = query.trim().toLocaleLowerCase();
  const matches = destinations.filter(
    (item) =>
      (filter === "all" || (filter === "favorites" ? favorites.includes(item.code) : item.region === filter)) &&
      (!normalized ||
        [item.city, item.country, item.code, cityName(item, "bn"), countryName(item, "bn")].some((value) =>
          value.toLocaleLowerCase().includes(normalized),
        )),
  );
  const filters: { value: Filter; bn: string; en: string }[] = [
    { value: "all", bn: "সব", en: "All" },
    { value: "domestic", bn: "দেশীয়", en: "Domestic" },
    { value: "international", bn: "আন্তর্জাতিক", en: "International" },
    { value: "favorites", bn: "পছন্দ", en: "Saved" },
  ];

  const bn = language === "bn";
  const selectedMetrics = selected ? computeFlightMetrics(selected) : null;

  return (
    <LayoutGroup>
      <section id="sf-destinations" className="content-section explorer-section" aria-labelledby="explorer-title">
        {/* Custom anime.js Interactive Cursor & Trailing Particle Layer (Fixed, Zero CLS) */}
        <div
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: PARTICLE_POOL_SIZE }).map((_, idx) => (
            <span
              key={idx}
              ref={(el) => {
                particleRefs.current[idx] = el;
              }}
              className={`explorer-trail-particle absolute left-0 top-0 -ml-1 -mt-1 h-2 w-2 rounded-full opacity-0 will-change-transform ${
                idx % 2 === 0
                  ? "bg-[#cfb57c] shadow-[0_0_8px_#cfb57c]"
                  : "bg-[#10b981] shadow-[0_0_8px_#10b981]"
              }`}
            />
          ))}

          <div
            ref={cursorDotRef}
            className="explorer-custom-cursor-dot absolute left-0 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-[#cfb57c] opacity-0 shadow-[0_0_12px_#cfb57c] will-change-transform"
          />

          <div
            ref={cursorRingRef}
            className="explorer-custom-cursor-ring absolute left-0 top-0 -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#10b981]/80 bg-[#041713]/40 opacity-0 shadow-[0_0_18px_rgba(16,185,129,0.35)] will-change-transform"
          >
            {hoveredCode && (
              <span className=" -top-5 absolute rounded bg-[#041713] border border-[#cfb57c]/50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#cfb57c] whitespace-nowrap">
                DAC➔{hoveredCode}
              </span>
            )}
          </div>
        </div>

        <div className="section-heading">
          <p className="eyebrow">02 / DESTINATION DIRECTORY</p>
          <h2 id="explorer-title" className="display-heading">
            {bn ? "আপনার পরের গন্তব্য" : "Find your next destination"}
          </h2>
          <p>
            {bn
              ? "৩৩টি শহর ও অঞ্চল খুঁজুন; ঢাকা যাত্রার সূচনা।"
              : "Explore 33 cities and regions, with Dhaka as the origin."}
          </p>
        </div>

        <div className="explorer-toolbar">
          <label className="explorer-search">
            <span className="sr-only">{bn ? "গন্তব্য খুঁজুন" : "Search destinations"}</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={bn ? "শহর, দেশ বা কোড খুঁজুন" : "Search city, country or code"}
            />
          </label>
          <div className="explorer-filters" role="group" aria-label={bn ? "গন্তব্য ফিল্টার" : "Destination filter"}>
            {filters.map((item) => (
              <button
                type="button"
                key={item.value}
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {bn ? item.bn : item.en}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Destination Corridors Visual Strip (W09–W12) */}
        <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(["CXB", "ZYL", "JED", "DXB"] as const).map((code) => {
            const dest = destinations.find((d) => d.code === code);
            if (!dest) return null;
            const media = getDestinationMedia(dest.code, dest.country, dest.region);
            return (
              <button
                key={code}
                type="button"
                onClick={() => setSelected(dest)}
                className="group relative h-28 sm:h-32 overflow-hidden rounded-2xl border border-[rgba(207,181,124,0.28)] bg-[#041713] text-left transition-all hover:border-[#cfb57c]"
              >
                <Image
                  src={media.src}
                  alt={bn ? media.altBn : media.altEn}
                  fill
                  sizes="(max-width: 768px) 50vw, 280px"
                  referrerPolicy="no-referrer"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: media.objectPosition || "center" }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(4, 23, 19, 0.18) 0%, rgba(4, 23, 19, 0.65) 55%, rgba(4, 23, 19, 0.92) 100%)",
                  }}
                />
                <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
                  <div>
                    <span className="block font-mono text-[10px] font-bold text-[#cfb57c]">
                      DAC ➔ {dest.code}
                    </span>
                    <strong className="block text-xs sm:text-sm font-bold text-[#f3f0e7] leading-tight">
                      {cityName(dest, language)}
                    </strong>
                  </div>
                  <span className="text-xs font-bold text-[#cfb57c]" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <p className="explorer-count" aria-live="polite">
          {bn ? `${matches.length}টি গন্তব্য` : `${matches.length} destinations`}
        </p>

        <div className="explorer-grid" ref={gridRef}>
          {matches.map((destination, index) => {
            const metrics = computeFlightMetrics(destination);
            return (
              <div className="destination-card-wrap" key={destination.code}>
                <motion.button
                  type="button"
                  className="explorer-card"
                  layoutId={reduceMotion ? undefined : `destination-${destination.code}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.08 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.36,
                    delay: reduceMotion ? 0 : Math.min((index % 4) * 0.045, 0.16),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onPointerEnter={(event) => handleCardPointerEnter(destination.code, event)}
                  onPointerMove={(event) => handleCardPointerMove(destination.code, event)}
                  onPointerLeave={handleCardPointerLeave}
                  onClick={() => {
                    handleCardPointerLeave();
                    setSelected(destination);
                  }}
                >
                  <span className="explorer-code">
                    {destination.code}
                    {metrics.distanceNm > 0 ? ` · ${metrics.distanceNm.toLocaleString()} NM` : ""}
                  </span>
                  <strong>{cityName(destination, language)}</strong>
                  <span>
                    {countryName(destination, language)} · {bn ? metrics.durationBn : metrics.durationEn}
                  </span>
                  <span className="explorer-arrow" aria-hidden="true">
                    ↗
                  </span>
                  <span className="sr-only">{bn ? "বিস্তারিত দেখুন" : "View details"}</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="favorite-button"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    delay: reduceMotion ? 0 : Math.min((index % 4) * 0.045 + 0.08, 0.24),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  aria-pressed={hydrated && favorites.includes(destination.code)}
                  aria-label={`${
                    hydrated && favorites.includes(destination.code)
                      ? bn
                        ? "পছন্দ থেকে সরান"
                        : "Remove from saved"
                      : bn
                        ? "পছন্দে রাখুন"
                        : "Save"
                  } ${cityName(destination, language)}`}
                  onClick={() => toggleFavorite(destination.code)}
                >
                  {hydrated && favorites.includes(destination.code) ? "♥" : "♡"}
                </motion.button>
              </div>
            );
          })}
        </div>

        {!matches.length && (
          <p className="empty-state">
            {bn ? "এই ফিল্টারে কোনো গন্তব্য পাওয়া যায়নি।" : "No destinations match this search."}
          </p>
        )}
      </section>

      {selected &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            className="dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="destination-detail-title"
              className="destination-detail ivory-surface"
              layoutId={reduceMotion ? undefined : `destination-${selected.code}`}
            >
              <button
                type="button"
                className="dialog-close"
                onClick={() => setSelected(null)}
                aria-label={bn ? "বন্ধ করুন" : "Close"}
              >
                ×
              </button>

              {(() => {
                const selectedMedia = getDestinationMedia(
                  selected.code,
                  selected.country,
                  selected.region,
                );
                return (
                  <div className="relative mb-4 h-40 sm:h-48 w-full overflow-hidden rounded-xl border border-[#d6c59e] bg-[#041713]">
                    <Image
                      src={selectedMedia.src}
                      alt={bn ? selectedMedia.altBn : selectedMedia.altEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 560px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                      style={{ objectPosition: selectedMedia.objectPosition || "center" }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(4, 23, 19, 0.14) 0%, rgba(4, 23, 19, 0.50) 55%, rgba(4, 23, 19, 0.88) 100%)",
                      }}
                    />
                    <span className="absolute bottom-2.5 left-3 rounded-md border border-[rgba(207,181,124,0.45)] bg-[#041713]/85 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#cfb57c]">
                      {bn ? selectedMedia.badgeBn : selectedMedia.badgeEn}
                    </span>
                  </div>
                );
              })()}

              <p className="eyebrow">DAC → {selected.code}</p>
              <h3 id="destination-detail-title" className="display-heading">
                {cityName(selected, language)}
              </h3>
              <p>
                {countryName(selected, language)} ·{" "}
                {selected.region === "domestic"
                  ? bn
                    ? "দেশীয়"
                    : "Domestic"
                  : bn
                    ? "আন্তর্জাতিক"
                    : "International"}
              </p>

              {/* Route Telemetry Summary Strip */}
              {selectedMetrics && (
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-[#d6c59e] bg-[#f5ebd6] p-3 text-xs text-[#062b27]">
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[#386258]">
                      {bn ? "দূরত্ব" : "Distance"}
                    </span>
                    <strong className="font-mono text-sm tabular-nums">
                      {selectedMetrics.distanceNm > 0
                        ? `${selectedMetrics.distanceNm.toLocaleString()} NM`
                        : "0 NM"}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[#386258]">
                      {bn ? "সম্ভাব্য সময়" : "Est. Flight"}
                    </span>
                    <strong className="text-sm tabular-nums">
                      {bn ? selectedMetrics.durationBn : selectedMetrics.durationEn}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-[#386258]">
                      {bn ? "স্থানাঙ্ক" : "Coordinates"}
                    </span>
                    <strong className="font-mono text-xs tabular-nums">
                      {selected.lat.toFixed(1)}°, {selected.lon.toFixed(1)}°
                    </strong>
                  </div>
                </div>
              )}

              <p className="detail-disclaimer">
                {bn
                  ? "রুট, সময় ও ভাড়া সরবরাহকারীর নিশ্চিতকরণ সাপেক্ষে।"
                  : "Routes, schedules and fares are subject to supplier confirmation."}
              </p>
              <button
                type="button"
                className="button button-gold"
                onClick={() => {
                  const code = selected.origin ? "" : selected.code;
                  setSelected(null);
                  window.setTimeout(() => onEnquire(code), 0);
                }}
              >
                {selected.origin
                  ? bn
                    ? "ঢাকা থেকে পরিকল্পনা করুন"
                    : "Plan from Dhaka"
                  : bn
                    ? "কোটেশন চান"
                    : "Request quotation"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </LayoutGroup>
  );
}
