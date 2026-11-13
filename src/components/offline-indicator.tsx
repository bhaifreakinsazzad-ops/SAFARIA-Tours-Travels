"use client";

import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <aside aria-label="Offline notice" className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-500/50 bg-[#1a1405] px-3.5 py-2 text-xs font-semibold text-amber-300 shadow-xl backdrop-blur-md">
      <WifiOff className="h-4 w-4 animate-pulse text-amber-400" />
      <span>অফলাইন মোড — ক্যাশ করা ডেটা প্রদর্শিত হচ্ছে / Offline Mode</span>
    </aside>
  );
}
