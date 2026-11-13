"use client";

import React from "react";

export function PWARegistrar() {
  return (
    <script
      id="safaria-sw-registrar"
      dangerouslySetInnerHTML={{
        __html: `if(typeof window!=="undefined"&&"serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){});});}`,
      }}
    />
  );
}
