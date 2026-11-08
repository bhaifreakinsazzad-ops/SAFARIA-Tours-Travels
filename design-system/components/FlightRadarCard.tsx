"use client";

import React, { useState, useEffect } from "react";
import { Radio, Phone, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface FlightRadarCardProps {
  lang: "bn" | "en";
}

export function FlightRadarCard({ lang }: FlightRadarCardProps) {
  const isBn = lang === "bn";
  const [bstTime, setBstTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Bangladesh Standard Time (UTC+6)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setBstTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-safaria-line bg-surface-200/90 p-6 shadow-panel">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-safaria-line/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-surface-0 border border-safaria-gold/40">
            <Radio className="h-5 w-5 text-safaria-gold" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safaria-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-safaria-success"></span>
            </span>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-safaria-ink">
              {isBn ? "ফ্লাইট সাপোর্ট ও শিডিউল ডেস্ক" : "Flight Support & Schedules"}
            </h3>
            <span className="text-xs text-safaria-success font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isBn ? "কোটেশন ডেস্ক সক্রিয়" : "Quotation Operations Active"}
            </span>
          </div>
        </div>

        {/* BST Clock */}
        <div className="flex items-center gap-2 rounded-lg bg-surface-0 px-3.5 py-1.5 border border-safaria-line/40 text-xs font-mono text-safaria-gold">
          <Clock className="h-3.5 w-3.5" />
          <span>BST: {bstTime || "--:--:--"}</span>
        </div>
      </div>

      <div className="py-4 space-y-3 text-xs text-safaria-inkMuted leading-relaxed">
        {/* Truthful Telemetry Disclaimer */}
        <div className="rounded-xl border border-safaria-line/50 bg-surface-input p-3.5 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-safaria-gold shrink-0 mt-0.5" />
          <div>
            <strong className="text-safaria-ink block mb-0.5">
              {isBn ? "ফ্লাইট রাডার স্ট্যাটাস নোট:" : "Radar Telemetry Status:"}
            </strong>
            <p className="text-[11px] text-safaria-inkMuted">
              {isBn
                ? "স্বয়ংক্রিয় ট্রান্সপন্ডার লাইভ রাডারটি বর্তমানে রেগুলেটরি আপডেটের জন্য অফলাইনে রয়েছে। ফ্লাইট সময়সূচী ও আসন তথ্যের জন্য আমাদের সরাসরি ডেস্কে যোগাযোগ করুন।"
                : "Automated transponder ADS-B telemetry is currently staged for regulatory alignment. For verified airline schedules and quotes, our human flight desk is actively responding."}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-safaria-line/40 text-xs">
        <span className="text-safaria-inkFaint">
          {isBn ? "জরুরি জিজ্ঞাসা?" : "Immediate assistance?"}
        </span>
        <a
          href={`tel:${SITE_CONFIG.contact.hotlinePrimary.replace(/[^0-9+]/g, "")}`}
          className="flex items-center gap-1.5 font-semibold text-safaria-gold hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>{SITE_CONFIG.contact.hotlinePrimary}</span>
        </a>
      </div>
    </div>
  );
}
