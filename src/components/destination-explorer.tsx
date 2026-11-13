"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cityName, countryName, destinations, type Destination } from "@/data/catalog";
import { useFavoriteStore } from "@/lib/favorites-store";
import type { Language } from "@/lib/atlas-data";

type Filter = "all" | "domestic" | "international" | "favorites";

const DAC_LAT = 23.84;
const DAC_LON = 90.4;

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
  const modalRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggle);

  useEffect(() => {
    Promise.resolve(useFavoriteStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  // anime.js cascade animation when filter changes
  useEffect(() => {
    if (!gridRef.current || reduceMotion) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wraps = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".destination-card-wrap"));
    if (!wraps.length) return;
    void import("animejs").then(({ animate, stagger }) => {
      animate(wraps, {
        opacity: [0.4, 1],
        translateY: [10, 0],
        delay: stagger(16),
        duration: 320,
        ease: "outQuad",
      });
    });
  }, [filter, reduceMotion]);

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

        <p className="explorer-count" aria-live="polite">
          {bn ? `${matches.length}টি গন্তব্য` : `${matches.length} destinations`}
        </p>

        <div className="explorer-grid" ref={gridRef}>
          {matches.map((destination) => {
            const metrics = computeFlightMetrics(destination);
            return (
              <div className="destination-card-wrap" key={destination.code}>
                <motion.button
                  type="button"
                  className="explorer-card"
                  layoutId={reduceMotion ? undefined : `destination-${destination.code}`}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setSelected(destination)}
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
                <button
                  type="button"
                  className="favorite-button"
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
                </button>
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
