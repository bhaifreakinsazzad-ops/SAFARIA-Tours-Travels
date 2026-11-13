"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function PWARegistrar() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;
    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        if (cancelled) return;

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller &&
              !cancelled
            ) {
              setWaitingWorker(newWorker);
              setDismissed(false);
            }
          });
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  if (!waitingWorker || dismissed) {
    return null;
  }

  const handleUpdate = () => {
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] sm:bottom-5 right-3 left-3 sm:left-auto sm:max-w-sm z-50 flex items-center justify-between gap-3 rounded-xl border border-[#c5a059]/60 bg-[#06201c]/95 px-4 py-3 text-xs text-[#f7f2ea] shadow-2xl backdrop-blur-md"
    >
      <div className="min-w-0">
        <p className="font-semibold text-[#c5a059]">App update ready / নতুন সংস্করণ প্রস্তুত</p>
        <p className="text-[11px] text-[#a3b8b0] truncate">
          Tap reload to apply the latest SAFARIA update.
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleUpdate}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-[#c5a059] px-3 py-1.5 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Update</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notice"
          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg border border-white/10 text-[#a3b8b0] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
