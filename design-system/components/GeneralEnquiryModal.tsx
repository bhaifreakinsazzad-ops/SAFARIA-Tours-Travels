"use client";

import React, { useState } from "react";
import { X, CheckCircle2, AlertCircle, MessageSquare, Loader2, Send } from "lucide-react";
import { ServiceItem } from "@/lib/config/siteConfig";

interface GeneralEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  lang: "bn" | "en";
}

export function GeneralEnquiryModal({
  isOpen,
  onClose,
  service,
  lang,
}: GeneralEnquiryModalProps) {
  const isBn = lang === "bn";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [destinationOrCountry, setDestinationOrCountry] = useState("");
  const [passengerOrPaxCount, setPassengerOrPaxCount] = useState(1);
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceNo: string;
    whatsAppUrl: string;
  } | null>(null);

  if (!isOpen || !service) return null;

  // Map service ID to schema enum
  const serviceTypeMap: Record<string, "VISA" | "CORPORATE" | "HOLIDAY" | "HOTEL" | "UMRAH" | "CUSTOM"> = {
    "visa-processing": "VISA",
    "corporate-travel": "CORPORATE",
    "umrah-hajj": "UMRAH",
    "holiday-packages": "HOLIDAY",
    "hotel-reservations": "HOTEL",
  };

  const serviceType = serviceTypeMap[service.id] || "CUSTOM";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        serviceType,
        fullName,
        phone,
        email: email || undefined,
        message,
        destinationOrCountry,
        passengerOrPaxCount: Number(passengerOrPaxCount),
      };

      const res = await fetch("/api/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSubmittedData({
        referenceNo: data.referenceNo,
        whatsAppUrl: data.whatsAppUrl,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
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
      <div className="relative w-full max-w-lg rounded-2xl border border-safaria-line bg-surface-100 p-6 sm:p-8 shadow-panel my-8">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-safaria-line text-safaria-inkMuted hover:text-safaria-ink"
        >
          <X className="h-4 w-4" />
        </button>

        {submittedData ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-safaria-success/20 text-safaria-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="font-display text-2xl font-bold text-safaria-ink">
              {isBn ? "অনুরোধ সফলভাবে গৃহীত হয়েছে" : "Request Received"}
            </h3>

            <div className="rounded-xl border border-safaria-gold/50 bg-surface-input p-3 max-w-sm mx-auto">
              <span className="text-xs text-safaria-inkMuted block mb-0.5">Reference Tracking Code:</span>
              <span className="font-mono text-xl font-bold text-safaria-gold tracking-wider select-all">
                {submittedData.referenceNo}
              </span>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={submittedData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-btn"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Follow Up on WhatsApp</span>
              </a>
              <div>
                <button onClick={handleResetAndClose} className="text-xs text-safaria-inkMuted hover:underline">
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-safaria-gold">
                {isBn ? "সেবা অনুসন্ধান" : "Service Inquiry"}
              </span>
              <h3 className="font-display text-2xl font-bold text-safaria-ink">
                {isBn ? service.titleBn : service.titleEn}
              </h3>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-safaria-danger/60 bg-safaria-danger/10 p-2 text-xs text-safaria-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs text-safaria-inkMuted block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-safaria-inkMuted block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+8801711000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-safaria-inkMuted block mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-safaria-inkMuted block mb-1">Destination / Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Saudi Arabia, UK, Thailand"
                    value={destinationOrCountry}
                    onChange={(e) => setDestinationOrCountry(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-safaria-inkMuted block mb-1">Number of Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passengerOrPaxCount}
                    onChange={(e) => setPassengerOrPaxCount(Number(e.target.value))}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-safaria-inkMuted block mb-1">Your Requirements / Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us your travel dates, visa type, or corporate team requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-3 text-xs font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
