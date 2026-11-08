"use client";

import React from "react";
import Link from "next/link";
import { Plane, Phone, Mail, MapPin, Clock, ShieldCheck, Lock } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface SiteFooterProps {
  lang: "bn" | "en";
}

export function SiteFooter({ lang }: SiteFooterProps) {
  const isBn = lang === "bn";

  return (
    <footer id="contact" className="bg-surface-footer text-safaria-ink border-t border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-200 border border-safaria-gold/40 shadow-btn">
                <span className="font-display text-xl font-bold text-safaria-gold">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-wider text-safaria-gold">
                  SAFARIA
                </span>
                <span className="text-[10px] tracking-widest uppercase text-safaria-inkMuted font-sans">
                  Tours & Travels
                </span>
              </div>
            </div>

            <p className="text-xs text-safaria-inkMuted leading-relaxed">
              {isBn
                ? "সাফারিয়া ট্যুরস অ্যান্ড ট্রাভেলস (জাস্ট অ্যানাদার ট্রাভেল গ্রুপ)। আন্তর্জাতিক ও অভ্যন্তরীণ বিমান টিকিট, নির্ভুল ভিসা প্রসেসিং ও হোলসেল এজেন্সি সল্যুশন।"
                : "SAFARIA Tours & Travels (Just Another Travel Group). Verified airline quotations, visa facilitation, and wholesale travel agency operations."}
            </p>

            <div className="pt-2 text-[11px] text-safaria-inkFaint space-y-1">
              <p>© {new Date().getFullYear()} SAFARIA Tours & Travels. All rights reserved.</p>
              <p>Canonical: https://safaria.vibing.world</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-safaria-gold">
              {isBn ? "প্রয়োজনীয় লিংক" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-xs text-safaria-inkMuted">
              <li>
                <a href="#flight-quote" className="hover:text-safaria-gold transition-colors">
                  {isBn ? "ফ্লাইট কোটেশন" : "Flight Quotation"}
                </a>
              </li>
              <li>
                <a href="#sf-atlas" className="hover:text-safaria-gold transition-colors">
                  {isBn ? "জার্নি অ্যাটলাস" : "Journey Atlas"}
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-safaria-gold transition-colors">
                  {isBn ? "৩৩টি গন্তব্য" : "33 Hubs"}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-safaria-gold transition-colors">
                  {isBn ? "৮টি মূল সেবা" : "8 Key Services"}
                </a>
              </li>
              <li>
                <a href="#b2b-agency" className="hover:text-safaria-gold transition-colors">
                  {isBn ? "এজেন্সি পার্টনারশিপ" : "B2B Agency"}
                </a>
              </li>
            </ul>
          </div>

          {/* Internal Portals (Admin & Partner) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-safaria-gold">
              {isBn ? "পোর্টাল ও অ্যাক্সেস" : "Staff & Partners"}
            </h4>
            <ul className="space-y-2 text-xs text-safaria-inkMuted">
              <li>
                <Link
                  href="/partner"
                  className="flex items-center gap-1.5 hover:text-safaria-gold transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-safaria-gold" />
                  <span>{isBn ? "পার্টনার পোর্টাল" : "Partner Workspace"}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 hover:text-safaria-gold transition-colors"
                >
                  <Lock className="h-3.5 w-3.5 text-safaria-gold" />
                  <span>{isBn ? "অপারেশন্স ট্রায়াজ" : "Admin Operations"}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4 space-y-3 text-xs text-safaria-inkMuted">
            <h4 className="text-xs font-bold uppercase tracking-wider text-safaria-gold">
              {isBn ? "যোগাযোগ ও হেল্পডেস্ক" : "Direct Contact Desk"}
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-safaria-gold shrink-0" />
                <div>
                  <a
                    href={`tel:${SITE_CONFIG.contact.hotlinePrimary.replace(/[^0-9+]/g, "")}`}
                    className="hover:text-safaria-gold font-mono font-medium text-safaria-ink"
                  >
                    {SITE_CONFIG.contact.hotlinePrimary}
                  </a>
                  <span className="text-[10px] text-safaria-inkFaint block">
                    {isBn ? "অফিসিয়াল হটলাইন (ভেরিফিকেশন ড্রাফট)" : "Official Hotline (Under Carrier Review)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-safaria-gold shrink-0" />
                <a
                  href={`mailto:${SITE_CONFIG.contact.emailPrimary}`}
                  className="hover:text-safaria-gold font-mono"
                >
                  {SITE_CONFIG.contact.emailPrimary}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-safaria-gold shrink-0" />
                <span>{isBn ? SITE_CONFIG.contact.addressBn : SITE_CONFIG.contact.addressEn}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-safaria-gold shrink-0" />
                <span>{isBn ? SITE_CONFIG.contact.hoursBn : SITE_CONFIG.contact.hoursEn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimers Banner */}
        <div className="mt-12 pt-8 border-t border-safaria-line/40 text-[11px] text-safaria-inkFaint space-y-2">
          <p>
            <strong>{isBn ? "সতর্কবার্তাঃ" : "Important Legal Notice:"}</strong>{" "}
            {isBn
              ? SITE_CONFIG.truthfulDisclaimers.quotationNotBookingBn
              : SITE_CONFIG.truthfulDisclaimers.quotationNotBookingEn}
          </p>
          <p>
            {isBn
              ? SITE_CONFIG.truthfulDisclaimers.visaDisclaimerBn
              : SITE_CONFIG.truthfulDisclaimers.visaDisclaimerEn}
          </p>
        </div>
      </div>
    </footer>
  );
}
