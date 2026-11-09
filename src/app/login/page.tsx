"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed. Please check your credentials.");
        setSubmitting(false);
        return;
      }

      router.push(data.role === "SUPER_ADMIN" ? "/admin" : "/partner");
    } catch {
      setError("Unable to reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 text-safaria-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-safaria-inkMuted hover:text-safaria-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Public Site</span>
        </Link>

        <div className="rounded-xl border border-safaria-line bg-surface-100 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-0 border border-safaria-gold/40">
              <Lock className="h-4 w-4 text-safaria-gold" />
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-safaria-gold">SAFARIA Sign In</h1>
              <span className="text-[10px] text-safaria-inkMuted">Staff &amp; B2B Partner Portal</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] font-semibold text-safaria-inkMuted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                placeholder="you@agency.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[11px] font-semibold text-safaria-inkMuted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-btn bg-safaria-gold px-4 py-2.5 text-sm font-semibold text-safaria-onGold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-[11px] text-safaria-inkMuted text-center">
            No agency account yet?{" "}
            <Link href="/#agency-application" className="text-safaria-gold hover:underline">
              Apply for B2B partnership
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
