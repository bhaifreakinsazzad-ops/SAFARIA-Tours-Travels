"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Wifi, WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function getServerSnapshot() {
  return true;
}

export function OfflineIndicator() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let timer: number | undefined;

    const onOnline = () => {
      setShowReconnected(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setShowReconnected(false), 3500);
    };

    const onOffline = () => {
      if (timer) window.clearTimeout(timer);
      setShowReconnected(false);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <aside
        role="status"
        aria-live="polite"
        aria-label="Offline notice"
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-5 left-3 right-3 sm:right-auto z-50 flex items-center gap-2 rounded-xl border border-amber-500/50 bg-[#1a1405]/95 px-3.5 py-2.5 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md"
      >
        <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
        <span>অফলাইন মোড — ক্যাশ করা ডেটা প্রদর্শিত হচ্ছে / Offline Mode</span>
      </aside>
    );
  }

  if (showReconnected) {
    return (
      <aside
        role="status"
        aria-live="polite"
        aria-label="Connection restored notice"
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-5 left-3 right-3 sm:right-auto z-50 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-[#05231b]/95 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md"
      >
        <Wifi className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>সংযোগ ফিরে এসেছে — Back online</span>
      </aside>
    );
  }

  return null;
}
