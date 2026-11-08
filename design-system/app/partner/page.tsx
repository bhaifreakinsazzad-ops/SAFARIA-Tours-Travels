"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Ticket,
  TrendingUp,
  Headphones,
  FileCheck,
  Sparkles,
  Plane,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

export default function PartnerWorkspacePage() {
  const [activeDesk, setActiveDesk] = useState<
    "FARE_DESK" | "BOOKING_DESK" | "CLEAR_MARGIN" | "AFTER_CARE" | "VERIFIED_WORKFLOW" | "PARTNER_GROWTH"
  >("FARE_DESK");

  // Simulated sub-agent balance & ledger
  const [origin, setOrigin] = useState("DAC");
  const [dest, setDest] = useState("DXB");
  const [pnrQuery, setPnrQuery] = useState("");
  const [pnrResult, setPnrResult] = useState<string | null>(null);

  const handlePnrSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrQuery) return;
    setPnrResult(`PNR ${pnrQuery.toUpperCase()} · Confirmed allocation on EK583 · Split Fare active.`);
  };

  return (
    <div className="min-h-screen bg-surface-0 text-safaria-ink">
      {/* Partner Header */}
      <header className="border-b border-safaria-line bg-surface-100 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-safaria-inkMuted hover:text-safaria-gold transition-colors mr-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Site</span>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-0 border border-safaria-gold/40">
            <Plane className="h-4 w-4 text-safaria-gold" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-bold text-safaria-gold">
              SAFARIA Partner Portal (B2B Workspace)
            </h1>
            <span className="text-[10px] text-safaria-inkMuted font-mono">
              Partner Agency: Green Delta Travels (Verified Trial Active)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="rounded bg-surface-0 px-3 py-1.5 border border-safaria-line/40">
            <span className="text-safaria-inkMuted">Sub-Agent Margin: </span>
            <span className="text-safaria-gold font-bold">৳14,250 BDT</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: 6 Desks */}
        <aside className="lg:col-span-3 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-safaria-gold block px-2 mb-2">
            The 6 Operational Desks
          </span>

          {[
            { id: "FARE_DESK", label: "FareDesk™", desc: "Wholesale fare search", icon: <DollarSign className="h-4 w-4" /> },
            { id: "BOOKING_DESK", label: "BookingDesk™", desc: "PNR & split tickets", icon: <Ticket className="h-4 w-4" /> },
            { id: "CLEAR_MARGIN", label: "ClearMargin™", desc: "Zero hidden fee ledger", icon: <TrendingUp className="h-4 w-4" /> },
            { id: "AFTER_CARE", label: "AfterCare Desk™", desc: "Re-issue & emergency", icon: <Headphones className="h-4 w-4" /> },
            { id: "VERIFIED_WORKFLOW", label: "Verified Workflow™", desc: "Passenger audit gate", icon: <FileCheck className="h-4 w-4" /> },
            { id: "PARTNER_GROWTH", label: "PartnerGrowth™", desc: "Volume tiers & incentives", icon: <Sparkles className="h-4 w-4" /> },
          ].map((desk) => {
            const isActive = activeDesk === desk.id;
            return (
              <button
                key={desk.id}
                onClick={() => setActiveDesk(desk.id as any)}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border ${
                  isActive
                    ? "border-safaria-gold bg-safaria-gold/15 text-safaria-gold shadow-sm"
                    : "border-safaria-line/50 bg-surface-100 text-safaria-inkMuted hover:border-safaria-gold/40 hover:text-safaria-ink"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isActive ? "bg-safaria-gold text-safaria-onGold" : "bg-surface-0 text-safaria-gold"
                  }`}
                >
                  {desk.icon}
                </div>
                <div>
                  <strong className="block text-xs font-bold text-safaria-ink">{desk.label}</strong>
                  <span className="text-[10px] text-safaria-inkMuted">{desk.desc}</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Right Active Desk Workspace */}
        <main className="lg:col-span-9 rounded-2xl border border-safaria-line bg-surface-100 p-6 sm:p-8 shadow-panel min-h-[500px]">
          {/* Desk 1: FareDesk */}
          {activeDesk === "FARE_DESK" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  FareDesk™ — Wholesale Inventory Sourcing
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Real-time GDS and consolidated LCC fare comparisons with pre-negotiated sub-agency commissions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-safaria-inkMuted">Origin</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink"
                  >
                    {SITE_CONFIG.airports.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.iata} — {a.cityEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-safaria-inkMuted">Destination</label>
                  <select
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink"
                  >
                    {SITE_CONFIG.airports.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.iata} — {a.cityEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button className="w-full flex items-center justify-center gap-2 rounded-btn bg-safaria-gold text-safaria-onGold font-bold text-xs py-2.5">
                    <Search className="h-4 w-4" /> Sourcing Fares
                  </button>
                </div>
              </div>

              {/* Sample Fare Results */}
              <div className="space-y-3 pt-4">
                <span className="text-xs font-semibold text-safaria-inkMuted">
                  Available Contract Fares for {origin} ➔ {dest}:
                </span>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-safaria-ink">Biman Bangladesh Airlines (Direct)</span>
                    <span className="text-xs text-safaria-inkMuted block">Economy Class · 30kg Baggage</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-safaria-inkMuted block">Your Wholesale Net:</span>
                    <strong className="text-base font-mono text-safaria-gold">৳42,800 BDT</strong>
                    <span className="text-[10px] text-safaria-success block">+ ৳2,200 Sub-Agent Margin</span>
                  </div>
                </div>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-safaria-ink">Emirates (Direct/1-Stop)</span>
                    <span className="text-xs text-safaria-inkMuted block">Flex Economy · 35kg Baggage</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-safaria-inkMuted block">Your Wholesale Net:</span>
                    <strong className="text-base font-mono text-safaria-gold">৳48,500 BDT</strong>
                    <span className="text-[10px] text-safaria-success block">+ ৳2,850 Sub-Agent Margin</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desk 2: BookingDesk */}
          {activeDesk === "BOOKING_DESK" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  BookingDesk™ — PNR Management & Split Ticketing
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Issue, hold, and manage client PNRs with transparent split-fare breakdowns.
                </p>
              </div>

              <form onSubmit={handlePnrSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-character PNR (e.g. 7X9K2W)"
                  value={pnrQuery}
                  onChange={(e) => setPnrQuery(e.target.value)}
                  className="flex-1 rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm font-mono text-safaria-ink uppercase"
                />
                <button
                  type="submit"
                  className="rounded-btn bg-safaria-gold px-4 py-2 text-xs font-bold text-safaria-onGold"
                >
                  Lookup PNR
                </button>
              </form>

              {pnrResult && (
                <div className="rounded-xl border border-safaria-gold/40 bg-surface-200 p-4 text-xs font-mono text-safaria-gold">
                  {pnrResult}
                </div>
              )}
            </div>
          )}

          {/* Desk 3: ClearMargin */}
          {activeDesk === "CLEAR_MARGIN" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  ClearMargin™ — Sub-Agent Financial Ledger
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Zero hidden markups. Track exact commissions, gross vs net fare, and instant withdrawal reconciliation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Current Balance</span>
                  <strong className="text-xl font-mono text-safaria-gold">৳14,250 BDT</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Tickets Issued This Month</span>
                  <strong className="text-xl font-mono text-safaria-ink">34 Tickets</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Next Settlement Cycle</span>
                  <strong className="text-xl font-mono text-safaria-success">Thursday (Weekly)</strong>
                </div>
              </div>
            </div>
          )}

          {/* Desk 4: AfterCare */}
          {activeDesk === "AFTER_CARE" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  AfterCare Desk™ — Re-issuance & Waiver Support
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  24/7 dedicated assistance for flight cancellations, date changes, and airline emergency waivers.
                </p>
              </div>

              <div className="rounded-xl border border-safaria-line bg-surface-input p-5 space-y-4 text-xs">
                <span className="font-bold text-safaria-ink block">Raise an Urgent Re-issue Ticket:</span>
                <input
                  type="text"
                  placeholder="Ticket Number or PNR"
                  className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                />
                <textarea
                  rows={3}
                  placeholder="Describe date change requirements or disruption details..."
                  className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                />
                <button className="rounded-btn bg-safaria-gold px-4 py-2 text-xs font-bold text-safaria-onGold">
                  Submit Urgent Re-issue Case
                </button>
              </div>
            </div>
          )}

          {/* Desk 5: Verified Workflow */}
          {activeDesk === "VERIFIED_WORKFLOW" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  Verified Workflow™ — Zero-Penalty Name Verification
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Double-audit mechanism checking passport machine-readable zones (MRZ) before irreversible ticket issuance.
                </p>
              </div>

              <div className="rounded-xl border border-safaria-success/40 bg-surface-200 p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-safaria-success font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Dual Passenger Verification Enabled</span>
                </div>
                <p className="text-safaria-inkMuted leading-relaxed">
                  Every booking in your agency portal undergoes automated surname/given-name formatting audit to ensure 0% airline name-correction penalties.
                </p>
              </div>
            </div>
          )}

          {/* Desk 6: PartnerGrowth */}
          {activeDesk === "PARTNER_GROWTH" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  PartnerGrowth™ — Incentive Tiers & Training
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Volume tiers, airline bonus rebates, and staff ticketing enablement workshops.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex items-center justify-between">
                  <div>
                    <strong className="text-safaria-gold text-sm block">Silver Tier (Current)</strong>
                    <span className="text-safaria-inkMuted">20–50 tickets / mo · ৳350 extra rebate per ticket</span>
                  </div>
                  <span className="rounded bg-safaria-gold/20 text-safaria-gold px-3 py-1 font-bold">
                    Active
                  </span>
                </div>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex items-center justify-between opacity-75">
                  <div>
                    <strong className="text-safaria-ink text-sm block">Gold Tier (Next)</strong>
                    <span className="text-safaria-inkMuted">51–100 tickets / mo · ৳600 extra rebate + VIP hotline</span>
                  </div>
                  <span className="text-safaria-inkMuted font-mono">17 tickets remaining</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
