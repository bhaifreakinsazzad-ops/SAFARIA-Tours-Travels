"use client";

import React, { useState } from "react";
import { MapPin, Plane, ArrowRight } from "lucide-react";
import { SITE_CONFIG, Airport } from "@/lib/config/siteConfig";

interface DestinationGridProps {
  lang: "bn" | "en";
  onSelectDestination?: (airport: Airport) => void;
}

export function DestinationGrid({ lang, onSelectDestination }: DestinationGridProps) {
  const isBn = lang === "bn";
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = [
    { id: "ALL", labelBn: "সব গন্তব্য (৩৩)", labelEn: "All Hubs (33)" },
    { id: "DOMESTIC", labelBn: "অভ্যন্তরীণ বাংলাদেশ (৮)", labelEn: "Domestic BD (8)" },
    { id: "MIDDLE_EAST", labelBn: "মধ্যপ্রাচ্য", labelEn: "Middle East" },
    { id: "SOUTH_ASIA", labelBn: "দক্ষিণ এশিয়া", labelEn: "South Asia" },
    { id: "SOUTHEAST_ASIA", labelBn: "দক্ষিণ-পূর্ব এশিয়া", labelEn: "SE Asia" },
    { id: "EUROPE", labelBn: "ইউরোপ ও আমেরিকা", labelEn: "Europe & Americas" },
  ];

  const filteredAirports = SITE_CONFIG.airports.filter((airport) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "EUROPE") {
      return airport.region === "EUROPE" || airport.region === "NORTH_AMERICA";
    }
    return airport.region === activeCategory;
  });

  const handleSelect = (airport: Airport) => {
    if (onSelectDestination) {
      onSelectDestination(airport);
    } else {
      const el = document.getElementById("flight-quote");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="destinations" className="bg-surface-100 py-16 sm:py-24 border-b border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-safaria-gold">
            <MapPin className="h-4 w-4" />
            <span>{isBn ? "বিমানবন্দর ও গন্তব্য নেটওয়ার্ক" : "Destinations & Corridors"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-safaria-ink">
            {isBn ? "জনপ্রিয় আন্তর্জাতিক ও অভ্যন্তরীণ গন্তব্য" : "Featured Global Destinations"}
          </h2>
          <p className="text-sm sm:text-base text-safaria-inkMuted">
            {isBn
              ? "ঢাকা শাহজালাল বিমানবন্দর থেকে দেশ-বিদেশের ৩৩টি শীর্ষ বিমানবন্দর। যেকোনো গন্তব্য নির্বাচন করে কোটেশন নিন।"
              : "Connecting Hazrat Shahjalal International Airport (DAC) to 33 premier domestic and global airports."}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? "border-safaria-gold bg-safaria-gold text-safaria-onGold shadow-btn"
                    : "border-safaria-line/60 bg-surface-200/60 text-safaria-inkMuted hover:text-safaria-ink hover:border-safaria-gold/40"
                }`}
              >
                {isBn ? cat.labelBn : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* 33 Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAirports.map((airport) => (
            <div
              key={airport.iata}
              className="group relative rounded-xl border border-safaria-line/70 bg-surface-200/70 p-4 transition-all duration-300 hover:border-safaria-gold/80 hover:bg-surface-200 hover:shadow-panel flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold text-safaria-gold">
                    {airport.iata}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-safaria-inkFaint rounded bg-surface-0 px-2 py-0.5 border border-safaria-line/40">
                    {airport.country}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-lg font-bold text-safaria-ink group-hover:text-safaria-gold transition-colors">
                    {isBn ? airport.cityBn : airport.cityEn}
                  </h3>
                  <p className="text-xs text-safaria-inkMuted line-clamp-1">
                    {isBn ? airport.nameBn : airport.nameEn}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-safaria-line/40 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-safaria-inkFaint font-mono">
                  From DAC
                </span>
                <button
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className="flex items-center gap-1 text-xs font-semibold text-safaria-gold hover:underline group-hover:translate-x-0.5 transition-transform"
                >
                  <span>{isBn ? "কোটেশন নিন" : "Get Quote"}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
