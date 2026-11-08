"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Plane,
  Building2,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { StoredFlightEnquiry, StoredAgencyApplication } from "@/lib/db/enquiriesRepository";

export default function AdminTriagePage() {
  const [activeTab, setActiveTab] = useState<"ENQUIRIES" | "AGENCIES">("ENQUIRIES");
  const [enquiries, setEnquiries] = useState<StoredFlightEnquiry[]>([]);
  const [agencies, setAgencies] = useState<StoredAgencyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const enqRes = await fetch("/api/admin/enquiries", {
        headers: { "x-safaria-admin-key": "safaria-ops-2026" },
      });
      const enqData = await enqRes.json();
      if (enqData.success) {
        setEnquiries(enqData.enquiries || []);
      }

      const agRes = await fetch("/api/admin/agencies", {
        headers: { "x-safaria-admin-key": "safaria-ops-2026" },
      });
      const agData = await agRes.json();
      if (agData.success) {
        setAgencies(agData.applications || []);
      }
    } catch (e) {
      console.error("Failed to load admin records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    targetStatus: StoredFlightEnquiry["status"]
  ) => {
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-safaria-admin-key": "safaria-ops-2026",
        },
        body: JSON.stringify({ id, status: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh list
        fetchRecords();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter === "ALL") return true;
    return e.status === statusFilter;
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
              Role: Internal Staff / Ops Lead (Authorized)
            </span>
          </div>
        </div>

        <button
          onClick={fetchRecords}
          disabled={loading}
          className="flex items-center gap-1.5 rounded border border-safaria-line bg-surface-200 px-3 py-1.5 text-xs font-semibold text-safaria-ink hover:border-safaria-gold transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-safaria-line/60 pb-3">
          <button
            onClick={() => setActiveTab("ENQUIRIES")}
            className={`flex items-center gap-2 rounded-btn px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "ENQUIRIES"
                ? "bg-safaria-gold text-safaria-onGold shadow-btn"
                : "text-safaria-inkMuted hover:text-safaria-ink bg-surface-100"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>Flight Quotation Requests ({enquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("AGENCIES")}
            className={`flex items-center gap-2 rounded-btn px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "AGENCIES"
                ? "bg-safaria-gold text-safaria-onGold shadow-btn"
                : "text-safaria-inkMuted hover:text-safaria-ink bg-surface-100"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>B2B Agency Intake ({agencies.length})</span>
          </button>
        </div>

        {/* Tab 1: Flight Enquiries Table */}
        {activeTab === "ENQUIRIES" && (
          <div className="space-y-4">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-safaria-inkMuted flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              {["ALL", "NEW", "IN_REVIEW", "QUOTATION_SENT", "BOOKED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-full px-3 py-1 font-semibold transition-all border ${
                    statusFilter === st
                      ? "border-safaria-gold bg-safaria-gold/20 text-safaria-gold"
                      : "border-safaria-line/50 bg-surface-100 text-safaria-inkMuted hover:text-safaria-ink"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* List Cards */}
            {filteredEnquiries.length === 0 ? (
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-8 text-center text-xs text-safaria-inkMuted">
                No flight quotation requests match the current filter.
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
                        <span className="font-mono text-base font-bold text-safaria-gold">
                          {enq.referenceNo}
                        </span>
                        <span className="text-[10px] font-semibold uppercase rounded bg-surface-0 px-2 py-0.5 border border-safaria-line/40 text-safaria-inkMuted">
                          {enq.tripType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-semibold uppercase rounded bg-surface-200 px-2 py-0.5 text-safaria-gold">
                          {enq.cabinClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            enq.status === "NEW"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : enq.status === "IN_REVIEW"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : enq.status === "QUOTATION_SENT"
                              ? "bg-safaria-success/20 text-safaria-success border border-safaria-success/40"
                              : "bg-surface-0 text-safaria-inkMuted"
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                    </div>

                    {/* Flight Legs Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-surface-input p-3 rounded-lg border border-safaria-line/30">
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Passenger</span>
                        <strong className="text-safaria-ink">{enq.leadPassengerName}</strong>
                        <span className="text-safaria-inkFaint block">
                          {enq.passengers.adults} Adt, {enq.passengers.children} Chd,{" "}
                          {enq.passengers.infants} Inf
                        </span>
                      </div>

                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Contact</span>
                        <span className="font-mono text-safaria-ink">
                          {enq.phoneCountryCode} {enq.phoneNumber}
                        </span>
                        {enq.email && (
                          <span className="block text-safaria-inkMuted">{enq.email}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Routing</span>
                        <div className="space-y-0.5 font-mono">
                          {enq.legs.map((leg, i) => (
                            <div key={i} className="text-[11px] text-safaria-gold">
                              Leg {i + 1}: {leg.originIata} ➔ {leg.destinationIata} (
                              {leg.departureDate})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lifecycle Action Buttons */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-safaria-inkFaint text-[10px]">
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

        {/* Tab 2: B2B Agency Intake */}
        {activeTab === "AGENCIES" && (
          <div className="space-y-4">
            {agencies.length === 0 ? (
              <div className="rounded-xl border border-safaria-line bg-surface-100 p-8 text-center text-xs text-safaria-inkMuted">
                No agency applications submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {agencies.map((ag) => (
                  <div
                    key={ag.id}
                    className="rounded-xl border border-safaria-line bg-surface-100 p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-safaria-line/40 pb-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-safaria-gold mr-3">
                          {ag.referenceNo}
                        </span>
                        <strong className="text-base text-safaria-ink">{ag.agencyName}</strong>
                      </div>
                      <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold uppercase">
                        {ag.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-surface-input p-3 rounded-lg border border-safaria-line/30">
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Contact</span>
                        <strong className="text-safaria-ink">{ag.contactPerson}</strong>
                        <span className="text-safaria-inkFaint block">{ag.phone}</span>
                      </div>
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Trade License</span>
                        <span className="font-mono text-safaria-gold">{ag.tradeLicenseNumber || "N/A"}</span>
                        <span className="text-safaria-inkFaint block">City: {ag.city}</span>
                      </div>
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Volume Tier</span>
                        <span className="text-safaria-ink">{ag.monthlyTicketVolume.replace(/_/g, " ")}</span>
                        <span className="text-safaria-inkFaint block">{ag.yearsInBusiness} yrs in business</span>
                      </div>
                      <div>
                        <span className="text-safaria-inkMuted block text-[10px]">Trial Status</span>
                        <span className="text-safaria-inkMuted">Manual audit pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
