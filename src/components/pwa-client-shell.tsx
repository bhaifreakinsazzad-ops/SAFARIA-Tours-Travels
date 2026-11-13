"use client";

import dynamic from "next/dynamic";

const OfflineIndicator = dynamic(
  () => import("./offline-indicator").then((m) => m.OfflineIndicator),
  { ssr: false }
);

const MobilePwaNav = dynamic(
  () => import("./mobile-pwa-nav").then((m) => m.MobilePwaNav),
  { ssr: false }
);

export function PwaClientShell() {
  return (
    <>
      <OfflineIndicator />
      <MobilePwaNav />
    </>
  );
}
