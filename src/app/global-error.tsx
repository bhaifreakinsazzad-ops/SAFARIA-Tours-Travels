"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#031412] text-[#f7f2ea] flex min-h-screen items-center justify-center p-4 font-sans">
        <div className="max-w-md rounded-2xl border border-[#c5a059]/40 bg-[#06201c] p-6 text-center space-y-4 shadow-xl">
          <h2 className="text-xl font-bold text-[#c5a059]">Application Error</h2>
          <p className="text-xs text-[#a3b8b0]">
            An unexpected error occurred. Please try reloading the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-[#c5a059] px-4 py-2 text-xs font-bold text-[#031412] hover:bg-[#d6b26c] transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
