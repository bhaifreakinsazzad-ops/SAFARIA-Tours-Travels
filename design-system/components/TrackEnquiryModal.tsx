"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plane,
  Building2,
  FileCheck,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface TrackEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "bn" | "en";
  initialReference?: string;
}

export function TrackEnquiryModal({
  isOpen,
  onClose,
  lang = "bn",
  initialReference = "",
}: TrackEnquiryModalProps) {
  const isBn = lang === "bn";
  const [referenceInput, setReferenceInput] = useState(initialReference);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<any | null>(null);
  const [recordType, setRecordType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialReference) {
      setReferenceInput(initialReference);
      handleSearch(initialReference);
    }
  }, [initialReference, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSearch(refToSearch?: string) {
    const code = (refToSearch || referenceInput).trim();
    if (!code) {
      setError(isBn ? "অনুগ্রহ করে একটি বৈধ রেফারেন্স কোড প্রদান করুন।" : "Please enter a valid reference tracking code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecordData(null);
    setRecordType(null);

    try {
      const res = await fetch(`/api/enquiries?ref=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || (isBn ? "প্রদত্ত রেফারেন্সের জন্য কোনো রেকর্ড পাওয়া যায়নি।" : "No record found for this reference code."));
        return;
      }

      setRecordType(data.type);
      setRecordData(data.record);
    } catch (err: any) {
      setError(isBn ? "সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে। পরে চেষ্টা করুন।" : "Failed to connect to tracking server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return {
          label: isBn ? "অনুরোধ গৃহীত — পর্যালোচনায়" : "Received — Under Triage",
          color: "bg-safaria-gold/20 text-safaria-gold border-safaria-gold/40",
          icon: Clock,
        };
      case "IN_REVIEW":
        return {
          label: isBn ? "স্পেশালিস্ট পর্যালোচনায় রয়েছে" : "Inventory Review in Progress",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          icon: Clock,
        };
      case "QUOTATION_SENT":
        return {
          label: isBn ? "কোটেশন প্রেরিত হয়েছে" : "Quotation Sent to Customer",
          color: "bg-safaria-success/20 text-safaria-success border-safaria-success/40",
          icon: CheckCircle2,
        };
      case "PENDING_VERIFICATION":
        return {
          label: isBn ? "লাইসেন্স যাচাইকরণ অপেক্ষমাণ" : "Verification Pending",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: ShieldAlert,
        };
      case "TRIAL_APPROVED":
        return {
          label: isBn ? "৭২ ঘণ্টা পাইলট ট্রায়াল সক্রিয়" : "72-Hr Trial Active",
          color: "bg-safaria-success/20 text-safaria-success border-safaria-success/40",
          icon: CheckCircle2,
        };
      case "ACTIVE_PARTNER":
        return {
          label: isBn ? "অনুমোদিত বিটুবি পার্টনার" : "Active Accredited Partner",
          color: "bg-safaria-emerald/40 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          color: "bg-surface-200 text-safaria-inkMuted border-safaria-line",
          icon: Clock,
        };
    }
  };

  const statusInfo = recordData ? getStatusBadge(recordData.status) : null;
  const StatusIcon = statusInfo ? statusInfo.icon : Clock;

  const whatsAppUrl = recordData
    ? `https://wa.me/${SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello SAFARIA Support, I am tracking my reference: ${recordData.referenceNo}. Please assist with my quotation status.`
      )}`
    : `https://wa.me/${SITE_CONFIG.contact.whatsAppDirect.replace(/[^0-9]/g, "")}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="track-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-100 border border-safaria-line p-6 sm:p-8 shadow-card text-safaria-ink my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-safaria-inkMuted hover:text-safaria-ink p-1 rounded-md border border-safaria-line/40 hover:border-safaria-line"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-safaria-emerald/30 border border-safaria-gold/40 text-safaria-gold">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 id="track-modal-title" className="text-xl font-display font-bold text-safaria-gold">
              {isBn ? "কোটেশন ও আবেদন ট্র্যাকিং" : "Track Quotation & Application"}
            </h3>
            <p className="text-xs text-safaria-inkMuted">
              {isBn
                ? "আপনার রেফারেন্স নম্বর দিয়ে রিয়েল-টাইম স্ট্যাটাস যাচাই করুন"
                : "Check verified live status with your reference code"}
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3 mb-6"
        >
          <div className="relative">
            <input
              type="text"
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
              placeholder={isBn ? "যেমন: SFR-20261108-XXXXXX বা B2B-..." : "e.g. SFR-20261108-XXXXXX or B2B-..."}
              className="w-full rounded-input border border-safaria-line bg-surface-0 px-4 py-3 text-sm font-mono tracking-wider text-safaria-ink placeholder-safaria-inkFaint focus:border-safaria-gold focus:outline-none focus:ring-1 focus:ring-safaria-gold"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !referenceInput.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-3 text-sm font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-safaria-onGold border-t-transparent" />
                {isBn ? "যাচাই করা হচ্ছে..." : "Verifying..."}
              </span>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>{isBn ? "স্ট্যাটাস দেখুন" : "Check Live Status"}</span>
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-950/20 p-3.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">{isBn ? "অনুসন্ধান ব্যর্থ হয়েছে" : "Lookup Failed"}</p>
              <p className="mt-0.5 text-red-400/90">{error}</p>
            </div>
          </div>
        )}

        {/* Record Results Card */}
        {recordData && statusInfo && (
          <div className="space-y-5 rounded-xl border border-safaria-line bg-surface-0/60 p-5">
            {/* Top Bar: Reference + Type + Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-safaria-line/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-safaria-gold select-all">
                    {recordData.referenceNo}
                  </span>
                  <button
                    onClick={() => handleCopy(recordData.referenceNo)}
                    className="text-safaria-inkMuted hover:text-safaria-gold p-1"
                    title="Copy reference code"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-safaria-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-safaria-inkMuted mt-0.5">
                  {recordType === "FLIGHT" && (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Plane className="h-3 w-3" />
                      {isBn ? "ফ্লাইট কোটেশন অনুরোধ" : "Flight Quotation Request"}
                    </span>
                  )}
                  {recordType === "B2B_AGENCY" && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <Building2 className="h-3 w-3" />
                      {isBn ? "বিটুবি এজেন্সি আবেদন" : "B2B Agency Partnership Application"}
                    </span>
                  )}
                  {recordType === "GENERAL" && (
                    <span className="inline-flex items-center gap-1 text-blue-400">
                      <FileCheck className="h-3 w-3" />
                      {isBn ? "সেবা সংক্রান্ত অনুসন্ধান" : "General Service Enquiry"}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.color}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            {/* Flight Enquiry Specific Details */}
            {recordType === "FLIGHT" && recordData.legs && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-safaria-ink uppercase tracking-wider">
                  {isBn ? "ফ্লাইট রুট বিবরণ" : "Flight Route & Details"}
                </div>
                <div className="space-y-2">
                  {recordData.legs.map((leg: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-safaria-line/40 bg-surface-100 px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-safaria-gold">{leg.originIata}</span>
                        <span className="text-safaria-inkFaint">➔</span>
                        <span className="font-mono font-bold text-safaria-gold">{leg.destinationIata}</span>
                        <span className="text-[11px] text-safaria-inkMuted hidden sm:inline">
                          ({leg.originCity} to {leg.destinationCity})
                        </span>
                      </div>
                      <span className="text-safaria-inkMuted font-mono">{leg.departureDate}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded border border-safaria-line/30 bg-surface-100 p-2">
                    <span className="text-[10px] text-safaria-inkMuted block">{isBn ? "কেবিন ক্লাস" : "Cabin Class"}</span>
                    <span className="font-semibold text-safaria-ink">{recordData.cabinClass}</span>
                  </div>
                  <div className="rounded border border-safaria-line/30 bg-surface-100 p-2">
                    <span className="text-[10px] text-safaria-inkMuted block">{isBn ? "যাত্রী সংখ্যা" : "Passengers"}</span>
                    <span className="font-semibold text-safaria-ink">
                      {recordData.passengers?.adults || 1} {isBn ? "প্রাপ্তবয়স্ক" : "Adults"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* B2B Agency Specific Details */}
            {recordType === "B2B_AGENCY" && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                  <span className="text-safaria-inkMuted">{isBn ? "এজেন্সির নাম:" : "Agency Name:"}</span>
                  <span className="font-semibold text-safaria-ink">{recordData.agencyName}</span>
                </div>
                <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                  <span className="text-safaria-inkMuted">{isBn ? "শহর:" : "City:"}</span>
                  <span className="text-safaria-ink">{recordData.city}</span>
                </div>
                <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                  <span className="text-safaria-inkMuted">{isBn ? "মাসিক টিকিট ভলিউম:" : "Volume:"}</span>
                  <span className="text-safaria-ink">{recordData.monthlyTicketVolume || "N/A"}</span>
                </div>
                {recordData.trialExpiresAt && (
                  <div className="flex justify-between border-b border-safaria-line/30 py-1.5 text-amber-300">
                    <span>{isBn ? "ট্রায়াল মেয়াদ শেষ:" : "Trial Expires:"}</span>
                    <span className="font-mono">{new Date(recordData.trialExpiresAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* General Enquiry Specific Details */}
            {recordType === "GENERAL" && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                  <span className="text-safaria-inkMuted">{isBn ? "সেবার ধরন:" : "Service Type:"}</span>
                  <span className="font-semibold text-safaria-gold">{recordData.serviceType}</span>
                </div>
                {recordData.destinationOrCountry && (
                  <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                    <span className="text-safaria-inkMuted">{isBn ? "গন্তব্য / দেশ:" : "Destination:"}</span>
                    <span className="text-safaria-ink">{recordData.destinationOrCountry}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-safaria-line/30 py-1.5">
                  <span className="text-safaria-inkMuted">{isBn ? "যাত্রী সংখ্যা:" : "Pax Count:"}</span>
                  <span className="text-safaria-ink">{recordData.passengerOrPaxCount}</span>
                </div>
              </div>
            )}

            {/* Masked PII details */}
            <div className="text-[11px] text-safaria-inkMuted flex items-center justify-between pt-1 border-t border-safaria-line/30">
              <span>{isBn ? "নিরাপদ যোগাযোগ:" : "Contact (Masked):"} {recordData.maskedPhone}</span>
              <span>{new Date(recordData.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Honest Compliance Notice */}
            <div className="rounded-lg border border-safaria-line/60 bg-surface-100 p-3 text-[11px] text-safaria-inkMuted leading-relaxed">
              <span className="font-semibold text-safaria-gold block mb-0.5">
                {isBn ? "সতর্কবার্তা ও নিশ্চয়তা" : "Official Tracking Disclaimer"}
              </span>
              {isBn
                ? "এটি সাফারিয়া ট্র্যাকিং প্রাপ্তি রশিদ। এটি কনফার্মড টিকিট, বুকিং বা পিএনআর (PNR) নয়। আমাদের ট্রাভেল স্পেশালিস্ট এয়ারলাইন্স ইনভেন্টরি যাচাই করে আপনাকে চূড়ান্ত কোটেশন জানাবেন।"
                : "This is a verification tracking receipt. It is NOT a confirmed booking, ticket, or PNR. A certified travel specialist verifies carrier seat inventory before issuing firm quotations."}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-btn bg-safaria-success px-4 py-2.5 text-xs font-bold text-safaria-base hover:opacity-95 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{isBn ? "হোয়াটসঅ্যাপে সহায়তা নিন" : "Chat on WhatsApp with Reference"}</span>
              </a>
              <button
                onClick={onClose}
                className="rounded-btn border border-safaria-line px-4 py-2.5 text-xs font-semibold text-safaria-ink hover:bg-surface-200 transition-all"
              >
                {isBn ? "বন্ধ করুন" : "Close"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
