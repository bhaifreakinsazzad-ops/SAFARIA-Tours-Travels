"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plane, Menu, X, Phone, Globe, MessageSquare, Search } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";
import { TrackEnquiryModal } from "@/components/TrackEnquiryModal";

interface SiteHeaderProps {
  lang: "bn" | "en";
}

export function SiteHeader({ lang }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const isBn = lang === "bn";

  const navLinks = [
    { href: "#flight-quote", label: isBn ? "ফ্লাইট কোটেশন" : "Flight Quote" },
    { href: "#sf-atlas", label: isBn ? "জার্নি অ্যাটলাস" : "Journey Atlas" },
    { href: "#destinations", label: isBn ? "গন্তব্যসমূহ" : "Destinations" },
    { href: "#services", label: isBn ? "সেবাসমূহ" : "Services" },
    { href: "#b2b-agency", label: isBn ? "এজেন্সি পার্টনার" : "B2B Agency" },
    { href: "#contact", label: isBn ? "যোগাযোগ" : "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-safaria-line bg-surface-0/95 backdrop-blur-md">
      {/* Top micro-bar */}
      <div className="bg-surface-100/60 border-b border-safaria-line/40 px-4 py-1.5 text-xs text-safaria-inkMuted">
        <div className="mx-auto flex max-w-wrap items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-safaria-gold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safaria-success opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-safaria-success"></span>
              </span>
              {isBn ? "কোটেশন ডেস্ক সক্রিয়" : "Quotation Desk Active"}
            </span>
            <span className="hidden sm:inline text-safaria-inkFaint">|</span>
            <span className="hidden sm:inline">
              {isBn ? SITE_CONFIG.contact.hoursBn : SITE_CONFIG.contact.hoursEn}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTrackModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-safaria-gold hover:text-safaria-goldHi font-medium transition-colors cursor-pointer"
              title={isBn ? "কোটেশন অথবা আবেদনের লাইভ স্ট্যাটাস দেখুন" : "Track quotation or application live status"}
            >
              <Search className="h-3 w-3" />
              <span>{isBn ? "ট্র্যাক রেফারেন্স" : "Track Ref"}</span>
            </button>

            <span className="hidden sm:inline text-safaria-inkFaint">|</span>

            <a
              href={`tel:${SITE_CONFIG.contact.hotlinePrimary.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1.5 text-safaria-ink hover:text-safaria-gold transition-colors"
            >
              <Phone className="h-3 w-3 text-safaria-gold" />
              <span>{SITE_CONFIG.contact.hotlinePrimary}</span>
            </a>

            {/* Language Switcher */}
            <Link
              href={isBn ? "/en" : "/"}
              className="flex items-center gap-1 rounded border border-safaria-line px-2 py-0.5 text-xs font-semibold text-safaria-gold hover:bg-safaria-emerald/30 transition-all"
              title={isBn ? "Switch to English" : "বাংলায় দেখুন"}
            >
              <Globe className="h-3 w-3" />
              <span>{isBn ? "EN" : "বাং"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="mx-auto flex max-w-wrap items-center justify-between px-4 py-3.5">
        {/* Brand logo & wordmark */}
        <Link href={isBn ? "/" : "/en"} className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-safaria-emerald to-surface-200 border border-safaria-gold/40 shadow-btn">
            <span className="font-display text-xl font-bold text-safaria-gold group-hover:scale-105 transition-transform">
              S
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-wider text-safaria-gold">
              SAFARIA
            </span>
            <span className="text-[10px] tracking-widest uppercase text-safaria-inkMuted font-sans">
              Tours & Travels
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-safaria-inkMuted hover:text-safaria-gold transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={`https://wa.me/${SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-btn border border-safaria-line px-3 py-2 text-xs font-medium text-safaria-ink hover:border-safaria-gold hover:text-safaria-gold transition-all"
          >
            <MessageSquare className="h-3.5 w-3.5 text-safaria-success" />
            <span>{isBn ? "হোয়াটসঅ্যাপ" : "WhatsApp"}</span>
          </a>

          <a
            href="#flight-quote"
            className="flex items-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo px-4 py-2 text-xs font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all transform hover:-translate-y-0.5"
          >
            <Plane className="h-3.5 w-3.5" />
            <span>{isBn ? "কোটেশন অনুরোধ" : "Request Quote"}</span>
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-btn border border-safaria-line text-safaria-ink hover:text-safaria-gold"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-safaria-line bg-surface-100 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded px-3 py-2 text-sm font-medium text-safaria-ink hover:bg-surface-200 hover:text-safaria-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-safaria-line/40 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-btn border border-safaria-line/80 py-2.5 text-xs font-semibold text-safaria-ink hover:text-safaria-gold hover:border-safaria-gold transition-all"
            >
              <Search className="h-4 w-4 text-safaria-gold" />
              <span>{isBn ? "কোটেশন / আবেদন ট্র্যাক করুন" : "Track Quotation / Application"}</span>
            </button>

            <a
              href="#flight-quote"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-2.5 text-sm font-bold text-safaria-onGold"
            >
              <Plane className="h-4 w-4" />
              <span>{isBn ? "ফ্লাইট কোটেশন অনুরোধ" : "Request Flight Quote"}</span>
            </a>
          </div>
        </div>
      )}

      {/* Track Enquiry & Application Modal */}
      <TrackEnquiryModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        lang={lang}
      />
    </header>
  );
}
