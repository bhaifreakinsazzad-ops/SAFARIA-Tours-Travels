"use client";

import React, { useEffect, useState } from "react";
import { Download, PlusSquare, Share2, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "./usePWAInstall";

interface Props {
  variant?: "header" | "banner" | "button" | "menu";
  className?: string;
}

export function PWAInstallButton({ variant = "header", className = "" }: Props) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowIOSGuide(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showIOSGuide]);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={install}
          className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#c5a059]/60 bg-[#c5a059]/15 px-3 py-1.5 text-xs font-semibold text-[#c5a059] hover:bg-[#c5a059] hover:text-[#031412] transition-colors shadow-sm ${className}`}
          title="Install SAFARIA app on this device"
          aria-label="Install SAFARIA app"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden xs:inline sm:inline">Install App</span>
          <span className="xs:hidden sm:hidden">App</span>
        </button>
      );
    }

    if (variant === "menu") {
      return (
        <button
          type="button"
          onClick={install}
          className={`flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[#c5a059]/60 bg-[#c5a059]/15 px-4 py-2.5 text-sm font-semibold text-[#c5a059] hover:bg-[#c5a059] hover:text-[#031412] transition-colors ${className}`}
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Install SAFARIA App</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#c5a059] px-4 py-2.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors shadow-btn ${className}`}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Install SAFARIA App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex ${
            variant === "menu" ? "w-full justify-center min-h-[44px] text-sm" : "min-h-[38px] text-xs"
          } items-center gap-1.5 rounded-lg border border-[#c5a059]/45 bg-[#06201c] px-3 py-1.5 font-medium text-[#c5a059] hover:border-[#c5a059] transition-colors ${className}`}
          title="Install SAFARIA on iPhone / iPad"
          aria-label="Install SAFARIA on iPhone or iPad"
        >
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          <span>{variant === "menu" ? "Install on iPhone / iPad" : "iOS App"}</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowIOSGuide(false);
              }
            }}
          >
            <div className="w-full max-w-sm rounded-2xl border border-[#c5a059]/50 bg-[#06201c] p-6 text-[#f7f2ea] shadow-2xl space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#c5a059]" />
                  <h3 id="ios-install-title" className="font-display text-base font-bold text-[#c5a059]">
                    Install on iPhone / iPad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close iOS install instructions"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[#a3b8b0] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#d1dfd9] leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#c5a059]/20 text-[#c5a059] font-bold">
                    1
                  </span>
                  <span>
                    Safari ব্রাউজারের নিচের টুলবারে থাকা{" "}
                    <strong className="inline-flex items-center gap-1 text-white">
                      <Share2 className="h-3.5 w-3.5 text-[#c5a059]" /> Share (শেয়ার)
                    </strong>{" "}
                    বাটনে ট্যাপ করুন।
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#c5a059]/20 text-[#c5a059] font-bold">
                    2
                  </span>
                  <span>
                    মেনুটি নিচের দিকে স্ক্রোল করে{" "}
                    <strong className="inline-flex items-center gap-1 text-white">
                      <PlusSquare className="h-3.5 w-3.5 text-[#c5a059]" /> Add to Home Screen
                    </strong>{" "}
                    নির্বাচন করুন।
                  </span>
                </p>
                <p className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#c5a059]/20 text-[#c5a059] font-bold">
                    3
                  </span>
                  <span>
                    উপরে ডানে থাকা <strong className="text-white">Add</strong> চাপুন। অ্যাপটি সরাসরি আপনার ফোনে ইনস্টল হবে।
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] rounded-xl bg-[#c5a059] py-2.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
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
