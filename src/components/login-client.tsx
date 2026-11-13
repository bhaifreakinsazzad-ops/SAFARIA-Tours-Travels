"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { SAFARIA_CONFIG } from "@/config/constants";
import { motion } from "motion/react";
import { animate } from "animejs";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
        if (cardRef.current) {
          animate(cardRef.current, {
            translateX: [0, -6, 6, -4, 4, 0],
            duration: 360,
            ease: "outQuad",
          });
        }
        return;
      }

      setSubmitting(false);
      router.push(data.role === "SUPER_ADMIN" ? "/admin" : "/partner");
    } catch {
      setError("Unable to reach the server. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 text-safaria-ink flex items-center justify-center px-4 py-8 pb-24 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="w-full max-w-sm space-y-6"
      >
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center gap-1.5 text-xs text-safaria-inkMuted hover:text-safaria-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Public Site</span>
        </Link>

        <div
          ref={cardRef}
          className="rounded-xl border border-safaria-line bg-surface-100 p-5 sm:p-6 space-y-5 shadow-panel"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-0 border border-safaria-gold/40">
                <Lock className="h-4 w-4 text-safaria-gold" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base font-bold text-safaria-gold">SAFARIA Sign In</h1>
                <span className="text-[10px] text-safaria-inkMuted block truncate">Staff &amp; B2B Partner Portal</span>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="h-3 w-3" />
              TLS Verified
            </span>
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
                className="w-full min-h-[44px] rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-base sm:text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
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
                className="w-full min-h-[44px] rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-base sm:text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
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
              className="w-full min-h-[44px] rounded-btn bg-safaria-gold px-4 py-2.5 text-sm font-semibold text-safaria-onGold shadow-btn hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="pt-2 border-t border-safaria-line/40 space-y-2">
            <span className="text-[10px] font-semibold text-safaria-inkMuted block text-center uppercase tracking-wider">
              Quick Test Account
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail(SAFARIA_CONFIG.defaultStaffEmail);
                setPassword("safaria-ops-2026");
                if (cardRef.current) {
                  animate(cardRef.current, {
                    scale: [1, 1.015, 1],
                    duration: 260,
                    ease: "outQuad",
                  });
                }
              }}
              className="w-full min-h-[48px] rounded border border-safaria-line bg-surface-200 p-2.5 text-left hover:border-safaria-gold transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <strong className="block text-safaria-gold font-semibold text-xs">Ops Staff / Admin Access</strong>
                <span className="text-[10px] text-safaria-inkMuted block truncate">Operations Triage Desk &amp; Agency Approvals</span>
              </div>
              <span className="text-xs text-safaria-gold font-bold shrink-0">Auto-fill →</span>
            </button>
          </div>

          <p className="text-[11px] text-safaria-inkMuted text-center">
            No agency account yet?{" "}
            <Link href="/#sf-agency" className="text-safaria-gold hover:underline">
              Apply for B2B partnership
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
