"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, Building2, Loader2, MessageSquare } from "lucide-react";
import { SITE_CONFIG } from "@/lib/config/siteConfig";

interface B2BApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "bn" | "en";
}

export function B2BApplicationModal({ isOpen, onClose, lang }: B2BApplicationModalProps) {
  const isBn = lang === "bn";

  const [agencyName, setAgencyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState(2);
  const [monthlyTicketVolume, setMonthlyTicketVolume] = useState<
    "UNDER_20" | "20_TO_50" | "50_TO_100" | "OVER_100"
  >("20_TO_50");
  const [notes, setNotes] = useState("");
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceNo: string;
    whatsAppUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consentAgreed) {
      setErrorMessage(
        isBn
          ? "দয়া করে ট্রেড ভেরিফিকেশন নীতিমালায় সম্মতি প্রদান করুন।"
          : "Please accept the verification terms to proceed."
      );
      return;
    }

    if (!tradeLicenseNumber.trim()) {
      setErrorMessage(
        isBn
          ? "ট্রেড লাইসেন্স বা রেজিষ্ট্রেশন নম্বর আবশ্যক।"
          : "Trade license number is required for B2B verification."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        agencyName,
        contactPerson,
        phone,
        email,
        city,
        tradeLicenseNumber,
        yearsInBusiness: Number(yearsInBusiness),
        monthlyTicketVolume,
        notes,
        consentAgreed: true,
      };

      const res = await fetch("/api/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit agency application");
      }

      setSubmittedData({
        referenceNo: data.referenceNo,
        whatsAppUrl: data.whatsAppUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedData(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-safaria-line bg-surface-100 p-6 sm:p-8 shadow-panel my-8">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-safaria-line text-safaria-inkMuted hover:text-safaria-ink hover:border-safaria-gold transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {submittedData ? (
          <div className="text-center py-6 space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-safaria-success/20 text-safaria-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase font-bold tracking-widest text-safaria-success">
                {isBn ? "আবেদন সফলভাবে গৃহীত হয়েছে" : "Application Received"}
              </span>
              <h3 className="font-display text-2xl font-bold text-safaria-ink">
                {isBn ? "ভেরিফিকেশন পেন্ডিং (Pending Audit)" : "Credential Audit Initiated"}
              </h3>
              <p className="text-xs sm:text-sm text-safaria-inkMuted max-w-md mx-auto">
                {isBn
                  ? "আপনার ট্রেড লাইসেন্স ও এজেন্সির তথ্য পর্যালোচনার পর আমাদের বিটুবি হেল্পডেস্ক থেকে যোগাযোগ করা হবে।"
                  : "Our B2B verification desk will review your trade license credentials before approving trial access."}
              </p>
            </div>

            <div className="rounded-xl border border-safaria-gold/50 bg-surface-input p-3.5 max-w-sm mx-auto">
              <span className="text-xs text-safaria-inkMuted block mb-0.5">
                {isBn ? "আবেদন ট্র্যাকিং রেফারেন্স:" : "Application Tracking Reference:"}
              </span>
              <span className="font-mono text-xl font-bold text-safaria-gold tracking-wider select-all">
                {submittedData.referenceNo}
              </span>
            </div>

            <div className="pt-2 space-y-3">
              <a
                href={submittedData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-btn transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>
                  {isBn ? "হোয়াটসঅ্যাপে স্ট্যাটাস জানুন" : "Follow up with B2B Desk on WhatsApp"}
                </span>
              </a>

              <div>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="text-xs text-safaria-inkMuted hover:text-safaria-gold underline"
                >
                  {isBn ? "উইন্ডো বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-safaria-gold">
                <Building2 className="h-3.5 w-3.5" />
                <span>{isBn ? "ট্রাভেল এজেন্সি অংশীদারিত্ব" : "B2B Agency Intake"}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-safaria-ink">
                {isBn ? "এজেন্সি পার্টনারশিপ ও ট্রায়াল আবেদন" : "Apply for B2B Partner Portal"}
              </h3>
              <p className="text-xs text-safaria-inkMuted">
                {isBn
                  ? "সাফারিয়া হোলসেল ফেয়ার, স্বচ্ছ মার্জিন এবং ডেডিকেটেড অপারেশন সাপোর্ট।"
                  : "Wholesale fares, sub-agent margins, and operational desks for licensed travel agencies."}
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-safaria-danger/60 bg-safaria-danger/10 p-2.5 text-xs text-safaria-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "এজেন্সির নাম" : "Agency Legal Name"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengal Tours & Travels"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "দায়িত্বপ্রাপ্ত ব্যক্তির নাম" : "Contact Person Name"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahbubur Rahman"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "মোবাইল নম্বর" : "Direct Phone / WhatsApp"} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+880 1711 000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "ব্যবসায়িক ইমেইল" : "Agency Business Email"} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="info@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "ট্রেড লাইসেন্স নম্বর" : "Trade License / Reg Number"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="TRAD/DHK/2024/..."
                  value={tradeLicenseNumber}
                  onChange={(e) => setTradeLicenseNumber(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "শহর" : "Operating City"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dhaka, Chittagong, Sylhet..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "ব্যবসায়িক অভিজ্ঞতা" : "Years in Travel Business"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={yearsInBusiness}
                  onChange={(e) => setYearsInBusiness(Number(e.target.value))}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "মাসিক টিকেট ভলিউম" : "Monthly Ticket Volume"}
                </label>
                <select
                  value={monthlyTicketVolume}
                  onChange={(e) => setMonthlyTicketVolume(e.target.value as any)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                >
                  <option value="UNDER_20">&lt; 20 tickets / mo</option>
                  <option value="20_TO_50">20 – 50 tickets / mo</option>
                  <option value="50_TO_100">50 – 100 tickets / mo</option>
                  <option value="OVER_100">100+ tickets / mo</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-safaria-inkMuted block">
                {isBn ? "অতিরিক্ত বিবরণ / চাহিদা (ঐচ্ছিক)" : "Additional Notes / Specific Needs"}
              </label>
              <textarea
                rows={2}
                placeholder={
                  isBn
                    ? "যেমনঃ স্পেশাল উমরাহ গ্রুপ ফেয়ার বা জিডিএস সাব-এজেন্ট লগইন।"
                    : "e.g. Special Umrah group allocations, sub-agent issuance needs..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
              />
            </div>

            {/* Verification Consent */}
            <div className="rounded-lg border border-safaria-line/60 bg-surface-0 p-3 text-xs text-safaria-inkMuted">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-safaria-line bg-surface-input text-safaria-gold focus:ring-safaria-gold"
                />
                <span>
                  {isBn
                    ? "আমি নিশ্চিত করছি যে প্রদত্ত ট্রেড লাইসেন্স ও এজেন্সির তথ্য সঠিক। ৭২-ঘণ্টার পাইলট সুবিধাটি প্রশাসনিক যাচাইকরণের পর সক্রিয় হবে।"
                    : "I certify that all agency trade credentials provided are accurate. Trial access is granted after administrative verification."}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-3 text-sm font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isBn ? "তথ্য যাচাই হচ্ছে..." : "Submitting Application..."}</span>
                </>
              ) : (
                <span>{isBn ? "আবেদন জমা দিন" : "Submit B2B Application"}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
