"use client";

import React from "react";
import {
  Plane,
  FileCheck,
  Compass,
  Palmtree,
  Briefcase,
  Building2,
  ShieldCheck,
  Users2,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface ServiceCatalogProps {
  lang: "bn" | "en";
}

const iconMap: Record<string, React.ReactNode> = {
  Plane: <Plane className="h-6 w-6 text-safaria-gold" />,
  FileCheck: <FileCheck className="h-6 w-6 text-safaria-gold" />,
  Compass: <Compass className="h-6 w-6 text-safaria-gold" />,
  Palmtree: <Palmtree className="h-6 w-6 text-safaria-gold" />,
  Briefcase: <Briefcase className="h-6 w-6 text-safaria-gold" />,
  Building2: <Building2 className="h-6 w-6 text-safaria-gold" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-safaria-gold" />,
  Users2: <Users2 className="h-6 w-6 text-safaria-gold" />,
};

export function ServiceCatalog({ lang }: ServiceCatalogProps) {
  const isBn = lang === "bn";

  return (
    <section id="services" className="bg-surface-0 py-16 sm:py-24 border-b border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-safaria-gold">
            <Briefcase className="h-4 w-4" />
            <span>{isBn ? "আমাদের বিশেষায়িত সেবাসমূহ" : "Verified Services"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-safaria-ink">
            {isBn ? "সম্পূর্ণ ভ্রমণ সল্যুশন" : "End-to-End Travel Solutions"}
          </h2>
          <p className="text-sm sm:text-base text-safaria-inkMuted">
            {isBn
              ? "এয়ার টিকিট থেকে শুরু করে ভিসা প্রসেসিং ও কর্পোরেট ট্রাভেল ম্যানেজমেন্ট—প্রতিটি সেবা পরিচালিত হয় অভিজ্ঞ ট্রাভেল পেশাদারদের দ্বারা।"
              : "Comprehensive flight ticketing, visa facilitation, umrah packages, and agency infrastructure."}
          </p>
        </div>

        {/* 8 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SITE_CONFIG.services.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl border border-safaria-line/70 bg-surface-100 p-6 flex flex-col justify-between hover:border-safaria-gold/80 hover:bg-surface-200/90 transition-all duration-300 hover:shadow-panel"
            >
              <div className="space-y-4">
                {/* Header Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-0 border border-safaria-line/60 group-hover:border-safaria-gold/50 transition-colors">
                    {iconMap[service.icon] || <Plane className="h-6 w-6 text-safaria-gold" />}
                  </div>

                  {(service.badgeBn || service.badgeEn) && (
                    <span className="rounded-full bg-safaria-gold/15 border border-safaria-gold/30 px-2.5 py-0.5 text-[10px] font-semibold text-safaria-gold">
                      {isBn ? service.badgeBn : service.badgeEn}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-display text-xl font-bold text-safaria-ink group-hover:text-safaria-gold transition-colors">
                    {isBn ? service.titleBn : service.titleEn}
                  </h3>
                  <p className="mt-2 text-xs text-safaria-inkMuted leading-relaxed">
                    {isBn ? service.descBn : service.descEn}
                  </p>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-5 border-t border-safaria-line/40 mt-5 flex items-center justify-between">
                <a
                  href={`https://wa.me/${SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello SAFARIA, I would like to inquire about your ${service.titleEn} service.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-safaria-gold hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{isBn ? "পরামর্শ নিন" : "Inquire Now"}</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Embassy Visa Notice Box */}
        <div className="mt-8 rounded-xl border border-safaria-line/60 bg-surface-100/60 p-4 text-xs text-safaria-inkMuted text-center max-w-2xl mx-auto">
          <p>
            {isBn
              ? SITE_CONFIG.truthfulDisclaimers.visaDisclaimerBn
              : SITE_CONFIG.truthfulDisclaimers.visaDisclaimerEn}
          </p>
        </div>
      </div>
    </section>
  );
}
