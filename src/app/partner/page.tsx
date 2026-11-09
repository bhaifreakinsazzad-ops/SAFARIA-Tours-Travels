"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { SITE_CONFIG } from "@server/config/siteConfig";
import type { StoredB2BDeskRecord } from "@server/db/enquiriesRepository";
import type { PassengerAuditResult } from "@/app/api/partner/verify-passenger/route";

type AuditResultState = (PassengerAuditResult & { penaltyRiskLevel: string }) | null;

export default function PartnerWorkspacePage() {
  const [activeDesk, setActiveDesk] = useState<
    "FARE_DESK" | "BOOKING_DESK" | "CLEAR_MARGIN" | "AFTER_CARE" | "VERIFIED_WORKFLOW" | "PARTNER_GROWTH"
  >("FARE_DESK");

  // Authentication session state
  // TODO: not yet wired to a real login session — see the "known follow-up"
  // note in docs/release-evidence/CONTINUATION_CHECKPOINT.md.
  const [agencyId] = useState<string>("agency-greendelta-01");
  const [agencyName] = useState<string>("Green Delta Travels");

  // Desk Data State
  const [deskRecords, setDeskRecords] = useState<StoredB2BDeskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // FareDesk form state
  const [fareOrigin, setFareOrigin] = useState("DAC");
  const [fareDest, setFareDest] = useState("DXB");
  const [farePax, setFarePax] = useState(1);
  const [fareSubmitted, setFareSubmitted] = useState(false);

  // BookingDesk state
  const [pnrInput, setPnrInput] = useState("");
  const [pnrPassenger, setPnrPassenger] = useState("");
  const [pnrRoute] = useState("DAC-DXB");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // AfterCare state
  const [casePnr, setCasePnr] = useState("");
  const [caseUrgency, setCaseUrgency] = useState<"NORMAL" | "HIGH" | "URGENT">("HIGH");
  const [caseNotes, setCaseNotes] = useState("");
  const [caseSuccessMsg, setCaseSuccessMsg] = useState<string | null>(null);

  // Verified Workflow state
  const [surname, setSurname] = useState("");
  const [givenNames, setGivenNames] = useState("");
  const [title, setTitle] = useState("MR");
  const [passportExpiry, setPassportExpiry] = useState("2028-12-31");
  const [auditResult, setAuditResult] = useState<AuditResultState>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Fetch desk records for this agency
  const fetchDeskData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/desk?deskType=${activeDesk}&agencyId=${agencyId}`, {
        headers: {
          "x-safaria-session": "staging-token",
          Authorization: `Bearer mock-token`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setDeskRecords(data.records || []);
      }
    } catch (e) {
      console.warn("Failed to load desk data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Re-fetch on desk change: fetchDeskData internally calls setState as its
    // async fetch resolves, not synchronously within this effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeskData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDesk]);

  // FareDesk submit handler
  const handleRequestFare = async (carrier: string, netPrice: number, margin: number) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/partner/desk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-safaria-admin-key": "safaria-ops-2026",
        },
        body: JSON.stringify({
          deskType: "FARE_DESK",
          title: `Wholesale Fare Request: ${fareOrigin} ➔ ${fareDest} (${carrier})`,
          priority: "NORMAL",
          payload: {
            origin: fareOrigin,
            destination: fareDest,
            passengers: farePax,
            carrier,
            wholesaleNetBdt: netPrice,
            subAgentMarginBdt: margin,
            quotedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFareSubmitted(true);
        fetchDeskData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // BookingDesk submit handler
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnrInput.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/partner/desk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-safaria-admin-key": "safaria-ops-2026",
        },
        body: JSON.stringify({
          deskType: "BOOKING_DESK",
          title: `PNR Hold / Issuance: ${pnrInput.toUpperCase()} (${pnrRoute})`,
          priority: "HIGH",
          payload: {
            pnr: pnrInput.toUpperCase(),
            passenger: pnrPassenger || "Lead Traveler",
            route: pnrRoute,
            issuedGrossBdt: 52000,
            subAgentMarginBdt: 2400,
            status: "HELD_FOR_VERIFICATION",
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingMessage(`PNR ${pnrInput.toUpperCase()} logged in agency queue.`);
        setPnrInput("");
        setPnrPassenger("");
        fetchDeskData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // AfterCare case submit handler
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNotes.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/partner/desk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-safaria-admin-key": "safaria-ops-2026",
        },
        body: JSON.stringify({
          deskType: "AFTER_CARE",
          title: `Re-issue Request: ${casePnr ? `PNR ${casePnr.toUpperCase()}` : "Flight Disruption"}`,
          priority: caseUrgency,
          payload: {
            pnr: casePnr.toUpperCase(),
            urgency: caseUrgency,
            notes: caseNotes,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCaseSuccessMsg("Urgent re-issue case logged with 24/7 AfterCare desk.");
        setCasePnr("");
        setCaseNotes("");
        fetchDeskData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Verified Workflow audit handler
  const handleAuditPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuditing(true);
    try {
      const res = await fetch("/api/partner/verify-passenger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-safaria-admin-key": "safaria-ops-2026",
        },
        body: JSON.stringify({
          surname,
          givenNames,
          title,
          passportExpiry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.audit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
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
              Partner Agency: {agencyName} (Verified Trial Active)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={fetchDeskData}
            className="flex items-center gap-1 rounded bg-surface-200 border border-safaria-line px-2.5 py-1 text-safaria-ink hover:text-safaria-gold"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
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

          {([
            { id: "FARE_DESK", label: "FareDesk™", desc: "Wholesale fare search", icon: <DollarSign className="h-4 w-4" /> },
            { id: "BOOKING_DESK", label: "BookingDesk™", desc: "PNR & split tickets", icon: <Ticket className="h-4 w-4" /> },
            { id: "CLEAR_MARGIN", label: "ClearMargin™", desc: "Zero hidden fee ledger", icon: <TrendingUp className="h-4 w-4" /> },
            { id: "AFTER_CARE", label: "AfterCare Desk™", desc: "Re-issue & emergency", icon: <Headphones className="h-4 w-4" /> },
            { id: "VERIFIED_WORKFLOW", label: "Verified Workflow™", desc: "Passenger audit gate", icon: <FileCheck className="h-4 w-4" /> },
            { id: "PARTNER_GROWTH", label: "PartnerGrowth™", desc: "Volume tiers & incentives", icon: <Sparkles className="h-4 w-4" /> },
          ] as const).map((desk) => {
            const isActive = activeDesk === desk.id;
            return (
              <button
                key={desk.id}
                onClick={() => setActiveDesk(desk.id)}
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
                  Live GDS and consolidated contract fares with real-time sub-agent margin allocations.
                </p>
              </div>

              {fareSubmitted && (
                <div className="rounded-lg border border-safaria-success/60 bg-safaria-success/10 p-3 text-xs text-safaria-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Wholesale allocation request submitted and recorded to your agency ledger.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-safaria-inkMuted">Origin</label>
                  <select
                    value={fareOrigin}
                    onChange={(e) => setFareOrigin(e.target.value)}
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
                    value={fareDest}
                    onChange={(e) => setFareDest(e.target.value)}
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
                  <label className="text-xs text-safaria-inkMuted">Passengers</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={farePax}
                    onChange={(e) => setFarePax(Number(e.target.value))}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink"
                  />
                </div>
              </div>

              {/* Sample Wholesale Fares with Persist Button */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-safaria-inkMuted">
                  Available Wholesale Allocations:
                </span>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-safaria-ink">Biman Bangladesh Airlines (BG584)</span>
                    <span className="text-xs text-safaria-inkMuted block">Direct · Economy · 30kg baggage</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-safaria-inkMuted block">Wholesale Net:</span>
                      <strong className="text-base font-mono text-safaria-gold">৳42,800 BDT</strong>
                      <span className="text-[10px] text-safaria-success block">+ ৳2,200 Sub-Agent Margin</span>
                    </div>
                    <button
                      onClick={() => handleRequestFare("Biman Bangladesh", 42800, 2200)}
                      disabled={isLoading}
                      className="rounded-btn bg-safaria-gold px-3.5 py-2 text-xs font-bold text-safaria-onGold hover:shadow-btn"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm text-safaria-ink">Emirates (EK583)</span>
                    <span className="text-xs text-safaria-inkMuted block">Non-Stop · Flex Economy · 35kg baggage</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-safaria-inkMuted block">Wholesale Net:</span>
                      <strong className="text-base font-mono text-safaria-gold">৳48,500 BDT</strong>
                      <span className="text-[10px] text-safaria-success block">+ ৳2,850 Sub-Agent Margin</span>
                    </div>
                    <button
                      onClick={() => handleRequestFare("Emirates", 48500, 2850)}
                      disabled={isLoading}
                      className="rounded-btn bg-safaria-gold px-3.5 py-2 text-xs font-bold text-safaria-onGold hover:shadow-btn"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>

              {/* History of Requested Fares from DB */}
              {deskRecords.length > 0 && (
                <div className="border-t border-safaria-line/40 pt-4 space-y-2">
                  <span className="text-xs font-semibold text-safaria-inkMuted">
                    Your Saved FareDesk Requests:
                  </span>
                  <div className="space-y-2">
                    {deskRecords.map((rec) => (
                      <div key={rec.id} className="rounded-lg bg-surface-input p-2.5 text-xs font-mono flex justify-between items-center border border-safaria-line/30">
                        <span className="text-safaria-ink">{rec.title}</span>
                        <span className="text-safaria-gold font-bold">{rec.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

              {bookingMessage && (
                <div className="rounded-lg border border-safaria-success/60 bg-safaria-success/10 p-3 text-xs text-safaria-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{bookingMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreateBooking} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="6-Char PNR (e.g. 7K9W2X)"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value)}
                  className="rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm font-mono text-safaria-ink uppercase"
                />
                <input
                  type="text"
                  placeholder="Passenger Full Name"
                  value={pnrPassenger}
                  onChange={(e) => setPnrPassenger(e.target.value)}
                  className="rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-btn bg-safaria-gold px-4 py-2 text-xs font-bold text-safaria-onGold"
                >
                  Log PNR Hold in Database
                </button>
              </form>

              {/* Persisted Bookings List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-safaria-inkMuted">
                  Active Agency PNR Records ({deskRecords.length}):
                </span>
                {deskRecords.length === 0 ? (
                  <p className="text-xs text-safaria-inkFaint">No PNR holds logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deskRecords.map((r) => (
                      <div key={r.id} className="rounded-xl border border-safaria-line bg-surface-200 p-3 text-xs font-mono flex justify-between items-center">
                        <div>
                          <strong className="text-safaria-gold block">{r.title}</strong>
                          <span className="text-[11px] text-safaria-inkMuted">
                            Passenger: {(r.payload as { passenger?: string }).passenger || "Traveler"}
                          </span>
                        </div>
                        <span className="rounded bg-surface-input px-2 py-1 text-safaria-success font-bold text-[11px]">
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                  Zero hidden markups. Live commission ledger and payout balance reconciliation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Current Balance</span>
                  <strong className="text-2xl font-mono text-safaria-gold">৳14,250 BDT</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Logged Bookings</span>
                  <strong className="text-2xl font-mono text-safaria-ink">34 Tickets</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Weekly Settlement</span>
                  <strong className="text-2xl font-mono text-safaria-success">Thursday</strong>
                </div>
              </div>

              <div className="rounded-xl border border-safaria-line bg-surface-input p-4 space-y-2 text-xs">
                <span className="font-semibold text-safaria-ink block">Recent ClearMargin Transactions:</span>
                <div className="flex justify-between py-1.5 border-b border-safaria-line/30 font-mono">
                  <span>EK583 · DAC-DXB (2 Pax)</span>
                  <span className="text-safaria-success">+ ৳4,800 BDT</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-safaria-line/30 font-mono">
                  <span>BG584 · DAC-JED (1 Pax)</span>
                  <span className="text-safaria-success">+ ৳2,200 BDT</span>
                </div>
                <div className="flex justify-between py-1.5 font-mono">
                  <span>Weekly Bank Wire Payout</span>
                  <span className="text-safaria-gold">Paid (Trx: #W20261102)</span>
                </div>
              </div>
            </div>
          )}

          {/* Desk 4: AfterCare */}
          {activeDesk === "AFTER_CARE" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  AfterCare Desk™ — Re-issuance & Emergency Support
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  24/7 priority support for airline disruptions, date changes, and emergency rerouting.
                </p>
              </div>

              {caseSuccessMsg && (
                <div className="rounded-lg border border-safaria-success/60 bg-safaria-success/10 p-3 text-xs text-safaria-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{caseSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateCase} className="rounded-xl border border-safaria-line bg-surface-input p-5 space-y-4 text-xs">
                <span className="font-bold text-safaria-ink block">Raise an Urgent Re-issue Ticket:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="PNR or Ticket Number (Optional)"
                    value={casePnr}
                    onChange={(e) => setCasePnr(e.target.value)}
                    className="rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink font-mono uppercase"
                  />
                  <select
                    value={caseUrgency}
                    onChange={(e) => setCaseUrgency(e.target.value as "NORMAL" | "HIGH" | "URGENT")}
                    className="rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                  >
                    <option value="NORMAL">Normal (&gt; 48 hours to flight)</option>
                    <option value="HIGH">High (Within 24 hours)</option>
                    <option value="URGENT">Urgent (Airport Check-in / Disruption)</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe date change requirements, passenger details, or airline cancellation..."
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-btn bg-safaria-gold px-4 py-2.5 text-xs font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all"
                >
                  Log Urgent Case in AfterCare Database
                </button>
              </form>

              {/* Case records list */}
              {deskRecords.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-safaria-inkMuted">
                    Your Open Support Cases ({deskRecords.length}):
                  </span>
                  {deskRecords.map((c) => (
                    <div key={c.id} className="rounded-xl border border-safaria-line bg-surface-200 p-3 text-xs flex justify-between items-center">
                      <div>
                        <strong className="text-safaria-ink block">{c.title}</strong>
                        <span className="text-[11px] text-safaria-inkMuted">
                          Urgency: {c.priority} · Status: {c.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-safaria-gold font-mono">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                  Double-audit mechanism checking passenger name formatting against airline reservation standards.
                </p>
              </div>

              <form onSubmit={handleAuditPassenger} className="rounded-xl border border-safaria-line bg-surface-input p-5 space-y-4 text-xs">
                <span className="font-bold text-safaria-ink block">Run Pre-Issuance Passenger Audit:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-safaria-inkMuted block mb-1">Surname (Last Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RAHMAN"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-safaria-inkMuted block mb-1">Given Names (First + Middle) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TANVIR"
                      value={givenNames}
                      onChange={(e) => setGivenNames(e.target.value)}
                      className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-safaria-inkMuted block mb-1">Title</label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                    >
                      <option value="MR">MR</option>
                      <option value="MRS">MRS</option>
                      <option value="MS">MS</option>
                      <option value="MSTR">MSTR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-safaria-inkMuted block mb-1">Passport Expiry Date</label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full sm:w-1/2 rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="rounded-btn bg-safaria-gold px-4 py-2.5 text-xs font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all"
                >
                  {isAuditing ? "Auditing..." : "Audit Passenger Name & Rules"}
                </button>
              </form>

              {/* Audit Results */}
              {auditResult && (
                <div
                  className={`rounded-xl border p-5 space-y-3 text-xs ${
                    auditResult.valid
                      ? "border-safaria-success/60 bg-safaria-success/10 text-safaria-success"
                      : "border-safaria-danger/60 bg-safaria-danger/10 text-safaria-danger"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {auditResult.valid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Audit Passed: Zero Re-issue Penalty Risk</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5" />
                        <span>Warning: Potential Airline Name Penalty Detected</span>
                      </>
                    )}
                  </div>

                  <div className="font-mono text-xs bg-surface-0 p-3 rounded-lg border border-safaria-line text-safaria-ink">
                    <span className="text-safaria-inkMuted block">Normalized GDS Reservation String:</span>
                    <strong className="text-safaria-gold text-sm">{auditResult.formattedGdsString}</strong>
                  </div>

                  {auditResult.warnings.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-safaria-ink leading-relaxed">
                      {auditResult.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Desk 6: PartnerGrowth */}
          {activeDesk === "PARTNER_GROWTH" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  PartnerGrowth™ — Incentive Tiers & Rebates
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Volume tiers, airline bonus rebates, and staff enablement resources.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-safaria-gold bg-safaria-gold/15 p-5 flex items-center justify-between">
                  <div>
                    <strong className="text-safaria-gold text-base block">Silver Tier (Active Agency Status)</strong>
                    <span className="text-safaria-inkMuted">
                      Volume: 20–50 tickets / mo · ৳350 bonus rebate per ticket
                    </span>
                  </div>
                  <span className="rounded-full bg-safaria-gold text-safaria-onGold px-3 py-1 font-bold text-xs">
                    Current Level
                  </span>
                </div>

                <div className="rounded-xl border border-safaria-line bg-surface-200 p-5 flex items-center justify-between opacity-80">
                  <div>
                    <strong className="text-safaria-ink text-base block">Gold Tier (Next Milestone)</strong>
                    <span className="text-safaria-inkMuted">
                      Volume: 51–100 tickets / mo · ৳600 bonus rebate + Dedicated VIP Desk Phone
                    </span>
                  </div>
                  <span className="text-safaria-inkMuted font-mono">16 more tickets to unlock</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
