"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Plane, Compass, ChevronUp, ChevronDown, Play, Pause } from "lucide-react";

interface Waypoint {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  targetId: string;
  progressTarget: number;
}

const WAYPOINTS: Waypoint[] = [
  { id: "dac", code: "DAC", nameEn: "Dhaka (Origin)", nameBn: "ঢাকা (যাত্রা শুরু)", targetId: "sf-home", progressTarget: 0.0 },
  { id: "offers", code: "DXB", nameEn: "Dubai (Services)", nameBn: "দুবাই (কিউরেটেড সেবা)", targetId: "sf26-offers", progressTarget: 0.25 },
  { id: "dest", code: "LHR", nameEn: "London (Destinations)", nameBn: "লন্ডন (গন্তব্যসমূহ)", targetId: "sf-destinations", progressTarget: 0.5 },
  { id: "studio", code: "SIN", nameEn: "Singapore (Studio)", nameBn: "সিঙ্গাপুর (স্টুডিও)", targetId: "sf-travel-form", progressTarget: 0.75 },
  { id: "agency", code: "JED", nameEn: "Jeddah (B2B Desks)", nameBn: "জেদ্দা (বি২বি পার্টনার)", targetId: "sf-agency", progressTarget: 1.0 },
];

export function FlightProgressHUD({ language = "en" }: { language?: "en" | "bn" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCode, setActiveCode] = useState("DAC");
  const [autoGlide, setAutoGlide] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const altitude = useTransform(smoothProgress, [0, 0.15, 0.5, 0.85, 1], [0, 24000, 39000, 31000, 0]);
  const groundSpeed = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [140, 520, 560, 160]);
  const planeRotation = useTransform(smoothProgress, [0, 0.5, 1], [-5, 0, 5]);

  const [displayAltitude, setDisplayAltitude] = useState(0);
  const [displaySpeed, setDisplaySpeed] = useState(140);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const unsubAlt = altitude.on("change", (latest) => setDisplayAltitude(Math.round(latest)));
    const unsubSpd = groundSpeed.on("change", (latest) => setDisplaySpeed(Math.round(latest)));
    const unsubPct = smoothProgress.on("change", (latest) => {
      setScrollPct(Math.round(latest * 100));
      if (latest < 0.18) setActiveCode("DAC");
      else if (latest < 0.4) setActiveCode("DXB");
      else if (latest < 0.65) setActiveCode("LHR");
      else if (latest < 0.88) setActiveCode("SIN");
      else setActiveCode("JED");
    });

    return () => {
      unsubAlt();
      unsubSpd();
      unsubPct();
    };
  }, [altitude, groundSpeed, smoothProgress]);

  // Automatic Waypoint Tour Glide when activated by user
  useEffect(() => {
    if (!autoGlide) return;
    const timer = window.setInterval(() => {
      const currentIdx = WAYPOINTS.findIndex((w) => w.code === activeCode);
      const nextIdx = (currentIdx + 1) % WAYPOINTS.length;
      const el = document.getElementById(WAYPOINTS[nextIdx].targetId);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [autoGlide, activeCode]);

  const scrollToWaypoint = (targetId: string) => {
    setAutoGlide(false);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getFlightPhase = () => {
    if (scrollPct < 8) return language === "bn" ? "ট্যাক্সিওয়ে প্রস্তুত" : "Boarding & Taxi";
    if (scrollPct < 25) return language === "bn" ? "আরোহণ পর্যায়" : "Initial Climb";
    if (scrollPct < 85) return language === "bn" ? "ক্রুজিং অল্টিটিউড" : "Cruising Corridor";
    return language === "bn" ? "অবতরণ পর্যায়" : "Approach & Arrival";
  };

  const bn = language === "bn";

  return (
    <aside
      aria-label="Flight Cruise Progress HUD"
      className="fixed bottom-6 right-6 z-40 hidden sm:flex flex-col items-end pointer-events-auto"
    >
      <motion.div
        layout
        className="rounded-2xl border border-[rgba(207,181,124,0.35)] bg-[rgba(4,23,19,0.94)] shadow-[0_18px_50px_rgba(0,0,0,0.45)] text-[#f3f0e7] overflow-hidden transition-all"
        style={{ width: isExpanded ? 320 : "auto" }}
      >
        {/* Compact Flight Status Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#092c27] border border-[rgba(207,181,124,0.3)] shadow-inner">
            <motion.div style={{ rotate: planeRotation }}>
              <Plane className="h-4 w-4 text-[#cfb57c]" />
            </motion.div>
          </div>

          {/* Quick Route Code & Telemetry */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tabular-nums">
              <span className="text-[#cfb57c]">SF-2026</span>
              <span className="text-[#b1c3bc]">·</span>
              <span className="text-[#10b981]">{activeCode}</span>
              <span className="text-[10px] text-[#b1c3bc] font-normal">
                ({displayAltitude > 0 ? `${displayAltitude.toLocaleString()} FT` : "GND"})
              </span>
            </div>
            <span className="text-[10px] text-[#b1c3bc] font-sans tracking-tight tabular-nums">
              {getFlightPhase()} · {scrollPct}%
            </span>
          </div>

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label="Toggle Flight Telemetrics Details"
            className="ml-auto rounded-lg p-1.5 text-[#cfb57c] hover:bg-[#062b27] transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Scroll Progress Bar along bottom of header */}
        <div className="h-1 w-full bg-[#062b27] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#cfb57c] via-[#f1d49b] to-[#10b981]"
            style={{ scaleX: smoothProgress, transformOrigin: "0%" }}
          />
        </div>

        {/* Expanded Flight Radar & Interactive Waypoints */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t border-[rgba(207,181,124,0.18)] bg-[rgba(6,43,39,0.5)] space-y-3.5 text-xs"
          >
            {/* Live Flight Telemetry Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#041713] p-2.5 rounded-xl border border-[rgba(207,181,124,0.2)] font-mono text-[11px] tabular-nums">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#b1c3bc] block">Altitude</span>
                <strong className="text-[#cfb57c] font-bold">
                  {displayAltitude > 0 ? `${displayAltitude.toLocaleString()} FT` : "SURFACE"}
                </strong>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#b1c3bc] block">Cruising</span>
                <strong className="text-[#f3f0e7] font-bold">{displaySpeed} KTS</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[#b1c3bc] block">Mach</span>
                <strong className="text-[#10b981] font-bold">0.84 M</strong>
              </div>
            </div>

            {/* Auto-Glide Tour Mode */}
            <div className="flex items-center justify-between bg-[#041713] px-3 py-2 rounded-xl border border-[rgba(207,181,124,0.2)]">
              <span className="text-[11px] font-semibold text-[#f3f0e7]">
                {bn ? "অটো-গ্লাইড ট্যুর" : "Auto-Glide Section Tour"}
              </span>
              <button
                type="button"
                onClick={() => setAutoGlide((prev) => !prev)}
                aria-pressed={autoGlide}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold transition-colors ${
                  autoGlide
                    ? "bg-[#10b981] text-[#041713]"
                    : "bg-[#092c27] text-[#cfb57c] hover:bg-[#12423a]"
                }`}
              >
                {autoGlide ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span>{autoGlide ? (bn ? "চলমান" : "GLIDING") : bn ? "চালু করুন" : "START"}</span>
              </button>
            </div>

            {/* Interactive Flight Corridor Waypoints */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#cfb57c] block mb-1">
                {bn ? "ফ্লাইট করিডোর ও সেকশন গ্লাইড" : "Flight Corridor & Waypoints"}
              </span>

              <div className="space-y-1">
                {WAYPOINTS.map((wp) => {
                  const isCurrent = activeCode === wp.code;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => scrollToWaypoint(wp.targetId)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all ${
                        isCurrent
                          ? "bg-[rgba(207,181,124,0.2)] border border-[#cfb57c] text-[#f1d49b] font-bold"
                          : "hover:bg-[#062b27] text-[#b1c3bc] hover:text-[#f3f0e7] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#041713] text-[#cfb57c] border border-[rgba(207,181,124,0.3)]">
                          {wp.code}
                        </span>
                        <span className="text-[11px] truncate">
                          {bn ? wp.nameBn : wp.nameEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#b1c3bc] font-mono tabular-nums">
                        {Math.round(wp.progressTarget * 100)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Jet Concierge Action */}
            <div className="pt-2 border-t border-[rgba(207,181,124,0.18)] flex items-center justify-between text-[11px]">
              <span className="text-[#b1c3bc] flex items-center gap-1">
                <Compass className="h-3.5 w-3.5 text-[#cfb57c]" />
                <span>Safaria Skyway™</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setAutoGlide(false);
                  const el = document.getElementById("sf-home");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-[#cfb57c] hover:underline font-semibold"
              >
                {bn ? "শীর্ষে যান ↑" : "Return to Top ↑"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </aside>
  );
}
