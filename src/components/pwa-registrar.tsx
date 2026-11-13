"use client";

import { useEffect } from "react";

/**
 * Register once whether React hydrates before OR after window.load.
 * Late hydration previously missed the load event entirely.
 */
export function PWARegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.warn("SAFARIA service worker registration unavailable:", error);
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
