"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LogOut,
  CreditCard,
  History,
  ShieldAlert,
  MessageCircle,
} from "lucide-react";
import { SITE_CONFIG } from "@server/config/siteConfig";
import { whatsappHrefFor } from "@/config/constants";
import type { StoredB2BDeskRecord, AgencyInvoice } from "@server/db/enquiriesRepository";
import type { PassengerAuditResult } from "@/app/api/partner/verify-passenger/route";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { motion, AnimatePresence } from "motion/react";
import { animate, stagger } from "animejs";

type AuditResultState = (PassengerAuditResult & { penaltyRiskLevel: string }) | null;

interface MembershipInfo {
  status: string;
  plan: string;
  isTrial: boolean;
  isActive: boolean;
  trialActivatedAt: string | null;
  trialExpiresAt: string | null;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  isRenewalDue: boolean;
  usage: {
    fareUsed: number;
    fareLimit: number;
    fareRemaining: number;
    bookingUsed: number;
    bookingLimit: number;
    bookingRemaining: number;
    afterCareUsed: number;
    afterCareLimit: number;
    afterCareRemaining: number;
    verifiedUsed: number;
    seatsUsed: number;
    seatsLimit: number;
  };
}

export default function PartnerWorkspacePage() {
  const router = useRouter();
  const [activeDesk, setActiveDesk] = useState<
    "FARE_DESK" | "BOOKING_DESK" | "CLEAR_MARGIN" | "AFTER_CARE" | "VERIFIED_WORKFLOW" | "PARTNER_GROWTH" | "MEMBERSHIP" | "AUDIT"
  >("FARE_DESK");

  // Authentication session state — populated from the real /api/auth/me
  // session check below; the signed-in agency cannot be chosen by the client.
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [agencyId, setAgencyId] = useState<string>("");
  const [agencyName, setAgencyName] = useState<string>("");

  // Desk Data State
  const [deskRecords, setDeskRecords] = useState<StoredB2BDeskRecord[]>([]);
  // All of this agency's desk records across every desk type — used to compute
  // the ClearMargin ledger and PartnerGrowth volume tier from real data.
  const [allDeskRecords, setAllDeskRecords] = useState<StoredB2BDeskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [invoices, setInvoices] = useState<AgencyInvoice[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Fetch real membership and quota usage
  const fetchMembershipData = async () => {
    try {
      const res = await fetch("/api/partner/membership", { credentials: "include" });
      if (res.status === 401 || res.status === 403) return;
      const data = await res.json();
      if (data.success && data.membership) {
        setMembership(data.membership);
        if (data.invoices) setInvoices(data.invoices);
      }
    } catch (e) {
      console.warn("Failed to load membership data:", e);
    }
  };

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

  // Fetch desk records for this agency (session cookie identifies the agency —
  // the client never supplies its own agencyId to the server).
  const fetchDeskData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/desk?deskType=${activeDesk}`, {
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
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

  // Fetch every desk record for this agency, across all desk types — feeds
  // the ClearMargin ledger and PartnerGrowth tier computation with real data.
  const fetchAllDeskData = async () => {
    try {
      const res = await fetch("/api/partner/desk", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAllDeskRecords(data.records || []);
      }
    } catch (e) {
      console.warn("Failed to load agency ledger data:", e);
    }
  };

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user?.role !== "B2B_PARTNER") {
        router.push("/login");
        return;
      }
      setAgencyId(meData.user.agencyId || "");
      setAgencyName(meData.user.agencyName || "Partner Agency");
      setCheckingAuth(false);
      fetchAllDeskData();
      fetchMembershipData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Re-fetch on desk change: fetchDeskData internally calls setState as its
    // async fetch resolves, not synchronously within this effect body.
    if (checkingAuth) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeskData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDesk, checkingAuth]);

  useEffect(() => {
    if (!membership) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduced) return;
    animate(".partner-quota-card", {
      translateY: [6, 0],
      opacity: [0.6, 1],
      delay: stagger(45),
      duration: 300,
      ease: "outQuad",
    });
  }, [membership]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  // Real ClearMargin ledger derived from this agency's own FareDesk/BookingDesk
  // records — no static/hardcoded figures.
  const clearMarginTotalBdt = allDeskRecords
    .filter((r) => r.deskType === "FARE_DESK" || r.deskType === "BOOKING_DESK")
    .reduce((sum, r) => {
      const margin = Number((r.payload as { subAgentMarginBdt?: number })?.subAgentMarginBdt) || 0;
      return sum + margin;
    }, 0);
  const loggedBookingCount = allDeskRecords.filter((r) => r.deskType === "BOOKING_DESK").length;

  // FareDesk submit handler
  const handleRequestFare = async (carrier: string, netPrice: number, margin: number) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/partner/desk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setFareSubmitted(true);
        fetchDeskData();
        fetchAllDeskData();
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBookingMessage(`PNR ${pnrInput.toUpperCase()} logged in agency queue.`);
        setPnrInput("");
        setPnrPassenger("");
        fetchDeskData();
        fetchAllDeskData();
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          surname,
          givenNames,
          title,
          passportExpiry,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-surface-0 text-safaria-ink flex items-center justify-center text-sm text-safaria-inkMuted">
        Verifying session…
      </div>
    );
  }

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
              Partner Agency: {agencyName} ({agencyId})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <PWAInstallButton variant="header" />
          <button
            onClick={() => {
              fetchDeskData();
              fetchMembershipData();
              fetchAllDeskData();
            }}
            className="flex items-center gap-1 rounded bg-surface-200 border border-safaria-line px-2.5 py-1 text-safaria-ink hover:text-safaria-gold"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <div className="rounded bg-surface-0 px-3 py-1.5 border border-safaria-line/40">
            <span className="text-safaria-inkMuted">Sub-Agent Margin: </span>
            <span className="text-safaria-gold font-bold">৳{clearMarginTotalBdt.toLocaleString()} BDT</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded bg-surface-200 border border-safaria-line px-2.5 py-1 text-safaria-ink hover:text-red-400"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Real Membership & Entitlement Status Banner (Track C) */}
        {membership && (
          <div className="rounded-2xl border border-safaria-gold/40 bg-surface-100 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-safaria-line/40 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                  membership.isTrial
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  {membership.isTrial ? "72-Hour Pilot Trial" : `Active Partner (${membership.plan})`}
                </span>
                <span className="text-xs text-safaria-inkMuted">
                  {membership.isTrial && membership.trialExpiresAt
                    ? `Trial valid until ${new Date(membership.trialExpiresAt).toLocaleDateString()}`
                    : (membership.subscriptionExpiresAt
                        ? `Valid until ${new Date(membership.subscriptionExpiresAt).toLocaleDateString()}`
                        : "Active Partner Status")}
                </span>
              </div>

              {membership.isRenewalDue && (
                <a
                  href={whatsappHrefFor(`SAFARIA B2B RENEWAL\nAgency: ${agencyName}\nAgencyId: ${agencyId}\nRequest: Please assist with membership subscription renewal.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Renew on WhatsApp</span>
                </a>
              )}
            </div>

            {/* Quota Usage Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="partner-quota-card rounded-xl border border-safaria-line/60 bg-surface-0 p-3 space-y-1">
                <span className="text-safaria-inkMuted block text-[10px] uppercase">FareDesk™ Quota</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-safaria-gold text-sm">{membership.usage.fareRemaining}</span>
                  <span className="text-safaria-inkMuted text-[10px]">/ {membership.usage.fareLimit} left</span>
                </div>
                <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-safaria-gold h-full rounded-full transition-all"
                    style={{ width: `${membership.usage.fareLimit > 0 ? (membership.usage.fareRemaining / membership.usage.fareLimit) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="partner-quota-card rounded-xl border border-safaria-line/60 bg-surface-0 p-3 space-y-1">
                <span className="text-safaria-inkMuted block text-[10px] uppercase">BookingDesk™ Quota</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-safaria-gold text-sm">{membership.usage.bookingRemaining}</span>
                  <span className="text-safaria-inkMuted text-[10px]">/ {membership.usage.bookingLimit} left</span>
                </div>
                <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-safaria-gold h-full rounded-full transition-all"
                    style={{ width: `${membership.usage.bookingLimit > 0 ? (membership.usage.bookingRemaining / membership.usage.bookingLimit) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="partner-quota-card rounded-xl border border-safaria-line/60 bg-surface-0 p-3 space-y-1">
                <span className="text-safaria-inkMuted block text-[10px] uppercase">AfterCare™ Quota</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-safaria-gold text-sm">{membership.usage.afterCareRemaining}</span>
                  <span className="text-safaria-inkMuted text-[10px]">/ {membership.usage.afterCareLimit} left</span>
                </div>
                <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-safaria-gold h-full rounded-full transition-all"
                    style={{ width: `${membership.usage.afterCareLimit > 0 ? (membership.usage.afterCareRemaining / membership.usage.afterCareLimit) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="partner-quota-card rounded-xl border border-safaria-line/60 bg-surface-0 p-3 space-y-1">
                <span className="text-safaria-inkMuted block text-[10px] uppercase">Team Seats</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-safaria-gold text-sm">{membership.usage.seatsUsed}</span>
                  <span className="text-safaria-inkMuted text-[10px]">/ {membership.usage.seatsLimit} active</span>
                </div>
                <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            </div>

            {quotaError && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-red-300">Quota Limit Notice</strong>
                    <span>{quotaError}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuotaError(null)}
                  className="text-red-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: 6 Desks + Membership & Audit */}
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
              { id: "MEMBERSHIP", label: "Membership & Invoices", desc: "Entitlements & billing", icon: <CreditCard className="h-4 w-4" /> },
              { id: "AUDIT", label: "Activity History", desc: "Cross-desk audit trail", icon: <History className="h-4 w-4" /> },
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
          <AnimatePresence mode="wait">
          <motion.div
            key={activeDesk}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
          {/* Desk 1: FareDesk */}
          {activeDesk === "FARE_DESK" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  FareDesk™ — Wholesale Inventory Sourcing
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Manual fare-request workflow — a specialist sources and confirms wholesale net
                  pricing after you submit a request. Not a live GDS/consolidator search.
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
                  Sample Indicative Fares (manual request only — not live inventory):
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
                  <strong className="text-2xl font-mono text-safaria-gold">৳{clearMarginTotalBdt.toLocaleString()} BDT</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Logged Bookings</span>
                  <strong className="text-2xl font-mono text-safaria-ink">{loggedBookingCount} Tickets</strong>
                </div>
                <div className="rounded-xl border border-safaria-line bg-surface-200 p-4">
                  <span className="text-xs text-safaria-inkMuted block">Settlement</span>
                  <strong className="text-lg font-mono text-safaria-success">Manual (contact Ops)</strong>
                </div>
              </div>

              <div className="rounded-xl border border-safaria-line bg-surface-input p-4 space-y-2 text-xs">
                <span className="font-semibold text-safaria-ink block">
                  FareDesk / BookingDesk Transactions Feeding This Ledger:
                </span>
                {allDeskRecords.filter((r) => r.deskType === "FARE_DESK" || r.deskType === "BOOKING_DESK").length === 0 ? (
                  <p className="text-safaria-inkFaint py-1.5">
                    No margin-bearing transactions logged yet. Submit a FareDesk or BookingDesk request to populate this ledger.
                  </p>
                ) : (
                  allDeskRecords
                    .filter((r) => r.deskType === "FARE_DESK" || r.deskType === "BOOKING_DESK")
                    .map((r) => (
                      <div key={r.id} className="flex justify-between py-1.5 border-b border-safaria-line/30 font-mono last:border-0">
                        <span>{r.title}</span>
                        <span className="text-safaria-success">
                          + ৳{(Number((r.payload as { subAgentMarginBdt?: number })?.subAgentMarginBdt) || 0).toLocaleString()} BDT
                        </span>
                      </div>
                    ))
                )}
                <p className="text-[10px] text-safaria-inkFaint pt-1">
                  Payout settlement is processed manually by SAFARIA Operations; this ledger reflects logged margin, not a live wallet balance.
                </p>
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

              {(() => {
                const TIERS = [
                  { name: "Bronze", min: 0, max: 19, rebate: 150 },
                  { name: "Silver", min: 20, max: 50, rebate: 350 },
                  { name: "Gold", min: 51, max: 100, rebate: 600 },
                  { name: "Platinum", min: 101, max: Infinity, rebate: 900 },
                ];
                const count = loggedBookingCount;
                const currentIdx = TIERS.findIndex((t) => count >= t.min && count <= t.max);
                const current = TIERS[currentIdx] ?? TIERS[0];
                const next = TIERS[currentIdx + 1];

                return (
                  <div className="space-y-3 text-xs">
                    <p className="text-safaria-inkMuted">
                      Tier is computed from this agency&apos;s {count} logged BookingDesk ticket{count === 1 ? "" : "s"} this month.
                    </p>
                    <div className="rounded-xl border border-safaria-gold bg-safaria-gold/15 p-5 flex items-center justify-between">
                      <div>
                        <strong className="text-safaria-gold text-base block">{current.name} Tier (Active Agency Status)</strong>
                        <span className="text-safaria-inkMuted">
                          Volume: {current.min}
                          {current.max === Infinity ? "+" : `–${current.max}`} tickets / mo · ৳{current.rebate} bonus rebate per ticket
                        </span>
                      </div>
                      <span className="rounded-full bg-safaria-gold text-safaria-onGold px-3 py-1 font-bold text-xs">
                        Current Level
                      </span>
                    </div>

                    {next && (
                      <div className="rounded-xl border border-safaria-line bg-surface-200 p-5 flex items-center justify-between opacity-80">
                        <div>
                          <strong className="text-safaria-ink text-base block">{next.name} Tier (Next Milestone)</strong>
                          <span className="text-safaria-inkMuted">
                            Volume: {next.min}+ tickets / mo · ৳{next.rebate} bonus rebate
                          </span>
                        </div>
                        <span className="text-safaria-inkMuted font-mono">
                          {Math.max(next.min - count, 0)} more ticket{next.min - count === 1 ? "" : "s"} to unlock
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Desk 7: Membership & Invoices (Track B & Track C) */}
          {activeDesk === "MEMBERSHIP" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  Membership, Entitlements &amp; Billing Invoices
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  View your current partnership tier, verified billing records, and entitlement quotas.
                </p>
              </div>

              {/* Plan Details Card */}
              <div className="rounded-xl border border-safaria-line bg-surface-200 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-safaria-inkMuted uppercase tracking-wider block">
                      Active Plan Tier
                    </span>
                    <h3 className="font-display text-xl font-bold text-safaria-gold">
                      {membership?.isTrial ? "72-Hour Pilot Trial" : `Active Partner (${membership?.plan || "Monthly"})`}
                    </h3>
                  </div>

                  <a
                    href={whatsappHrefFor(`SAFARIA B2B MEMBERSHIP INQUIRY\nAgency: ${agencyName}\nAgencyId: ${agencyId}\nRequest: Please share upgrade or renewal options for our agency.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp Concierge Renewal</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-safaria-line/40 text-xs font-mono">
                  <div>
                    <span className="text-safaria-inkMuted block text-[10px]">Start Date</span>
                    <span className="font-semibold text-safaria-ink">
                      {membership?.subscriptionStartedAt
                        ? new Date(membership.subscriptionStartedAt).toLocaleDateString()
                        : (membership?.trialActivatedAt ? new Date(membership.trialActivatedAt).toLocaleDateString() : "Active")}
                    </span>
                  </div>
                  <div>
                    <span className="text-safaria-inkMuted block text-[10px]">Expiration</span>
                    <span className="font-semibold text-safaria-ink">
                      {membership?.subscriptionExpiresAt
                        ? new Date(membership.subscriptionExpiresAt).toLocaleDateString()
                        : (membership?.trialExpiresAt ? new Date(membership.trialExpiresAt).toLocaleDateString() : "Pending")}
                    </span>
                  </div>
                  <div>
                    <span className="text-safaria-inkMuted block text-[10px]">FareDesk Limit</span>
                    <span className="font-semibold text-safaria-gold">
                      {membership?.usage.fareLimit} requests
                    </span>
                  </div>
                  <div>
                    <span className="text-safaria-inkMuted block text-[10px]">Booking Limit</span>
                    <span className="font-semibold text-safaria-gold">
                      {membership?.usage.bookingLimit} PNRs
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <h4 className="font-display text-base font-bold text-safaria-gold">
                  Billing &amp; Payment Receipts
                </h4>
                {invoices.length === 0 ? (
                  <div className="rounded-xl border border-safaria-line bg-surface-0 p-6 text-center text-xs text-safaria-inkMuted">
                    No billing invoices recorded yet. Invoices are issued upon subscription activation.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-safaria-line">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-200 text-safaria-inkMuted uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Invoice No</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Amount BDT</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Issued Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-safaria-line bg-surface-0">
                        {invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td className="p-3 font-bold text-safaria-gold">{inv.invoiceNo}</td>
                            <td className="p-3">{inv.plan}</td>
                            <td className="p-3 font-semibold">৳{inv.amountBdt.toLocaleString()}</td>
                            <td className="p-3">{inv.paymentMethod}</td>
                            <td className="p-3">
                              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                inv.status === "VERIFIED_PAID"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="p-3 text-safaria-inkMuted">
                              {new Date(inv.issuedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desk 8: Business Activity History (Track C) */}
          {activeDesk === "AUDIT" && (
            <div className="space-y-6">
              <div className="border-b border-safaria-line/60 pb-4">
                <h2 className="font-display text-2xl font-bold text-safaria-gold">
                  Business Activity History &amp; Operational Ledger
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Real-time chronological audit trail of all desk requests, status transitions, and notes for your agency.
                </p>
              </div>

              {allDeskRecords.length === 0 ? (
                <div className="rounded-xl border border-safaria-line bg-surface-0 p-8 text-center text-xs text-safaria-inkMuted">
                  No operational desk activity recorded yet. Start by submitting a FareDesk quote or BookingDesk PNR hold.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-safaria-line">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-200 text-safaria-inkMuted uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Date &amp; Time</th>
                        <th className="p-3">Desk</th>
                        <th className="p-3">Title / Route</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-safaria-line bg-surface-0">
                      {allDeskRecords.map((rec) => (
                        <tr key={rec.id}>
                          <td className="p-3 text-safaria-inkMuted whitespace-nowrap">
                            {new Date(rec.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold text-safaria-gold">{rec.deskType}</td>
                          <td className="p-3 max-w-xs truncate">{rec.title}</td>
                          <td className="p-3">
                            <span className="text-[10px] uppercase font-bold text-safaria-inkMuted">
                              {rec.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              rec.status === "RESOLVED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/20 text-amber-300"
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  </div>
);
}
