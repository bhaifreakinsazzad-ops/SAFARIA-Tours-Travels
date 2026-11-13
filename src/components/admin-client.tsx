"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Plane,
  Building2,
  RefreshCw,
  ArrowLeft,
  Filter,
  LogOut,
  CheckCircle2,
  Send,
  Layers,
  Copy,
  Check,
  Play,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Calendar,
  Activity,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { StoredFlightEnquiry, StoredAgencyApplication, AgencyInvoice, StoredB2BDeskRecord } from "@server/db/enquiriesRepository";
import { AGENCY_PRICING } from "@/config/constants";
import { motion } from "motion/react";
import { animate, stagger } from "animejs";

const emptySubscribe = () => () => {};

export default function AdminTriagePage() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const baseTimestamp = useSyncExternalStore(emptySubscribe, () => Date.now(), () => 1762848000000);

  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "ENQUIRIES" | "AGENCIES" | "DESKS" | "OUTBOX">("ANALYTICS");
  const [enquiries, setEnquiries] = useState<StoredFlightEnquiry[]>([]);
  const [agencies, setAgencies] = useState<StoredAgencyApplication[]>([]);
  const [invoices, setInvoices] = useState<AgencyInvoice[]>([]);
  const [deskRecords, setDeskRecords] = useState<StoredB2BDeskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deskFilter, setDeskFilter] = useState<string>("ALL");

  useEffect(() => {
    if (checkingAuth) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = document.querySelectorAll<HTMLElement>(".admin-kpi-card");
    if (cards.length > 0) {
      animate(cards, {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: stagger(45),
        duration: 380,
        ease: "outQuad",
      });
    }
  }, [activeTab, checkingAuth]);

  // 30-Day Analytics Data Processor
  const thirtyDayChartData = useMemo(() => {
    const days: { date: string; displayDate: string; enquiries: number; activations: number }[] = [];
    const now = new Date(baseTimestamp);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const enqCount = enquiries.filter((e) => e.createdAt && e.createdAt.startsWith(dateStr)).length;
      const actCount = agencies.filter((a) => {
        const isActivated = a.status === "ACTIVE_PARTNER" || a.status === "TRIAL_APPROVED";
        if (!isActivated) return false;
        const actDate = (a.subscriptionStartedAt || a.trialActivatedAt || a.updatedAt || a.createdAt || "").slice(0, 10);
        return actDate === dateStr;
      }).length;

      days.push({
        date: dateStr,
        displayDate,
        enquiries: enqCount,
        activations: actCount,
      });
    }

    return days;
  }, [enquiries, agencies, baseTimestamp]);

  // Analytics Summary Metrics
  const analyticsSummary = useMemo(() => {
    const thirtyDaysAgo = new Date(baseTimestamp - 30 * 86400 * 1000);
    const recentEnquiries = enquiries.filter(
      (e) => e.createdAt && new Date(e.createdAt).getTime() >= thirtyDaysAgo.getTime()
    );
    const recentActivations = agencies.filter((a) => {
      const isActivated = a.status === "ACTIVE_PARTNER" || a.status === "TRIAL_APPROVED";
      if (!isActivated) return false;
      const actDate = a.subscriptionStartedAt || a.trialActivatedAt || a.updatedAt || a.createdAt;
      return actDate && new Date(actDate).getTime() >= thirtyDaysAgo.getTime();
    });

    const bookedEnquiries = recentEnquiries.filter((e) => e.status === "BOOKED").length;
    const activePartnersCount = agencies.filter((a) => a.status === "ACTIVE_PARTNER").length;
    const trialPartnersCount = agencies.filter((a) => a.status === "TRIAL_APPROVED").length;
    const totalAgencies = agencies.length;
    const totalActivated = activePartnersCount + trialPartnersCount;
    const conversionRate = totalAgencies > 0 ? ((totalActivated / totalAgencies) * 100).toFixed(1) : "0.0";

    return {
      totalEnquiries: recentEnquiries.length,
      bookedEnquiries,
      totalActivations: recentActivations.length,
      activePartnersCount,
      trialPartnersCount,
      totalAgencies,
      conversionRate,
    };
  }, [enquiries, agencies, baseTimestamp]);

  // Temporary password display after approval
  const [issuedCreds, setIssuedCreds] = useState<{
    agencyName: string;
    email: string;
    password?: string;
    referenceNo: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Outbox trigger state
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const enqRes = await fetch("/api/admin/enquiries", { credentials: "include" });
      if (enqRes.status === 401 || enqRes.status === 403) {
        router.push("/login");
        return;
      }
      const enqData = await enqRes.json();
      if (enqData.success) {
        setEnquiries(enqData.enquiries || []);
      }

      const agRes = await fetch("/api/admin/agencies", { credentials: "include" });
      const agData = await agRes.json();
      if (agData.success) {
        setAgencies(agData.applications || []);
        if (agData.invoices) setInvoices(agData.invoices);
      }

      const deskRes = await fetch("/api/partner/desk", { credentials: "include" });
      const deskData = await deskRes.json();
      if (deskData.success) {
        setDeskRecords(deskData.records || []);
      }
    } catch (e) {
      console.error("Failed to load admin records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await meRes.json();
      if (!meData.authenticated || meData.user?.role !== "SUPER_ADMIN") {
        router.push("/login");
        return;
      }
      setCheckingAuth(false);
      fetchRecords();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  const handleUpdateStatus = async (
    id: string,
    targetStatus: StoredFlightEnquiry["status"]
  ) => {
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRecords();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  // Staff Agency Lifecycle Actions (Directive 005 Track F)
  const handleAgencyAction = async (payload: {
    id: string;
    action?: string;
    status?: string;
    plan?: string;
    amountBdt?: number;
    paymentMethod?: string;
    paymentReference?: string;
    notes?: string;
    whatsappInboundConfirmed?: boolean;
    assignedStaffOwner?: string;
  }) => {
    try {
      const res = await fetch("/api/admin/agencies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (data.issuedPassword && data.agency) {
          setIssuedCreds({
            agencyName: data.agency.agencyName,
            email: data.agency.email,
            password: data.issuedPassword,
            referenceNo: data.agency.referenceNo,
          });
        }
        fetchRecords();
      }
    } catch (e) {
      console.error("Agency action failed:", e);
    }
  };

  // Desk Status Update
  const handleUpdateDeskStatus = async (id: string, status: StoredB2BDeskRecord["status"], notes: string) => {
    try {
      const res = await fetch("/api/partner/desk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status, internalNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRecords();
      }
    } catch (e) {
      console.error("Desk update failed:", e);
    }
  };

  // Manual Trigger for Integration Outbox Dispatcher
  const handleTriggerOutbox = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const res = await fetch("/api/cron/dispatch-outbox", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setDispatchResult(`Outbox Dispatcher Executed: ${data.summary.deliveredCount} delivered, ${data.summary.failedCount} failed (${data.summary.providerMode}).`);
        fetchRecords();
      } else {
        setDispatchResult(`Error: ${data.error}`);
      }
    } catch (e) {
      setDispatchResult(`Failed to run outbox: ${String(e)}`);
    } finally {
      setDispatching(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-surface-0 text-safaria-ink flex items-center justify-center text-sm text-safaria-inkMuted">
        Verifying session…
      </div>
    );
  }

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
  });

  const filteredDeskRecords = deskRecords.filter((d) => {
    if (deskFilter === "ALL") return true;
    return d.deskType === deskFilter;
  });


  return (
    <div className="min-h-screen bg-surface-0 text-safaria-ink">
      {/* Admin Top Navigation */}
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
            <Lock className="h-4 w-4 text-safaria-gold" />
          </div>
          <div>
            <h1 className="font-display text-base sm:text-lg font-bold text-safaria-gold">
              SAFARIA Operations Triage Desk
            </h1>
            <span className="text-[10px] text-safaria-inkMuted font-mono">
              Role: SUPER_ADMIN • Commercial Launch Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-safaria-line bg-surface-200 px-3 py-1.5 text-xs font-semibold text-safaria-ink hover:text-safaria-gold transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-safaria-line bg-surface-200 px-3 py-1.5 text-xs font-semibold text-safaria-ink hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Credentials Issued Modal / Notification */}
        {issuedCreds && (
          <div className="rounded-2xl border border-emerald-500/50 bg-[#06201c] p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="font-display text-lg font-bold text-emerald-300">
                  Partner Credentials Generated for {issuedCreds.agencyName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssuedCreds(null)}
                className="text-xs text-[#a3b8b0] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[#d1dfd9] leading-relaxed">
              <strong>Important Security Notice:</strong> Passwords are shown exactly once to staff for out-of-band relay via WhatsApp or phone. They are stored only as salted cryptographic hashes and cannot be recovered again.
            </p>

            <div className="rounded-xl border border-safaria-gold/40 bg-[#031412] p-4 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#a3b8b0]">Agency Reference:</span>
                <span className="font-bold text-safaria-gold">{issuedCreds.referenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a3b8b0]">Login Email:</span>
                <span className="font-bold text-[#f7f2ea]">{issuedCreds.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a3b8b0]">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 bg-surface-100 px-2 py-0.5 rounded">
                    {issuedCreds.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (issuedCreds.password) {
                        navigator.clipboard?.writeText(issuedCreds.password);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="p-1 rounded bg-surface-200 hover:bg-surface-0 text-safaria-gold"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Tab Selector (Compact Dropdown) */}
        <div className="md:hidden">
          <label htmlFor="admin-mobile-tab-select" className="sr-only">Select Operations Section</label>
          <div className="relative">
            <select
              id="admin-mobile-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as "ANALYTICS" | "ENQUIRIES" | "AGENCIES" | "DESKS" | "OUTBOX")}
              className="w-full appearance-none rounded-xl border border-safaria-gold/40 bg-surface-100 px-4 py-3 text-xs font-bold text-safaria-gold shadow-sm focus:outline-none focus:ring-2 focus:ring-safaria-gold/50 cursor-pointer"
            >
              <option value="ANALYTICS">📊 30-Day Analytics &amp; Activations</option>
              <option value="ENQUIRIES">✈️ Flight Enquiries ({enquiries.length})</option>
              <option value="AGENCIES">🏢 B2B Agencies &amp; Subscriptions ({agencies.length})</option>
              <option value="DESKS">📑 Operational Desks ({deskRecords.length})</option>
              <option value="OUTBOX">📤 CRM Outbox &amp; Sync</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-safaria-gold" />
          </div>
        </div>

        {/* Desktop Tab Selector */}
        <div className="hidden md:flex items-center gap-2 border-b border-safaria-line pb-3 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
              activeTab === "ANALYTICS"
                ? "bg-safaria-gold text-safaria-onGold font-bold shadow-sm"
                : "bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>30-Day Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("ENQUIRIES")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
              activeTab === "ENQUIRIES"
                ? "bg-safaria-gold text-safaria-onGold font-bold shadow-sm"
                : "bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Flight Enquiries ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("AGENCIES")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
              activeTab === "AGENCIES"
                ? "bg-safaria-gold text-safaria-onGold font-bold shadow-sm"
                : "bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>
              B2B Agencies &amp; Subscriptions ({agencies.length})
              <span className="sr-only"> B2B Agency Intake</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("DESKS")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
              activeTab === "DESKS"
                ? "bg-safaria-gold text-safaria-onGold font-bold shadow-sm"
                : "bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Operational Desks ({deskRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("OUTBOX")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
              activeTab === "OUTBOX"
                ? "bg-safaria-gold text-safaria-onGold font-bold shadow-sm"
                : "bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>CRM Outbox &amp; Sync</span>
          </button>
        </div>

        {/* Tab 0: 30-Day Analytics Section */}
        {activeTab === "ANALYTICS" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-safaria-line/60 pb-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-safaria-gold">
                  Commercial &amp; B2B Operational Analytics
                </h2>
                <p className="text-xs text-safaria-inkMuted">
                  Visualizing passenger flight demand and B2B agency activations over the last 30 days.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-safaria-line bg-surface-100 px-3 py-1.5 text-xs text-safaria-gold font-mono">
                <Calendar className="h-3.5 w-3.5" />
                <span>Trailing 30 Days (Rolling Window)</span>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="admin-kpi-card rounded-xl border border-safaria-line bg-surface-100 p-4 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-safaria-inkMuted">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">30d Flight Enquiries</span>
                  <Plane className="h-4 w-4 text-safaria-gold" />
                </div>
                <div className="text-2xl font-display font-bold text-safaria-ink tabular-nums">
                  {analyticsSummary.totalEnquiries}
                </div>
                <div className="text-[10px] text-safaria-inkMuted">
                  {analyticsSummary.bookedEnquiries} confirmed bookings
                </div>
              </div>

              <div className="admin-kpi-card rounded-xl border border-safaria-line bg-surface-100 p-4 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-safaria-inkMuted">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">30d Agency Activations</span>
                  <Award className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-display font-bold text-emerald-300 tabular-nums">
                  {analyticsSummary.totalActivations}
                </div>
                <div className="text-[10px] text-safaria-inkMuted">
                  {analyticsSummary.activePartnersCount} active • {analyticsSummary.trialPartnersCount} 72h pilots
                </div>
              </div>

              <div className="admin-kpi-card rounded-xl border border-safaria-line bg-surface-100 p-4 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-safaria-inkMuted">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">B2B Conversion Rate</span>
                  <TrendingUp className="h-4 w-4 text-safaria-gold" />
                </div>
                <div className="text-2xl font-display font-bold text-safaria-gold tabular-nums">
                  {analyticsSummary.conversionRate}%
                </div>
                <div className="text-[10px] text-safaria-inkMuted">
                  {analyticsSummary.totalAgencies} total registered agencies
                </div>
              </div>

              <div className="admin-kpi-card rounded-xl border border-safaria-line bg-surface-100 p-4 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-safaria-inkMuted">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Operational Desks</span>
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-display font-bold text-safaria-ink tabular-nums">
                  {deskRecords.length}
                </div>
                <div className="text-[10px] text-safaria-inkMuted">
                  Logged cross-desk ledger items
                </div>
              </div>
            </div>

            {/* Recharts Area Chart: 30-Day Trends */}
            <div className="rounded-2xl border border-safaria-line bg-surface-100 p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-safaria-ink">
                    Daily Volume Trends (Last 30 Days)
                  </h3>
                  <p className="text-xs text-safaria-inkMuted">
                    Real-time trajectory of incoming passenger enquiries vs. verified agency activations.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-safaria-gold">
                    <span className="h-2.5 w-2.5 rounded-full bg-safaria-gold" />
                    Flight Enquiries
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    Agency Activations
                  </span>
                </div>
              </div>

              {isMounted && (
                <div className="h-72 sm:h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={thirtyDayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dfc19b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#dfc19b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorActivations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#8ba198"
                        tick={{ fill: "#8ba198", fontSize: 10 }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        stroke="#8ba198"
                        tick={{ fill: "#8ba198", fontSize: 10 }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#06201c",
                          borderColor: "rgba(197, 168, 128, 0.4)",
                          borderRadius: "0.75rem",
                          color: "#e6eae8",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "#e6eae8" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="enquiries"
                        name="Flight Enquiries"
                        stroke="#dfc19b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEnquiries)"
                      />
                      <Area
                        type="monotone"
                        dataKey="activations"
                        name="Agency Activations"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorActivations)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Secondary 2-Card Layout: Status Pipelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Enquiries Pipeline Breakdown */}
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-5 space-y-4">
                <h4 className="font-display text-sm font-bold text-safaria-gold uppercase tracking-wider">
                  Flight Enquiries Status Pipeline
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "New / Pending Triage", count: enquiries.filter((e) => e.status === "NEW").length, color: "bg-blue-500", text: "text-blue-300" },
                    { label: "In Review / Sourcing", count: enquiries.filter((e) => e.status === "IN_REVIEW").length, color: "bg-amber-500", text: "text-amber-300" },
                    { label: "Quotation Sent", count: enquiries.filter((e) => e.status === "QUOTATION_SENT").length, color: "bg-purple-500", text: "text-purple-300" },
                    { label: "Confirmed & Booked", count: enquiries.filter((e) => e.status === "BOOKED").length, color: "bg-emerald-500", text: "text-emerald-300" },
                  ].map((item, idx) => {
                    const pct = enquiries.length > 0 ? (item.count / enquiries.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-safaria-ink">{item.label}</span>
                          <span className={`font-mono font-bold ${item.text}`}>{item.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agency Verification & Lifecycle Funnel */}
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-5 space-y-4">
                <h4 className="font-display text-sm font-bold text-safaria-gold uppercase tracking-wider">
                  B2B Agency Lifecycle Distribution
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Active Partners (Paid Subscriptions)", count: agencies.filter((a) => a.status === "ACTIVE_PARTNER").length, color: "bg-emerald-500", text: "text-emerald-300" },
                    { label: "72-Hour Pilot Trials Approved", count: agencies.filter((a) => a.status === "TRIAL_APPROVED").length, color: "bg-amber-500", text: "text-amber-300" },
                    { label: "Pending Trade Verification", count: agencies.filter((a) => a.status === "PENDING_VERIFICATION" || a.status === "IN_REVIEW").length, color: "bg-blue-500", text: "text-blue-300" },
                    { label: "Suspended / Rejected", count: agencies.filter((a) => a.status === "SUSPENDED" || a.status === "REJECTED").length, color: "bg-red-500", text: "text-red-300" },
                  ].map((item, idx) => {
                    const pct = agencies.length > 0 ? (item.count / agencies.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-safaria-ink">{item.label}</span>
                          <span className={`font-mono font-bold ${item.text}`}>{item.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 1: Flight Enquiries */}
        {activeTab === "ENQUIRIES" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-safaria-inkMuted" />
                <span className="text-safaria-inkMuted">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border border-safaria-line bg-surface-100 px-2 py-1 text-xs text-safaria-ink"
                >
                  <option value="ALL">All Enquiries</option>
                  <option value="NEW">NEW</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                  <option value="BOOKED">BOOKED</option>
                </select>
              </div>
              <span className="text-safaria-inkMuted font-mono">
                Showing {filteredEnquiries.length} of {enquiries.length} records
              </span>
            </div>

            {filteredEnquiries.length === 0 ? (
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-8 text-center text-xs text-safaria-inkMuted">
                No flight enquiries match the current filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="rounded-xl border border-safaria-line bg-surface-100 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-safaria-line/40 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-safaria-gold">
                          {enq.referenceNo}
                        </span>
                        <strong className="text-base text-safaria-ink">{enq.leadPassengerName}</strong>
                        <span className="rounded bg-surface-200 px-2 py-0.5 text-[10px] font-mono text-safaria-inkMuted">
                          {enq.tripType} • {enq.cabinClass}
                        </span>
                      </div>
                      <span className="rounded bg-safaria-gold/20 text-safaria-gold border border-safaria-gold/40 px-2.5 py-0.5 text-xs font-bold uppercase">
                        {enq.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-surface-input p-3 rounded-lg border border-safaria-line/30">
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Contact</span>
                        <span className="font-mono text-safaria-ink">
                          {enq.phoneCountryCode} {enq.phoneNumber}
                        </span>
                        {enq.email && <span className="block text-safaria-inkMuted">{enq.email}</span>}
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-safaria-inkMuted block text-[10px]">Routing</span>
                        <div className="space-y-0.5 font-mono">
                          {enq.legs.map((leg, i) => (
                            <div key={i} className="text-[11px] text-safaria-gold">
                              Leg {i + 1}: {leg.originIata} ➔ {leg.destinationIata} ({leg.departureDate})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-safaria-inkMuted text-[10px]">
                        Received: {new Date(enq.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {enq.status === "NEW" && (
                          <button
                            onClick={() => handleUpdateStatus(enq.id, "IN_REVIEW")}
                            className="rounded border border-blue-500/60 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
                          >
                            Mark In Review
                          </button>
                        )}
                        {enq.status === "IN_REVIEW" && (
                          <button
                            onClick={() => handleUpdateStatus(enq.id, "QUOTATION_SENT")}
                            className="rounded border border-safaria-success/60 bg-safaria-success/10 px-3 py-1 text-xs font-semibold text-safaria-success hover:bg-safaria-success/20"
                          >
                            Mark Quotation Sent
                          </button>
                        )}
                        {enq.status === "QUOTATION_SENT" && (
                          <button
                            onClick={() => handleUpdateStatus(enq.id, "BOOKED")}
                            className="rounded border border-safaria-gold/60 bg-safaria-gold/10 px-3 py-1 text-xs font-semibold text-safaria-gold hover:bg-safaria-gold/20"
                          >
                            Confirm Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: B2B Agencies & Subscriptions */}
        {activeTab === "AGENCIES" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-safaria-inkMuted font-mono">
                {agencies.length} registered agency partners &amp; leads
              </span>
              <span className="text-safaria-inkMuted text-[10px]">
                Directive 005: 72h Trials • Paid Activations • Verified WhatsApp Replies
              </span>
            </div>

            {agencies.length === 0 ? (
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-8 text-center text-xs text-safaria-inkMuted">
                No agency applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {agencies.map((ag) => {
                  const agInvoices = invoices.filter((inv) => inv.agencyId === ag.id);
                  return (
                    <div
                      key={ag.id}
                      className="rounded-2xl border border-safaria-line bg-surface-100 p-6 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-safaria-line/40 pb-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="font-mono text-sm sm:text-base font-extrabold text-safaria-gold">
                            {ag.referenceNo}
                          </span>
                          <strong className="text-sm sm:text-base text-safaria-ink">{ag.agencyName}</strong>
                          <span className="text-xs text-safaria-inkMuted">({ag.city})</span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase border ${
                            ag.status === "ACTIVE_PARTNER"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : (ag.status === "TRIAL_APPROVED"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                  : "bg-surface-200 text-safaria-inkMuted border-safaria-line")
                          }`}>
                            {ag.status}
                          </span>
                          <span className="rounded bg-surface-0 border border-safaria-line px-2 py-0.5 text-[10px] font-mono text-safaria-gold">
                            {ag.plan || "NO_PLAN"}
                          </span>
                        </div>
                      </div>

                      {/* Agency Details Grid - Stacked on Mobile, 2-col on Tablet, 4-col on Desktop */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-surface-input p-4 rounded-xl border border-safaria-line/40 divide-y divide-safaria-line/30 sm:divide-y-0">
                        <div className="pt-3 sm:pt-0 first:pt-0 space-y-1">
                          <span className="text-safaria-inkMuted block text-[10px] uppercase font-semibold tracking-wider">Contact Person</span>
                          <strong className="text-safaria-ink block text-sm">{ag.contactPerson}</strong>
                          <span className="font-mono text-safaria-inkFaint block">{ag.phone}</span>
                          <span className="text-safaria-inkFaint block truncate">{ag.email}</span>
                        </div>

                        <div className="pt-3 sm:pt-0 space-y-1">
                          <span className="text-safaria-inkMuted block text-[10px] uppercase font-semibold tracking-wider">Trade License</span>
                          <span className="font-mono text-safaria-gold block">{ag.tradeLicenseNumber || "VERIFICATION_PENDING"}</span>
                          <span className="text-safaria-inkFaint block">Years in Business: {ag.yearsInBusiness}</span>
                          <span className="text-safaria-inkFaint block">Volume: {ag.monthlyTicketVolume.replace(/_/g, " ")}</span>
                        </div>

                        <div className="pt-3 sm:pt-0 space-y-1">
                          <span className="text-safaria-inkMuted block text-[10px] uppercase font-semibold tracking-wider">Staff &amp; WhatsApp State</span>
                          <span className="text-safaria-ink block">Owner: {ag.assignedStaffOwner || "Unassigned"}</span>
                          <span className={`text-[11px] block font-semibold ${ag.whatsappInboundConfirmed ? "text-emerald-400" : "text-amber-400"}`}>
                            WhatsApp Inbound: {ag.whatsappInboundConfirmed ? "✓ Confirmed Received" : "⏳ Pending Staff Reply"}
                          </span>
                          <span className="text-[10px] text-safaria-inkMuted block">
                            Draft Opened: {ag.whatsappDraftOpened ? "Yes" : "No"}
                          </span>
                        </div>

                        <div className="pt-3 sm:pt-0 space-y-1">
                          <span className="text-safaria-inkMuted block text-[10px] uppercase font-semibold tracking-wider">Subscription Dates</span>
                          <span className="text-safaria-ink block">
                            {ag.trialExpiresAt
                              ? `Trial: Expires ${new Date(ag.trialExpiresAt).toLocaleDateString()}`
                              : (ag.subscriptionExpiresAt ? `Paid until ${new Date(ag.subscriptionExpiresAt).toLocaleDateString()}` : "Not active")}
                          </span>
                          <span className="text-safaria-inkFaint block text-[10px]">
                            Registered: {new Date(ag.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Staff Operational Controls (Directive 005) - Stacked buttons on Mobile */}
                      <div className="pt-3 border-t border-safaria-line/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          {/* 1. Grant 72h Trial */}
                          {ag.status !== "TRIAL_APPROVED" && ag.status !== "ACTIVE_PARTNER" && (
                            <button
                              onClick={() => handleAgencyAction({ id: ag.id, action: "GRANT_TRIAL" })}
                              className="rounded-lg border border-amber-500/60 bg-amber-500/15 px-3 py-2 sm:py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition-colors text-center"
                            >
                              Grant 72h Trial
                            </button>
                          )}

                          {/* 2. Activate Paid Monthly */}
                          <button
                            onClick={() => handleAgencyAction({ id: ag.id, action: "ACTIVATE_SUBSCRIPTION", plan: "MONTHLY" })}
                            className="rounded-lg border border-emerald-500/60 bg-emerald-500/15 px-3 py-2 sm:py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition-colors text-center"
                          >
                            Activate Monthly (৳{AGENCY_PRICING.monthly.toLocaleString()})
                          </button>

                          {/* 3. Activate Paid Annual */}
                          <button
                            onClick={() => handleAgencyAction({ id: ag.id, action: "ACTIVATE_SUBSCRIPTION", plan: "ANNUAL" })}
                            className="rounded-lg border border-safaria-gold/60 bg-safaria-gold/15 px-3 py-2 sm:py-1.5 text-xs font-bold text-safaria-gold hover:bg-safaria-gold/25 transition-colors text-center"
                          >
                            Activate Annual (৳{AGENCY_PRICING.annual.toLocaleString()})
                          </button>

                          {/* 4. Toggle WhatsApp Inbound */}
                          <button
                            onClick={() => handleAgencyAction({
                              id: ag.id,
                              action: "TOGGLE_WHATSAPP_CONFIRMED",
                              whatsappInboundConfirmed: !ag.whatsappInboundConfirmed,
                            })}
                            className="rounded-lg border border-safaria-line bg-surface-200 px-3 py-2 sm:py-1.5 text-xs font-semibold text-safaria-ink hover:text-safaria-gold transition-colors text-center"
                          >
                            {ag.whatsappInboundConfirmed ? "Mark WA Pending" : "Mark WA Confirmed"}
                          </button>
                        </div>

                        {/* Suspension / Notes */}
                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                          {ag.status !== "SUSPENDED" ? (
                            <button
                              onClick={() => {
                                const reason = prompt("Enter suspension reason:");
                                if (reason) {
                                  handleAgencyAction({ id: ag.id, status: "SUSPENDED", notes: `Suspended by staff: ${reason}` });
                                }
                              }}
                              className="w-full sm:w-auto rounded-lg border border-red-500/40 px-3 py-2 sm:py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 text-center"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAgencyAction({ id: ag.id, status: "IN_REVIEW", notes: "Reinstated to review" })}
                              className="w-full sm:w-auto rounded-lg border border-safaria-line px-3 py-2 sm:py-1.5 text-xs font-semibold text-safaria-ink hover:text-safaria-gold text-center"
                            >
                              Reinstate
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Invoices linked to this agency */}
                      {agInvoices.length > 0 && (
                        <div className="pt-2 border-t border-safaria-line/30 space-y-1.5 text-[11px] font-mono">
                          <span className="text-[10px] text-safaria-inkMuted uppercase">Invoices:</span>
                          <div className="space-y-1">
                            {agInvoices.map((inv) => (
                              <div key={inv.id} className="flex items-center justify-between rounded bg-surface-0 px-2.5 py-1 border border-safaria-line/40">
                                <span>{inv.invoiceNo} • {inv.plan} (৳{inv.amountBdt.toLocaleString()})</span>
                                <span className={`font-bold ${inv.status === "VERIFIED_PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                                  {inv.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Operational Desks Activity */}
        {activeTab === "DESKS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-safaria-inkMuted" />
                <span className="text-safaria-inkMuted">Filter Desk:</span>
                <select
                  value={deskFilter}
                  onChange={(e) => setDeskFilter(e.target.value)}
                  className="rounded border border-safaria-line bg-surface-100 px-2 py-1 text-xs text-safaria-ink"
                >
                  <option value="ALL">All 6 Desks</option>
                  <option value="FARE_DESK">FareDesk™</option>
                  <option value="BOOKING_DESK">BookingDesk™</option>
                  <option value="CLEAR_MARGIN">ClearMargin™</option>
                  <option value="AFTER_CARE">AfterCare Desk™</option>
                  <option value="VERIFIED_WORKFLOW">Verified Workflow™</option>
                  <option value="PARTNER_GROWTH">PartnerGrowth™</option>
                </select>
              </div>
              <span className="text-safaria-inkMuted font-mono">
                {filteredDeskRecords.length} desk requests
              </span>
            </div>

            {filteredDeskRecords.length === 0 ? (
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-8 text-center text-xs text-safaria-inkMuted">
                No desk records found for this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDeskRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-safaria-line bg-surface-100 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-safaria-line/40 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-safaria-gold bg-surface-0 px-2 py-0.5 rounded border border-safaria-line/40">
                          {rec.deskType}
                        </span>
                        <strong className="text-sm text-safaria-ink">{rec.title}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-safaria-inkMuted">
                          Priority: {rec.priority}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                          rec.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-safaria-inkMuted bg-surface-input p-3 rounded-lg border border-safaria-line/30">
                      <div>Agency ID: {rec.agencyId}</div>
                      <div>Created: {new Date(rec.createdAt).toLocaleString()}</div>
                      {rec.internalNotes && (
                        <div className="text-safaria-gold mt-1">Notes: {rec.internalNotes}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] text-safaria-inkMuted font-mono">ID: {rec.id}</span>
                      <div className="flex items-center gap-2">
                        {rec.status !== "RESOLVED" && (
                          <button
                            onClick={() => {
                              const note = prompt("Enter resolution notes:") || "Resolved by operations staff";
                              handleUpdateDeskStatus(rec.id, "RESOLVED", note);
                            }}
                            className="rounded border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {rec.status !== "CLOSED" && (
                          <button
                            onClick={() => handleUpdateDeskStatus(rec.id, "CLOSED", "Ticket closed")}
                            className="rounded border border-safaria-line bg-surface-200 px-3 py-1 text-xs font-semibold text-safaria-ink hover:text-safaria-gold"
                          >
                            Close Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: CRM Outbox & Sync */}
        {activeTab === "OUTBOX" && (
          <div className="rounded-2xl border border-safaria-line bg-surface-100 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-safaria-line/40 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-safaria-gold">
                  Integration Outbox &amp; GoHighLevel (GHL) CRM Dispatcher
                </h3>
                <p className="text-xs text-safaria-inkMuted">
                  Durable queue worker executing CRM contact synchronization and lead opportunity tracking.
                </p>
              </div>

              <button
                onClick={handleTriggerOutbox}
                disabled={dispatching}
                className="inline-flex items-center gap-2 rounded-xl bg-safaria-gold px-4 py-2 text-xs font-bold text-safaria-onGold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{dispatching ? "Processing Queue…" : "Dispatch Outbox Now"}</span>
              </button>
            </div>

            {dispatchResult && (
              <div className="rounded-xl border border-safaria-gold/40 bg-surface-0 p-4 text-xs font-mono text-safaria-gold">
                {dispatchResult}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <strong className="text-safaria-ink font-semibold block">
                Outbox Operational Architecture (Directive 005 Track D):
              </strong>
              <ul className="space-y-1.5 text-safaria-inkMuted">
                <li>• <strong>Idempotent Delivery:</strong> Every lead and enquiry is assigned a stable idempotency key preventing duplicate CRM opportunities.</li>
                <li>• <strong>Worker Leases:</strong> Background cron locks entries to avoid concurrent duplicate processing.</li>
                <li>• <strong>Honest Status Reporting:</strong> In production without credentials, outbox remains safely pending or queued rather than falsely reporting delivery.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
