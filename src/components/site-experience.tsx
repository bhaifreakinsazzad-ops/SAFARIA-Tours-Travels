"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Compass } from "lucide-react";
import { AtlasFallback } from "./atlas-fallback";
import { DeferredSection } from "./deferred-section";
import { copy } from "@/lib/copy";
import { origin, routes } from "@/lib/atlas-data";
import { useSiteStore } from "@/lib/site-store";
import { PWAInstallButton } from "./pwa-install-button";
import { FlightProgressHUD } from "./flight-progress-hud";
import { FlightRouteCanvas } from "./flight-route-canvas";

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

export function SiteExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [atlasInteractive, setAtlasInteractive] = useState(false);
  const [mobile3DAvailable, setMobile3DAvailable] = useState(true);
  const [dialogVisited, setDialogVisited] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);

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
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  // anime.js staggered entrance on destination buttons (compositor-only opacity + translateY)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    import("animejs").then(({ animate, stagger }) => {
      const buttons = document.querySelectorAll<HTMLElement>(".destination-button");
      if (buttons.length > 0) {
        animate(buttons, {
          opacity: [0, 1],
          translateY: [8, 0],
          delay: stagger(35, { start: 150 }),
          duration: 400,
          ease: "outQuad",
        });
      }
    });
  }, []);

  // Automatic Route Intelligence Ticker in Hero (compositor-only, zero CLS)
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setTickerIdx((prev) => (prev + 1) % routes.length);
    }, 3400);
    return () => window.clearInterval(interval);
  }, []);

  const currentTickerRoute = routes[tickerIdx] || routes[0];
  const bn = language === "bn";

  return (
    <>
      <FlightProgressHUD language={language} />
      <div className="site-shell" id="sf-home">
        <header className="site-header">
          <a className="brand" href="#sf-home">
            <Image src="/images/logo-inverted.webp" width={56} height={56} alt="" priority />
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
          </nav>
          <div className="flex items-center gap-2">
            <PWAInstallButton variant="header" />
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
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-skyline" aria-hidden="true">
              <Image src="/images/skyline.webp" fill priority sizes="100vw" alt="" />
            </div>
            <div className="hero-inner">
              <div className="hero-copy">
                {/* Fixed-height Automatic Route Intelligence Bar (Zero CLS) */}
                <div className="mb-5 flex h-9 items-center justify-between gap-2 rounded-xl border border-[rgba(207,181,124,0.3)] bg-[rgba(4,23,19,0.78)] px-3 text-xs overflow-hidden max-w-[490px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <Compass className="h-3.5 w-3.5 text-[#10b981] shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#cfb57c] uppercase shrink-0">
                      {bn ? "লাইভ রুট:" : "LIVE CORRIDOR:"}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentTickerRoute.code}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="truncate text-[#f3f0e7] font-medium"
                      >
                        {origin[language]} (DAC) ➔ {currentTickerRoute[language]} ({currentTickerRoute.code})
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <button
                    type="button"
                    onClick={() => openRoute(currentTickerRoute.code)}
                    className="font-mono text-[11px] font-bold text-[#cfb57c] hover:underline whitespace-nowrap shrink-0"
                  >
                    {bn ? "কোটেশন ↗" : "Quote ↗"}
                  </button>
                </div>

                <h1 id="hero-title" className="display-heading">
                  {t.title}
                </h1>
                <p>{t.intro}</p>
                <button
                  className="button button-gold hero-cta"
                  type="button"
                  onClick={() => openRoute()}
                >
                  {t.request}
                  <span aria-hidden="true">→</span>
                </button>
              </div>

              <div className="hero-atlas" id="sf-atlas">
                {atlasInteractive ? (
                  <JourneyAtlas language={language} onSelect={openRoute} />
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
                    {routes.map((route) => (
                      <div role="listitem" key={route.code}>
                        <button
                          type="button"
                          className="destination-button"
                          onClick={() => openRoute(route.code)}
                        >
                          <span>{route[language]}</span>
                          <small>{route.code}</small>
                          <span className="sr-only">
                            {origin[language]} (DAC) → {t.request}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="atlas-help">{t.atlasHelp}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="site-corridor-wrapper max-w-6xl mx-auto px-4 sm:px-6">
            <FlightRouteCanvas language={language} onSelectRoute={openRoute} />
          </div>

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
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/b2b" style={{ color: "var(--sf-gold)", textDecoration: "underline" }}>
              {bn ? "বি২বি পার্টনারশিপ" : "B2B Agency Membership"}
            </Link>
            <Link href="/login" style={{ color: "var(--sf-gold)", textDecoration: "underline" }}>
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
