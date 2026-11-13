"use client";

import React, { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

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

  if (isOnline) return null;

  return (
    <aside aria-label="Offline notice" className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-500/50 bg-[#1a1405] px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md">
      <WifiOff className="h-4 w-4 animate-pulse text-amber-400" />
      <span>অফলাইন মোড — ক্যাশ করা ডেটা প্রদর্শিত হচ্ছে / Offline Mode</span>
    </aside>
  );
}
