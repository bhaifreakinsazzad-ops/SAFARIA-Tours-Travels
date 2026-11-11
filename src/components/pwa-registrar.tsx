"use client";

import { useEffect } from "react";

export function PWARegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          if (process.env.NODE_ENV !== "production") {
            // Service worker registered for PWA
          }
        })
        .catch((err) => {
          console.warn("Service worker registration skipped:", err);
        });
    });
  }, []);

  return null;
}
