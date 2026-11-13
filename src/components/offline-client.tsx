"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Wifi, WifiOff, ArrowLeft, RefreshCw, Briefcase } from "lucide-react";

export default function OfflinePage() {
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => setReconnected(true);
    const handleOffline = () => setReconnected(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#031412] text-[#f7f2ea] flex items-center justify-center px-4 py-8 pb-24 sm:pb-8">
      <div className="w-full max-w-md rounded-2xl border border-[#c5a059]/30 bg-[#06201c] p-6 sm:p-8 text-center shadow-2xl space-y-6">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#031412] border ${
            reconnected
              ? "border-emerald-500/50 text-emerald-400"
              : "border-[#c5a059]/40 text-[#c5a059]"
          }`}
        >
          {reconnected ? <Wifi className="h-8 w-8" /> : <WifiOff className="h-8 w-8" />}
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-[#c5a059]">
            {reconnected
              ? "সংযোগ ফিরে এসেছে / Back Online"
              : "ইন্টারনেট সংযোগ বিচ্ছিন্ন / Offline Mode"}
          </h1>
          <p className="text-xs text-[#a3b8b0] leading-relaxed">
            {reconnected
              ? "আপনার ইন্টারনেট সংযোগ পুনরায় চালু হয়েছে। সর্বশেষ তথ্য লোড করতে নিচের বাটনে ট্যাপ করুন।"
              : "আপনার ডিভাইসটি বর্তমানে অফলাইনে রয়েছে। আগে লোড করা তথ্য ব্রাউজ করা সম্ভব হলেও নতুন কোটেশন তৈরি বা পার্টনার ডেস্কে প্রবেশের জন্য সক্রিয় ইন্টারনেট প্রয়োজন।"}
          </p>
          <p className="text-[11px] text-[#718b82]">
            {reconnected
              ? "Network connectivity is restored. Reload to return to live travel services."
              : "You are currently offline. Cached public pages remain accessible, while live desk actions require a connection."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#c5a059] px-4 py-2.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>পুনরায় চেষ্টা করুন / Retry</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#c5a059]/40 bg-[#031412] px-4 py-2.5 text-xs font-medium text-[#f7f2ea] hover:border-[#c5a059] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>হোমে ফিরুন / Home</span>
          </Link>
        </div>

        <div className="border-t border-[#c5a059]/15 pt-4 flex items-center justify-center">
          <Link
            href="/b2b"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-[#a3b8b0] hover:text-[#c5a059] transition-colors"
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>View Cached B2B SaaS Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
