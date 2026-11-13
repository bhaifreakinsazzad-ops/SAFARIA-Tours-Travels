"use client";

import React, { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";

interface Props {
  variant?: "header" | "banner" | "button";
  className?: string;
}

export function PWAInstallButton({ variant = "header", className = "" }: Props) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, suppress prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={install}
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/60 bg-[#c5a059]/15 px-3 py-1 text-xs font-semibold text-[#c5a059] hover:bg-[#c5a059] hover:text-[#031412] transition-colors shadow-sm ${className}`}
          title="Install SAFARIA B2B app on this device"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Install App</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#c5a059] px-4 py-2.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors shadow-btn ${className}`}
      >
        <Download className="h-4 w-4" />
        <span>Install SAFARIA App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-[#06201c] px-3 py-1 text-xs font-medium text-[#c5a059] hover:border-[#c5a059] transition-colors ${className}`}
          title="Install SAFARIA on iPhone / iPad"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>iOS App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#c5a059]/50 bg-[#06201c] p-6 text-[#f7f2ea] shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#c5a059]" />
                  <h3 className="font-display text-base font-bold text-[#c5a059]">
                    Install on iPhone / iPad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1 text-[#a3b8b0] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#d1dfd9] leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c5a059]/20 text-[#c5a059] font-bold">1</span>
                  <span>Safari ব্রাউজারের নিচের টুলবারে থাকা <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন।</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c5a059]/20 text-[#c5a059] font-bold">2</span>
                  <span>মেনুটি নিচের দিকে স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c5a059]/20 text-[#c5a059] font-bold">3</span>
                  <span>উপরে ডানে থাকা <strong>Add</strong> চাপুন। অ্যাপটি সরাসরি আপনার ফোনে ইনস্টল হবে।</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#c5a059] py-2 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
              >
                বুঝেছি / Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
