"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Compass, Plane, Navigation, Sparkles, ArrowUpRight, Radio } from "lucide-react";
import { animate, stagger } from "animejs";
import { AtlasFallback } from "./atlas-fallback";
import { DeferredSection } from "./deferred-section";
import { copy } from "@/lib/copy";
import { origin, routes } from "@/lib/atlas-data";
import { getRouteTelemetry } from "@/lib/threeui";
import { useSiteStore } from "@/lib/site-store";
import { SAFARIA_CONFIG } from "@/config/constants";
import { PWAInstallButton } from "./pwa-install-button";
import { FlightProgressHUD } from "./flight-progress-hud";
import { FlightRouteCanvas } from "./flight-route-canvas";
import { UniversalOffersStrip } from "./universal-offers-strip";

const JourneyAtlas = dynamic(() => import("./journey-atlas").then((module) => module.JourneyAtlas), {
  ssr: false,
  loading: () => (
    <div className="atlas-visual">
      <div className="atlas-static">
        <AtlasFallback />
      </div>
    </div>
  ),
});
const RouteEnquiryDialog = dynamic(
  () => import("./route-enquiry-dialog").then((module) => module.RouteEnquiryDialog),
  { ssr: false },
);
const OffersBento = dynamic(() => import("./offers-bento").then((module) => module.OffersBento), {
  ssr: false,
  loading: () => (
    <section id="sf26-offers" className="deferred-placeholder content-section">
      <span className="eyebrow">SAFARIA</span>
      <h2 className="display-heading">Curated services</h2>
    </section>
  ),
});
const DestinationExplorer = dynamic(() =>
  import("./destination-explorer").then((module) => module.DestinationExplorer),
);
const TravelStudio = dynamic(() => import("./travel-studio").then((module) => module.TravelStudio));
const AgencyPortal = dynamic(() => import("./agency-portal").then((module) => module.AgencyPortal));

const HERO_QUICK_DESKS = [
  {
    id: "corridors",
    bnLabel: "গ্লোবাল ফ্লাইট রুট",
    enLabel: "3D Flight Corridors",
    targetCode: "DXB",
    offerId: "fare-options",
    bnSub: "ঢাকা থেকে ৮টি প্রাইম করিডোরে রিয়েল-টাইম থ্রিডি রাউটিং",
    enSub: "Real-time 3D globe lock across 8 flagship Dhaka corridors",
  },
  {
    id: "student",
    bnLabel: "স্টুডেন্ট মোবিলিটি",
    enLabel: "Student Mobility",
    targetCode: "KUL",
    offerId: "malaysia-student",
    bnSub: "মালয়েশিয়া, চীন, ইউকে ও কানাডা স্টুডেন্ট ব্যাগেজ ও ফেয়ার",
    enSub: "Verified student fares & extra baggage for Malaysia, China & UK",
  },
  {
    id: "saudi",
    bnLabel: "সৌদি ও ওমরাহ",
    enLabel: "Saudi & Umrah",
    targetCode: "JED",
    offerId: "umrah",
    bnSub: "জেদ্দা, রিয়াদ ও মদিনা রুটে ফ্যামিলি, ওমরাহ ও প্রবাসী কোটেশন",
    enSub: "Dedicated Jeddah & Riyadh Umrah, family & workforce desk",
  },
  {
    id: "premium",
    bnLabel: "বিজনেস ক্লাস",
    enLabel: "Business Class",
    targetCode: "LON",
    offerId: "business-class",
    bnSub: "প্রিমিয়াম কেবিন ও কমপ্লিমেন্টারি ট্রানজিট হোটেল সহায়তা",
    enSub: "Executive cabin itineraries & transit lounge eligibility",
  },
] as const;

export function SiteExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [atlasInteractive, setAtlasInteractive] = useState(false);
  const [mobile3DAvailable, setMobile3DAvailable] = useState(true);
  const [dialogVisited, setDialogVisited] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [heroFocusedCode, setHeroFocusedCode] = useState<string>("DXB");
  const [activeHeroDesk, setActiveHeroDesk] = useState<string>("corridors");
  const [autoCycleHero, setAutoCycleHero] = useState<boolean>(true);
  const [animatedNm, setAnimatedNm] = useState<number>(1920);
  const [animatedHdg, setAnimatedHdg] = useState<number>(282);

  const headerRef = useRef<HTMLElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const heroConsoleRef = useRef<HTMLDivElement>(null);
  const heroArcPathRef = useRef<SVGPathElement>(null);
  const heroPlaneDotRef = useRef<SVGCircleElement>(null);

  const language = useSiteStore((state) => state.language);
  const setLanguage = useSiteStore((state) => state.setLanguage);
  const selectedCode = useSiteStore((state) => state.selectedCode);
  const selectedOfferId = useSiteStore((state) => state.selectedOfferId);
  const enquiryOpen = useSiteStore((state) => state.enquiryOpen);
  const openEnquiry = useSiteStore((state) => state.openEnquiry);
  const openOfferEnquiry = useSiteStore((state) => state.openOfferEnquiry);
  const closeEnquiry = useSiteStore((state) => state.closeEnquiry);
  const t = copy[language];

  const openRoute = (code?: string) => {
    setDialogVisited(true);
    openEnquiry(code);
  };
  const openOffer = (id: string) => {
    setDialogVisited(true);
    openOfferEnquiry(id);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.matchMedia("(min-width: 721px)").matches) setAtlasInteractive(true);
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.WebGLRenderingContext ||
        navigator.hardwareConcurrency <= 2 ||
        (memory !== undefined && memory <= 2)
      ) {
        setMobile3DAvailable(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [menuOpen]);

  // anime.js kinetic entrance choreography on hero copy, command console & destination buttons (compositor-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (heroCopyRef.current) {
      const heroTargets = heroCopyRef.current.querySelectorAll<HTMLElement>(".hero-kinetic-item");
      if (heroTargets.length > 0) {
        animate(heroTargets, {
          opacity: [0, 1],
          translateY: [14, 0],
          delay: stagger(65, { start: 60 }),
          duration: 520,
          ease: "outExpo",
        });
      }
    }

    const buttons = document.querySelectorAll<HTMLElement>(".destination-button");
    if (buttons.length > 0) {
      animate(buttons, {
        opacity: [0, 1],
        translateY: [8, 0],
        delay: stagger(35, { start: 140 }),
        duration: 420,
        ease: "outQuad",
      });
    }
  }, []);

  // Automatic Route Intelligence Ticker & 3D Globe Synchronizer in Hero
  useEffect(() => {
    if (!autoCycleHero) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setTickerIdx((prev) => {
        const nextIdx = (prev + 1) % routes.length;
        const nextRoute = routes[nextIdx];
        if (nextRoute) {
          setHeroFocusedCode(nextRoute.code);
        }
        return nextIdx;
      });
    }, 3800);
    return () => window.clearInterval(interval);
  }, [autoCycleHero]);

  const activeRouteObj = routes.find((r) => r.code === heroFocusedCode) || routes[tickerIdx] || routes[0];
  const activeTelemetry = getRouteTelemetry(activeRouteObj.code, activeRouteObj[language]);

  // anime.js numeric odometer & SVG vector trajectory animation when heroFocusedCode changes
  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stateObj = { nm: animatedNm, hdg: animatedHdg };
    const numAnim = animate(stateObj, {
      nm: activeTelemetry.distanceNm,
      hdg: activeTelemetry.headingDeg,
      duration: isReduced ? 1 : 480,
      ease: "outExpo",
      onUpdate: () => {
        setAnimatedNm(Math.round(stateObj.nm));
        setAnimatedHdg(Math.round(stateObj.hdg));
      },
    });

    if (!isReduced && heroArcPathRef.current) {
      animate(heroArcPathRef.current, {
        strokeDashoffset: [180, 0],
        duration: 620,
        ease: "outQuart",
      });
    }

    if (!isReduced && heroPlaneDotRef.current) {
      animate(heroPlaneDotRef.current, {
        scale: [1.6, 1],
        duration: 480,
        ease: "outBack",
      });
    }

    return () => {
      numAnim.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroFocusedCode]);

  const handleHeroRouteFocus = (code: string) => {
    setAutoCycleHero(false);
    setHeroFocusedCode(code);
    if (heroConsoleRef.current) {
      const isReduced =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!isReduced) {
        animate(heroConsoleRef.current, {
          scale: [0.99, 1],
          duration: 240,
          ease: "outQuad",
        });
      }
    }
  };

  const bn = language === "bn";
  const currentDeskMeta = HERO_QUICK_DESKS.find((d) => d.id === activeHeroDesk) || HERO_QUICK_DESKS[0];

  return (
    <>
      <FlightProgressHUD language={language} />
      <div className="site-shell" id="sf-home">
        <header ref={headerRef} className="site-header">
          <a className="brand" href="#sf-home">
            <Image
              src="/images/logo-inverted.webp"
              width={56}
              height={56}
              alt=""
              priority
              referrerPolicy="no-referrer"
            />
            <span className="brand-wordmark">
              SAFARIA<small>TOURS &amp; TRAVELS</small>
            </span>
          </a>
          <nav
            id="sf-navigation"
            className={`primary-nav ${menuOpen ? "is-open" : ""}`}
            aria-label={bn ? "প্রধান নেভিগেশন" : "Main navigation"}
          >
            <a href="#sf-atlas" onClick={() => setMenuOpen(false)}>
              {t.atlas}
            </a>
            <a href="#sf26-offers" onClick={() => setMenuOpen(false)}>
              {bn ? "সেবা" : "Offers"}
            </a>
            <a href="#sf-destinations" onClick={() => setMenuOpen(false)}>
              {bn ? "গন্তব্য" : "Destinations"}
            </a>
            <a href="#sf-travel-form" onClick={() => setMenuOpen(false)}>
              {bn ? "ট্রাভেল স্টুডিও" : "Travel Studio"}
            </a>
            <a href="#sf-agency" onClick={() => setMenuOpen(false)}>
              {bn ? "এজেন্সি" : "Agency"}
            </a>
            <Link
              href="/b2b"
              onClick={() => setMenuOpen(false)}
              className="text-safaria-gold font-medium"
            >
              {bn ? "বি২বি সল্যুশন" : "B2B Platform"}
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openRoute();
              }}
            >
              {t.request}
            </button>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-safaria-gold hover:underline"
            >
              {bn ? "পোর্টাল" : "Portal"}
            </Link>
            <div className="pt-2 mt-1 border-t border-safaria-line lg:hidden">
              <PWAInstallButton variant="menu" />
            </div>
          </nav>
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <PWAInstallButton variant="header" className="hidden min-[420px]:inline-flex" />
            <div className="language-switch" role="group" aria-label="Language / ভাষা">
              <button
                lang="bn"
                type="button"
                aria-pressed={language === "bn"}
                onClick={() => setLanguage("bn")}
              >
                বাংলা
              </button>
              <span aria-hidden="true">/</span>
              <button
                lang="en"
                type="button"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>
            </div>
          </div>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="sf-navigation"
            aria-label={menuOpen ? t.close : bn ? "মেনু খুলুন" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </header>

        <main>
          <section
            className="hero"
            aria-labelledby="hero-title"
            onMouseEnter={() => setAutoCycleHero(false)}
            onMouseLeave={() => setAutoCycleHero(true)}
          >
            <div className="hero-skyline" aria-hidden="true">
              <Image
                src="/images/skyline.webp"
                fill
                priority
                sizes="100vw"
                alt=""
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hero-inner">
              <div className="hero-copy" ref={heroCopyRef}>
                {/* Fixed-height Automatic Route Intelligence Bar synchronized with 3D Globe (Zero CLS) */}
                <div className="hero-kinetic-item mb-4 flex h-9 items-center justify-between gap-2 rounded-xl border border-[rgba(207,181,124,0.34)] bg-[rgba(4,23,19,0.84)] px-3 text-xs overflow-hidden max-w-[540px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Compass className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#cfb57c] uppercase shrink-0">
                      {bn ? "থ্রিডি রুট লক:" : "3D CORRIDOR LOCK:"}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeRouteObj.code}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="truncate text-[#f3f0e7] font-semibold"
                      >
                        {origin[language]} (DAC) ➔ {activeRouteObj[language]} ({activeRouteObj.code})
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <button
                    type="button"
                    onClick={() => openRoute(activeRouteObj.code)}
                    className="font-mono text-[11px] font-bold text-[#cfb57c] hover:underline whitespace-nowrap shrink-0"
                  >
                    {bn ? "কোটেশন ↗" : "Quote ↗"}
                  </button>
                </div>

                <h1 id="hero-title" className="display-heading hero-kinetic-item">
                  {t.title}
                </h1>
                <p className="hero-kinetic-item">{t.intro}</p>

                {/* Primary Hero CTA + B2B Wholesale Quick Action */}
                <div className="hero-kinetic-item flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                  <button
                    className="button button-gold hero-cta"
                    type="button"
                    onClick={() => openRoute(activeRouteObj.code)}
                  >
                    {t.request}
                    <span aria-hidden="true">→</span>
                  </button>
                  <Link
                    href="/b2b"
                    className="inline-flex min-h-[54px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[rgba(207,181,124,0.42)] bg-[rgba(6,43,39,0.75)] px-5 py-3.5 text-xs sm:text-sm font-bold text-[#cfb57c] hover:border-[#cfb57c] hover:bg-[#092c27] transition-all text-center sm:whitespace-nowrap"
                  >
                    <Radio className="h-4 w-4 shrink-0 text-[#10b981]" />
                    <span>{bn ? "বি২বি এজেন্সি ডেস্ক (০% মার্কআপ)" : "B2B Agency Desk (0% Markup)"}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </Link>
                </div>

                {/* Anime.js + Three.js Synchronized Interactive Spatial Command Console */}
                <div
                  ref={heroConsoleRef}
                  className="hero-kinetic-item mt-6 max-w-[560px] rounded-2xl border border-[rgba(207,181,124,0.32)] bg-[rgba(4,23,19,0.86)] p-3.5 sm:p-4 shadow-[0_18px_45px_rgba(0,0,0,0.42)] space-y-3.5"
                >
                  {/* Quick Desk Mode Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(207,181,124,0.18)] pb-2.5">
                    <div
                      className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1 pb-1 sm:pb-0"
                      role="tablist"
                      aria-label={bn ? "হিরো কুইক ডেস্ক" : "Hero quick desks"}
                    >
                      {HERO_QUICK_DESKS.map((desk) => {
                        const isCurrent = activeHeroDesk === desk.id;
                        return (
                          <button
                            key={desk.id}
                            type="button"
                            role="tab"
                            aria-selected={isCurrent}
                            onClick={() => {
                              setActiveHeroDesk(desk.id);
                              handleHeroRouteFocus(desk.targetCode);
                            }}
                            className={`min-h-[36px] sm:min-h-0 rounded-lg px-2.5 py-1.5 sm:py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                              isCurrent
                                ? "bg-[#cfb57c] text-[#041713]"
                                : "text-[#b1c3bc] hover:bg-[#092c27] hover:text-[#f3f0e7]"
                            }`}
                          >
                            {bn ? desk.bnLabel : desk.enLabel}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => openOffer(currentDeskMeta.offerId)}
                      className="inline-flex min-h-[36px] sm:min-h-0 items-center self-start sm:self-auto gap-1 font-mono text-[11px] font-bold text-[#10b981] hover:underline whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>{bn ? "ডেস্ক কোটেশন ↗" : "Desk Quote ↗"}</span>
                    </button>
                  </div>

                  {/* Live Animated Vector Trajectory & Odometer Readout */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                    <div className="sm:col-span-5 flex items-center gap-3 rounded-xl border border-[rgba(207,181,124,0.2)] bg-[#06241e] p-2.5">
                      <svg
                        className="h-10 w-20 shrink-0 overflow-visible"
                        viewBox="0 0 96 42"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M 8 34 Q 48 4 88 34"
                          stroke="rgba(207,181,124,0.22)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <path
                          ref={heroArcPathRef}
                          d="M 8 34 Q 48 4 88 34"
                          stroke="#10b981"
                          strokeWidth="2.2"
                          strokeDasharray="180"
                          strokeDashoffset="0"
                        />
                        <circle cx="8" cy="34" r="3.5" fill="#cfb57c" />
                        <circle ref={heroPlaneDotRef} cx="88" cy="34" r="4" fill="#10b981" />
                      </svg>
                      <div className="min-w-0">
                        <span className="block font-mono text-[10px] font-bold text-[#cfb57c]">
                          DAC ➔ {activeRouteObj.code}
                        </span>
                        <strong className="block truncate text-xs font-bold text-[#f3f0e7]">
                          {activeRouteObj[language]}
                        </strong>
                        <span className="block truncate text-[10px] text-[#10b981] font-mono">
                          {bn ? activeTelemetry.durationBn : activeTelemetry.durationEn}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-7 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-[rgba(207,181,124,0.18)] bg-[#06241e]/80 p-2">
                        <span className="block font-mono text-[9px] uppercase text-[#b1c3bc]">
                          {bn ? "দূরত্ব" : "DISTANCE"}
                        </span>
                        <strong className="font-mono text-xs sm:text-sm font-bold text-[#f3f0e7] tabular-nums">
                          {animatedNm.toLocaleString()} NM
                        </strong>
                      </div>
                      <div className="rounded-xl border border-[rgba(207,181,124,0.18)] bg-[#06241e]/80 p-2">
                        <span className="block font-mono text-[9px] uppercase text-[#b1c3bc]">
                          {bn ? "ফ্লাইট লেভেল" : "CRUISE"}
                        </span>
                        <strong className="font-mono text-xs sm:text-sm font-bold text-[#cfb57c] tabular-nums">
                          {activeTelemetry.flightLevel} · {activeTelemetry.mach}
                        </strong>
                      </div>
                      <div className="rounded-xl border border-[rgba(207,181,124,0.18)] bg-[#06241e]/80 p-2">
                        <span className="block font-mono text-[9px] uppercase text-[#b1c3bc]">
                          {bn ? "হেডিং" : "HEADING"}
                        </span>
                        <strong className="font-mono text-xs sm:text-sm font-bold text-[#10b981] tabular-nums">
                          {animatedHdg}° TRUE
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Interactive 8-Corridor 3D Globe Target Selector Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#b1c3bc] mr-1">
                        <Navigation className="h-3 w-3 text-[#cfb57c]" />
                        <span>{bn ? "3D ফোকাস:" : "3D Focus:"}</span>
                      </span>
                      {routes.map((r) => {
                        const isFocused = heroFocusedCode === r.code;
                        return (
                          <button
                            key={r.code}
                            type="button"
                            onClick={() => handleHeroRouteFocus(r.code)}
                            className={`min-h-[32px] sm:min-h-0 rounded px-2 py-1 sm:py-0.5 font-mono text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${
                              isFocused
                                ? "bg-[#10b981] text-[#041713] shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                                : "bg-[#092c27] text-[#cfb57c] hover:bg-[#12423a]"
                            }`}
                          >
                            {r.code}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => openRoute(activeRouteObj.code)}
                      className="inline-flex min-h-[40px] sm:min-h-0 w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg bg-[#cfb57c]/15 border border-[#cfb57c]/40 px-3 py-1.5 sm:py-1 text-[11px] font-bold text-[#cfb57c] hover:bg-[#cfb57c] hover:text-[#041713] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plane className="h-3 w-3" />
                      <span>{bn ? `${activeRouteObj.code} কোটেশন` : `Quote ${activeRouteObj.code}`}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hero-atlas" id="sf-atlas">
                {atlasInteractive ? (
                  <JourneyAtlas
                    language={language}
                    onSelect={openRoute}
                    externalFocusCode={heroFocusedCode}
                    onHoverRoute={(code) => {
                      setAutoCycleHero(false);
                      setHeroFocusedCode(code);
                    }}
                  />
                ) : (
                  <div
                    className="atlas-visual"
                    aria-label={
                      bn ? "ঢাকা থেকে গন্তব্যগুলোর মানচিত্র" : "Map of destinations from Dhaka"
                    }
                  >
                    <div className="atlas-static">
                      <AtlasFallback />
                    </div>
                    {mobile3DAvailable && (
                      <button
                        type="button"
                        className="atlas-enable-3d"
                        onClick={() => setAtlasInteractive(true)}
                      >
                        {bn ? "3D গ্লোব চালু করুন" : "Enable 3D globe"}
                      </button>
                    )}
                  </div>
                )}
                <div className="atlas-destinations">
                  <p>{t.choose}</p>
                  <div className="destination-list" role="list" aria-label={t.atlas}>
                    {routes.map((route) => {
                      const isRouteActive = heroFocusedCode === route.code;
                      return (
                        <div role="listitem" key={route.code}>
                          <button
                            type="button"
                            className={`destination-button ${
                              isRouteActive ? "ring-1 ring-[#cfb57c] bg-[#125547]" : ""
                            }`}
                            onPointerEnter={() => handleHeroRouteFocus(route.code)}
                            onFocus={() => handleHeroRouteFocus(route.code)}
                            onClick={() => openRoute(route.code)}
                          >
                            <span>{route[language]}</span>
                            <small>{route.code}</small>
                            <span className="sr-only">
                              {origin[language]} (DAC) → {t.request}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="atlas-help">{t.atlasHelp}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="site-corridor-wrapper max-w-6xl mx-auto px-4 sm:px-6">
            <FlightRouteCanvas language={language} onSelectRoute={openRoute} />
          </div>

          <UniversalOffersStrip language={language} onSelect={openOffer} />

          <DeferredSection
            id="sf26-offers"
            title={bn ? "যাত্রার প্রতিটি পর্যায়ে" : "Every part of the journey"}
          >
            <OffersBento language={language} onSelect={openOffer} />
          </DeferredSection>

          <DeferredSection
            id="sf-destinations"
            title={bn ? "আপনার পরের গন্তব্য" : "Find your next destination"}
          >
            <DestinationExplorer language={language} onEnquire={openRoute} />
          </DeferredSection>

          <DeferredSection
            id="sf-travel-form"
            title={bn ? "আপনার যাত্রা, আপনার মতো" : "Shape your next journey"}
          >
            <TravelStudio language={language} />
          </DeferredSection>

          <DeferredSection
            id="sf-agency"
            title={bn ? "এজেন্সির জন্য নতুন সম্ভাবনা" : "Built for travel agencies"}
          >
            <AgencyPortal language={language} />
          </DeferredSection>
        </main>

        <footer className="site-footer">
          <p>{t.footer}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/b2b" className="text-safaria-gold underline underline-offset-2">
              {bn ? "বি২বি পার্টনারশিপ" : "B2B Agency Membership"}
            </Link>
            <a
              href={SAFARIA_CONFIG.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline underline-offset-2 font-semibold"
            >
              {bn ? "অফিসিয়াল WhatsApp চ্যানেল ↗" : "Official WhatsApp Channel ↗"}
            </a>
            <Link href="/login" className="text-safaria-gold underline underline-offset-2">
              {bn ? "পার্টনার ও স্টাফ লগইন" : "Partner & Staff Portal"}
            </Link>
            <span>© 2026 SAFARIA Tours &amp; Travels</span>
          </div>
        </footer>
      </div>

      {dialogVisited && (
        <RouteEnquiryDialog
          open={enquiryOpen}
          selectedCode={selectedCode}
          selectedOfferId={selectedOfferId}
          language={language}
          onClose={closeEnquiry}
        />
      )}
    </>
  );
}
