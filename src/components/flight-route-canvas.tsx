"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { Plane, Compass, Navigation, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export interface FlightCorridor {
  code: string;
  destination: string;
  destinationBn: string;
  airport: string;
  country: string;
  countryBn: string;
  duration: string;
  durationBn: string;
  distanceNm: string;
  altitude: string;
  aircraft: string;
  airlines: string[];
  tag: string;
  tagBn: string;
  // SVG relative coordinates on 800x420 viewBox
  destX: number;
  destY: number;
  curveY: number;
}

const CORRIDORS: FlightCorridor[] = [
  {
    code: "DXB",
    destination: "Dubai",
    destinationBn: "দুবাই",
    airport: "DXB International",
    country: "United Arab Emirates",
    countryBn: "সংযুক্ত আরব আমিরাত",
    duration: "4h 50m",
    durationBn: "৪ ঘণ্টা ৫০ মি.",
    distanceNm: "1,920 NM",
    altitude: "FL380 (38,000 FT)",
    aircraft: "Boeing 777-300ER / A350",
    airlines: ["Emirates", "Biman", "Flydubai"],
    tag: "High-Yield Transit",
    tagBn: "প্রিমিয়াম ট্রানজিট",
    destX: 310,
    destY: 220,
    curveY: 130,
  },
  {
    code: "LHR",
    destination: "London Heathrow",
    destinationBn: "লন্ডন হিথ্রো",
    airport: "Heathrow Airport",
    country: "United Kingdom",
    countryBn: "যুক্তরাজ্য",
    duration: "10h 30m",
    durationBn: "১০ ঘণ্টা ৩০ মি.",
    distanceNm: "4,320 NM",
    altitude: "FL400 (40,000 FT)",
    aircraft: "Boeing 787-9 Dreamliner",
    airlines: ["Biman", "British Airways", "Qatar Airways"],
    tag: "Corporate & Student",
    tagBn: "কর্পোরেট ও উচ্চশিক্ষা",
    destX: 180,
    destY: 120,
    curveY: 60,
  },
  {
    code: "SIN",
    destination: "Singapore",
    destinationBn: "সিঙ্গাপুর",
    airport: "Changi Airport (SIN)",
    country: "Singapore",
    countryBn: "সিঙ্গাপুর",
    duration: "4h 05m",
    durationBn: "৪ ঘণ্টা ০৫ মি.",
    distanceNm: "1,550 NM",
    altitude: "FL370 (37,000 FT)",
    aircraft: "Airbus A350-900 / B737 Max",
    airlines: ["Singapore Airlines", "Biman", "US-Bangla"],
    tag: "MICE & Business",
    tagBn: "বিজনেস ও এমআইসিই",
    destX: 620,
    destY: 330,
    curveY: 230,
  },
  {
    code: "BKK",
    destination: "Bangkok",
    destinationBn: "ব্যাংকক",
    airport: "Suvarnabhumi Airport (BKK)",
    country: "Thailand",
    countryBn: "থাইল্যান্ড",
    duration: "2h 35m",
    durationBn: "২ ঘণ্টা ৩৫ মি.",
    distanceNm: "830 NM",
    altitude: "FL350 (35,000 FT)",
    aircraft: "Airbus A320 / Boeing 777",
    airlines: ["Thai Airways", "Biman", "US-Bangla"],
    tag: "Medical & Leisure",
    tagBn: "চিকিৎসা ও পর্যটন",
    destX: 560,
    destY: 240,
    curveY: 170,
  },
  {
    code: "JED",
    destination: "Jeddah",
    destinationBn: "জেদ্দা",
    airport: "King Abdulaziz Intl (JED)",
    country: "Saudi Arabia",
    countryBn: "সৌদি আরব",
    duration: "6h 15m",
    durationBn: "৬ ঘণ্টা ১৫ মি.",
    distanceNm: "2,780 NM",
    altitude: "FL390 (39,000 FT)",
    aircraft: "Boeing 777-300ER / Saudia SV",
    airlines: ["Saudia", "Biman Bangladesh", "Flynas"],
    tag: "Umrah VIP Corridor",
    tagBn: "ভিআইপি ওমরাহ করিডোর",
    destX: 250,
    destY: 260,
    curveY: 160,
  },
  {
    code: "KUL",
    destination: "Kuala Lumpur",
    destinationBn: "কুয়ালালামপুর",
    airport: "KLIA International (KUL)",
    country: "Malaysia",
    countryBn: "মালয়েশিয়া",
    duration: "3h 50m",
    durationBn: "৩ ঘণ্টা ৫০ মি.",
    distanceNm: "1,420 NM",
    altitude: "FL360 (36,000 FT)",
    aircraft: "Boeing 737-800 / A330",
    airlines: ["Malaysia Airlines", "Batik Air", "Biman"],
    tag: "Holiday & Tech Hub",
    tagBn: "হলিডে ও কমার্শিয়াল",
    destX: 590,
    destY: 300,
    curveY: 210,
  },
];

// Origin coordinates for Dhaka (DAC)
const ORIGIN = { x: 470, y: 195, code: "DAC", name: "Dhaka", nameBn: "ঢাকা" };

export function FlightRouteCanvas({
  language = "en",
  onSelectRoute,
}: {
  language?: "en" | "bn";
  onSelectRoute: (code: string) => void;
}) {
  const [activeCode, setActiveCode] = useState<string>("DXB");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const planeMarkerRef = useRef<SVGGElement | null>(null);
  const radarWaveRef = useRef<SVGCircleElement | null>(null);
  const idPrefix = useId();

  const activeCorridor = CORRIDORS.find((c) => c.code === activeCode) || CORRIDORS[0];

  // SVG curved path calculation from DAC to Destination
  const activePathD = `M ${ORIGIN.x} ${ORIGIN.y} Q ${(ORIGIN.x + activeCorridor.destX) / 2} ${activeCorridor.curveY} ${activeCorridor.destX} ${activeCorridor.destY}`;

  // anime.js v4 path sweep and radar ripple animation when corridor changes
  useEffect(() => {
    if (!pathRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    try {
      const pathEl = pathRef.current;
      const length = pathEl.getTotalLength ? pathEl.getTotalLength() : 400;

      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;

      // 1. Dash-draw flight path using anime.js v4
      animate(pathEl, {
        strokeDashoffset: [length, 0],
        duration: 950,
        ease: "outQuad",
      });

      // 2. Pulse destination airport radar beacon
      if (radarWaveRef.current) {
        animate(radarWaveRef.current, {
          r: [8, 28],
          opacity: [0.8, 0],
          duration: 1200,
          loop: true,
          ease: "outCubic",
        });
      }
    } catch {
      // Graceful fallback for non-SVG / test environments
    }
  }, [activeCode, activeCorridor]);

  return (
    <section
      aria-labelledby={`${idPrefix}-skyway-heading`}
      className="relative my-12 overflow-hidden rounded-3xl border border-[rgba(207,181,124,0.35)] bg-gradient-to-b from-[#041713] via-[#06241e] to-[#031310] p-5 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.6)]"
    >
      {/* Decorative Luxury Radial Glow */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(207,181,124,0.15)_0%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      {/* Header with Luxury Aviation Badge */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[rgba(207,181,124,0.2)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(207,181,124,0.4)] bg-[rgba(9,44,39,0.6)] px-3 py-1 text-xs text-[#cfb57c]">
            <Compass className="h-3.5 w-3.5 text-[#10b981]" />
            <span className="font-mono font-semibold tracking-wider uppercase">
              {language === "bn" ? "সাফারিয়া স্কাইওয়ে™ লাইভ করিডোর" : "SAFARIA SKYWAY™ LIVE CORRIDOR"}
            </span>
          </div>
          <h2
            id={`${idPrefix}-skyway-heading`}
            className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#f3f0e7] tracking-tight"
          >
            {language === "bn"
              ? "ঢাকা থেকে বৈশ্বিক আকাশপথ নেটওয়ার্ক"
              : "Direct Corridors from Dhaka Hub"}
          </h2>
          <p className="mt-1 text-sm text-[#b1c3bc] max-w-xl">
            {language === "bn"
              ? "আমাদের জিডিএস সিঙ্কড এয়ারলাইন নেটওয়ার্কের মাধ্যমে তাত্ক্ষণিক সিট কোটা, করপোরেট ফেয়ার ও ওমরাহ ব্লক বুকিং নিশ্চিত করুন।"
              : "Live visual telemetry of high-frequency trunk routes. Select a corridor to inspect flight parameters and trigger priority allocation."}
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3 bg-[rgba(4,23,19,0.85)] border border-[rgba(207,181,124,0.3)] rounded-2xl px-4 py-2 self-start md:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]" />
          </span>
          <div className="text-left font-mono">
            <span className="text-[10px] uppercase text-[#b1c3bc] block leading-none">Radar Feed</span>
            <span className="text-xs text-[#cfb57c] font-bold">DAC-TRUNK-ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Corridor Selector Tabs */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Flight corridor selector">
        {CORRIDORS.map((corridor) => {
          const isSelected = corridor.code === activeCode;
          return (
            <button
              key={corridor.code}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveCode(corridor.code)}
              className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[#cfb57c] text-[#041713] font-bold shadow-[0_4px_16px_rgba(207,181,124,0.35)] scale-[1.02]"
                  : "bg-[rgba(9,44,39,0.6)] text-[#b1c3bc] hover:bg-[#0d3b34] hover:text-[#f3f0e7] border border-[rgba(207,181,124,0.2)]"
              }`}
            >
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isSelected ? "bg-[#041713] text-[#cfb57c]" : "bg-[rgba(4,23,19,0.7)] text-[#cfb57c]"
              }`}>
                {corridor.code}
              </span>
              <span>{language === "bn" ? corridor.destinationBn : corridor.destination}</span>
              <span className={`text-[10px] opacity-80 ${isSelected ? "text-[#041713]" : "text-[#8ea59d]"}`}>
                ({corridor.duration})
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Radar Grid & Interactive Flight Corridor Display */}
      <div className="relative z-10 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Viewport (8 cols on lg) */}
        <div className="relative lg:col-span-7 rounded-2xl border border-[rgba(207,181,124,0.25)] bg-[rgba(3,19,16,0.95)] p-2 sm:p-4 overflow-hidden shadow-inner aspect-[800/460]">
          {/* Subtle Radar Compass Rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25" aria-hidden="true">
            <div className="h-[280px] w-[280px] rounded-full border border-dashed border-[#cfb57c]" />
            <div className="absolute h-[180px] w-[180px] rounded-full border border-[#10b981]" />
            <div className="absolute h-[380px] w-[380px] rounded-full border border-[rgba(207,181,124,0.15)]" />
            <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[rgba(207,181,124,0.2)] to-transparent" />
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[rgba(207,181,124,0.2)] to-transparent" />
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 800 420"
            className="relative h-full w-full"
            aria-label={`Interactive flight route from Dhaka (DAC) to ${activeCorridor.destination} (${activeCorridor.code})`}
          >
            <defs>
              <linearGradient id={`${idPrefix}-goldLine`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f1d49b" stopOpacity="1" />
                <stop offset="100%" stopColor="#cfb57c" stopOpacity="0.9" />
              </linearGradient>
              <filter id={`${idPrefix}-glow`} x1="-20%" y1="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Inactive Corridor Backdrops */}
            {CORRIDORS.filter((c) => c.code !== activeCode).map((corridor) => (
              <g key={corridor.code} className="opacity-30 hover:opacity-70 transition-opacity cursor-pointer" onClick={() => setActiveCode(corridor.code)}>
                <path
                  d={`M ${ORIGIN.x} ${ORIGIN.y} Q ${(ORIGIN.x + corridor.destX) / 2} ${corridor.curveY} ${corridor.destX} ${corridor.destY}`}
                  fill="none"
                  stroke="#57756b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle cx={corridor.destX} cy={corridor.destY} r="3" fill="#cfb57c" />
                <text
                  x={corridor.destX}
                  y={corridor.destY - 9}
                  fill="#8ea59d"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {corridor.code}
                </text>
              </g>
            ))}

            {/* Active Flight Path Arc (anime.js animates strokeDashoffset) */}
            <path
              ref={pathRef}
              d={activePathD}
              fill="none"
              stroke={`url(#${idPrefix}-goldLine)`}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter={`url(#${idPrefix}-glow)`}
            />

            {/* Origin Node: Dhaka Hub (DAC) */}
            <g transform={`translate(${ORIGIN.x}, ${ORIGIN.y})`}>
              <circle r="14" fill="rgba(16,185,129,0.18)" />
              <circle r="7" fill="#10b981" className="shadow-lg" />
              <circle r="3" fill="#ffffff" />
              <text
                x="0"
                y="24"
                fill="#10b981"
                fontSize="12"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                DAC (ORIGIN)
              </text>
            </g>

            {/* Destination Node */}
            <g transform={`translate(${activeCorridor.destX}, ${activeCorridor.destY})`}>
              {/* Animated Radar Pulse Wave */}
              <circle
                ref={radarWaveRef}
                r="10"
                fill="none"
                stroke="#cfb57c"
                strokeWidth="1.5"
                opacity="0.8"
              />
              <circle r="9" fill="rgba(207,181,124,0.3)" />
              <circle r="5" fill="#cfb57c" />
              <circle r="2" fill="#041713" />
              <text
                x="0"
                y="-14"
                fill="#f1d49b"
                fontSize="13"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                filter={`url(#${idPrefix}-glow)`}
              >
                {activeCorridor.code}
              </text>
            </g>

            {/* Moving Aircraft Marker along Corridor mid-point */}
            <g
              ref={planeMarkerRef}
              transform={`translate(${(ORIGIN.x + activeCorridor.destX) / 2}, ${activeCorridor.curveY + 12})`}
            >
              <circle r="16" fill="rgba(4,23,19,0.85)" stroke="#cfb57c" strokeWidth="1" />
              <path
                d="M-5 -2 L0 -7 L5 -2 L3 4 L-3 4 Z"
                fill="#f1d49b"
                transform="rotate(45)"
              />
            </g>
          </svg>

          {/* Floating Radar Grid Footer Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-[#8ea59d] bg-[rgba(4,23,19,0.85)] backdrop-blur-md px-3 py-1.5 rounded-lg border border-[rgba(207,181,124,0.2)]">
            <span className="flex items-center gap-1.5 text-[#cfb57c]">
              <Navigation className="h-3 w-3 text-[#10b981]" />
              <span>RADAR VECTOR: {ORIGIN.code} ➔ {activeCorridor.code}</span>
            </span>
            <span className="hidden sm:inline text-[#f3f0e7]">
              {activeCorridor.distanceNm}
            </span>
          </div>
        </div>

        {/* Corridor Details & Instant Booking Action (5 cols on lg) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCorridor.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-[rgba(207,181,124,0.3)] bg-[rgba(4,23,19,0.7)] p-6 space-y-5"
            >
              {/* Badge & Title */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(207,181,124,0.2)] text-[#cfb57c] border border-[rgba(207,181,124,0.3)]">
                    <Sparkles className="h-3 w-3" />
                    {language === "bn" ? activeCorridor.tagBn : activeCorridor.tag}
                  </span>
                  <h3 className="mt-2 text-2xl font-serif font-bold text-[#f3f0e7]">
                    {language === "bn" ? activeCorridor.destinationBn : activeCorridor.destination}
                  </h3>
                  <p className="text-xs text-[#b1c3bc]">
                    {language === "bn" ? activeCorridor.countryBn : activeCorridor.country} · {activeCorridor.airport}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-[#cfb57c]">{activeCorridor.code}</div>
                  <span className="text-[10px] font-mono text-[#8ea59d]">IATA CODE</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[rgba(2,15,12,0.8)] p-3.5 rounded-xl border border-[rgba(207,181,124,0.18)] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8ea59d] flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#cfb57c]" />
                    {language === "bn" ? "ফ্লাইট সময়" : "Flight Duration"}
                  </span>
                  <strong className="text-sm font-semibold text-[#f3f0e7] mt-0.5 block">
                    {language === "bn" ? activeCorridor.durationBn : activeCorridor.duration}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8ea59d] flex items-center gap-1">
                    <Plane className="h-3 w-3 text-[#10b981]" />
                    {language === "bn" ? "দূরত্ব" : "Distance"}
                  </span>
                  <strong className="text-sm font-semibold text-[#f3f0e7] mt-0.5 block">
                    {activeCorridor.distanceNm}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8ea59d]">
                    {language === "bn" ? "ক্রুজিং উচ্চতা" : "Cruising Level"}
                  </span>
                  <span className="text-xs font-mono text-[#cfb57c] block mt-0.5">
                    {activeCorridor.altitude}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8ea59d]">
                    {language === "bn" ? "এয়ারক্রাফট টাইপ" : "Aircraft"}
                  </span>
                  <span className="text-xs text-[#b1c3bc] block mt-0.5 truncate">
                    {activeCorridor.aircraft}
                  </span>
                </div>
              </div>

              {/* Supported Airlines */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#cfb57c] block mb-2">
                  {language === "bn" ? "সরাসরি ও কানেক্টিং ক্যারিয়ারসমূহ" : "Serviced Airline Carriers"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCorridor.airlines.map((airline) => (
                    <span
                      key={airline}
                      className="px-2.5 py-1 rounded-lg bg-[rgba(9,44,39,0.8)] border border-[rgba(207,181,124,0.25)] text-[11px] text-[#f3f0e7] font-medium"
                    >
                      {airline}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guaranteed Fulfillment Note */}
              <div className="flex items-center gap-2 text-[11px] text-[#b1c3bc] bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.25)] p-2.5 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-[#10b981] flex-shrink-0" />
                <span>
                  {language === "bn"
                    ? "বি২বি পার্টনারদের জন্য স্পট কোটা ও গ্রুপ ব্লক রিজার্ভেশন অগ্রাধিকার ভিত্তিতে নিশ্চিত করা হয়।"
                    : "Priority block allocation and direct fare-locking available for registered B2B partners."}
                </span>
              </div>

              {/* High-Converting CTA */}
              <button
                type="button"
                onClick={() => onSelectRoute(activeCorridor.code)}
                className="w-full group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#cfb57c] via-[#dfca95] to-[#cfb57c] py-3.5 px-4 text-sm font-bold text-[#041713] shadow-[0_8px_24px_rgba(207,181,124,0.35)] hover:shadow-[0_12px_32px_rgba(207,181,124,0.5)] hover:scale-[1.01] transition-all"
              >
                <span>
                  {language === "bn"
                    ? `${activeCorridor.destinationBn} রুটের কোটেশন রিকোয়েস্ট করুন`
                    : `Request Route Quotation for ${activeCorridor.code}`}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
