"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cityName, countryName, destinations, type Destination } from "@/data/catalog";
import { useFavoriteStore } from "@/lib/favorites-store";
import type { Language } from "@/lib/atlas-data";

type Filter = "all" | "domestic" | "international" | "favorites";

export function DestinationExplorer({ language, onEnquire }: { language: Language; onEnquire: (code: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggle);

  useEffect(() => {
    Promise.resolve(useFavoriteStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const shell = document.querySelector<HTMLElement>(".site-shell");
    shell?.setAttribute("inert", "");
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => modalRef.current?.querySelector<HTMLElement>("button")?.focus(), 0);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setSelected(null); return; }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>("button"));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
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
  const matches = destinations.filter((item) =>
    (filter === "all" || (filter === "favorites" ? favorites.includes(item.code) : item.region === filter)) &&
    (!normalized || [item.city, item.country, item.code, cityName(item, "bn"), countryName(item, "bn")].some((value) => value.toLocaleLowerCase().includes(normalized)))
  );
  const filters: { value: Filter; bn: string; en: string }[] = [
    { value: "all", bn: "সব", en: "All" },
    { value: "domestic", bn: "দেশীয়", en: "Domestic" },
    { value: "international", bn: "আন্তর্জাতিক", en: "International" },
    { value: "favorites", bn: "পছন্দ", en: "Saved" },
  ];

  return (
    <LayoutGroup>
      <section id="sf-destinations" className="bg-sf-000 p-space-5 rounded-radius-md shadow-header" aria-labelledby="explorer-title">
        <div className="section-heading"><p className="eyebrow">02 / DESTINATION DIRECTORY</p><h2 id="explorer-title" className="display-heading">{language === "bn" ? "আপনার পরের গন্তব্য" : "Find your next destination"}</h2><p>{language === "bn" ? "৩৩টি শহর ও অঞ্চল খুঁজুন; ঢাকা যাত্রার সূচনা।" : "Explore 33 cities and regions, with Dhaka as the origin."}</p></div>
        <div className="explorer-toolbar">
          <label className="explorer-search"><span className="sr-only">{language === "bn" ? "গন্তব্য খুঁজুন" : "Search destinations"}</span><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === "bn" ? "শহর, দেশ বা কোড খুঁজুন" : "Search city, country or code"} /></label>
          <div className="explorer-filters" role="group" aria-label={language === "bn" ? "গন্তব্য ফিল্টার" : "Destination filter"}>
            {filters.map((item) => (
              <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{language === "bn" ? item.bn : item.en}</button>
            ))}
          </div>
        </div>
        <p className="explorer-count" aria-live="polite">{language === "bn" ? `${matches.length}টি গন্তব্য` : `${matches.length} destinations`}</p>
        <div className="explorer-grid grid gap-space-4">
          {matches.map((destination) => (
            <div className="destination-card-wrap bg-sf-100 p-space-3 rounded-radius-sm shadow-panel" key={destination.code}>
              <motion.button type="button" className="explorer-card" layoutId={reduceMotion ? undefined : `destination-${destination.code}`} onClick={() => setSelected(destination)}>
                <span className="explorer-code">{destination.code}</span><strong>{cityName(destination, language)}</strong><span>{countryName(destination, language)}</span><span className="explorer-arrow" aria-hidden="true">↗</span><span className="sr-only">{language === "bn" ? "বিস্তারিত দেখুন" : "View details"}</span>
              </motion.button>
              <button type="button" className="favorite-button" aria-pressed={hydrated && favorites.includes(destination.code)} aria-label={`${hydrated && favorites.includes(destination.code) ? (language === "bn" ? "পছন্দ থেকে সরান" : "Remove from saved") : (language === "bn" ? "পছন্দে রাখুন" : "Save")} ${cityName(destination, language)}`} onClick={() => toggleFavorite(destination.code)}>{hydrated && favorites.includes(destination.code) ? "♥" : "♡"}</button>
            </div>
          ))}
        </div>
        {!matches.length && <p className="empty-state">{language === "bn" ? "এই ফিল্টারে কোনো গন্তব্য পাওয়া যায়নি।" : "No destinations match this search."}</p>}
      </section>
      {selected && typeof document !== "undefined" && createPortal(
        <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <motion.div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="destination-detail-title" className="destination-detail bg-sf-200 p-space-4 rounded-radius-md shadow-panel" layoutId={reduceMotion ? undefined : `destination-${selected.code}`}>
            <button type="button" className="dialog-close" onClick={() => setSelected(null)} aria-label={language === "bn" ? "বন্ধ করুন" : "Close"}>×</button>
            <p className="eyebrow">DAC → {selected.code}</p>
            <h3 id="destination-detail-title" className="display-heading">{cityName(selected, language)}</h3>
            <p>{countryName(selected, language)} · {selected.region === "domestic" ? (language === "bn" ? "দেশীয়" : "Domestic") : (language === "bn" ? "আন্তর্জাতিক" : "International")}</p>
            <p className="detail-disclaimer">{language === "bn" ? "রুট, সময় ও ভাড়া সরবরাহকারীর নিশ্চিতকরণ সাপেক্ষে।" : "Routes, schedules and fares are subject to supplier confirmation."}</p>
            <button type="button" className="button button-gold" onClick={() => { const code = selected.origin ? "" : selected.code; setSelected(null); window.setTimeout(() => onEnquire(code), 0); }}>{selected.origin ? (language === "bn" ? "ঢাকা থেকে পরিকল্পনা করুন" : "Plan from Dhaka") : (language === "bn" ? "কোটেশন চান" : "Request quotation")} <span aria-hidden="true">↗</span></button>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </LayoutGroup>
  );
}
