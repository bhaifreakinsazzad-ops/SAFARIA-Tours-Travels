"use client";

import React, { useState } from "react";
import {
  Plane,
  Calendar,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Search,
} from "lucide-react";
import { SITE_CONFIG, Airport } from "@/lib/config/siteConfig";
import { TrackEnquiryModal } from "@/components/TrackEnquiryModal";

interface FlightLegState {
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  departureDate: string;
}

interface FlightEnquiryFormProps {
  lang: "bn" | "en";
  initialOrigin?: string;
  initialDestination?: string;
}

export function FlightEnquiryForm({
  lang,
  initialOrigin = "DAC",
  initialDestination = "DXB",
}: FlightEnquiryFormProps) {
  const isBn = lang === "bn";
  const todayStr = new Date().toISOString().split("T")[0];

  // Default dates: departure tomorrow, return in 7 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const returnDateDefault = new Date();
  returnDateDefault.setDate(returnDateDefault.getDate() + 8);
  const returnDateDefaultStr = returnDateDefault.toISOString().split("T")[0];

  // State
  const [tripType, setTripType] = useState<"ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY">("ROUND_TRIP");

  const [legs, setLegs] = useState<FlightLegState[]>([
    {
      originIata: initialOrigin,
      originCity: SITE_CONFIG.airports.find((a) => a.iata === initialOrigin)?.cityEn || "Dhaka",
      destinationIata: initialDestination,
      destinationCity:
        SITE_CONFIG.airports.find((a) => a.iata === initialDestination)?.cityEn || "Dubai",
      departureDate: tomorrowStr,
    },
    {
      originIata: initialDestination,
      originCity:
        SITE_CONFIG.airports.find((a) => a.iata === initialDestination)?.cityEn || "Dubai",
      destinationIata: initialOrigin,
      destinationCity: SITE_CONFIG.airports.find((a) => a.iata === initialOrigin)?.cityEn || "Dhaka",
      departureDate: returnDateDefaultStr,
    },
  ]);

  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [cabinClass, setCabinClass] = useState<"ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST">(
    "ECONOMY"
  );
  const [preferredCarrier, setPreferredCarrier] = useState<string>("");

  const [leadPassengerName, setLeadPassengerName] = useState<string>("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>("+880");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [specialNotes, setSpecialNotes] = useState<string>("");
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);

  // Form Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    referenceNo: string;
    whatsAppUrl: string;
    enquiry: any;
  } | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false);

  // Handle Trip Type change
  const handleTripTypeChange = (type: "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY") => {
    setTripType(type);
    if (type === "ONE_WAY") {
      setLegs([legs[0]]);
    } else if (type === "ROUND_TRIP") {
      setLegs([
        legs[0],
        {
          originIata: legs[0].destinationIata,
          originCity: legs[0].destinationCity,
          destinationIata: legs[0].originIata,
          destinationCity: legs[0].originCity,
          departureDate: returnDateDefaultStr,
        },
      ]);
    } else if (type === "MULTI_CITY" && legs.length < 2) {
      setLegs([
        legs[0],
        {
          originIata: legs[0].destinationIata,
          originCity: legs[0].destinationCity,
          destinationIata: "BKK",
          destinationCity: "Bangkok",
          departureDate: returnDateDefaultStr,
        },
      ]);
    }
  };

  // Add Leg for Multi-City
  const handleAddLeg = () => {
    if (legs.length >= 6) return;
    const lastLeg = legs[legs.length - 1];
    const nextDate = new Date(lastLeg.departureDate);
    nextDate.setDate(nextDate.getDate() + 3);

    setLegs([
      ...legs,
      {
        originIata: lastLeg.destinationIata,
        originCity: lastLeg.destinationCity,
        destinationIata: "SIN",
        destinationCity: "Singapore",
        departureDate: nextDate.toISOString().split("T")[0],
      },
    ]);
  };

  // Remove Leg for Multi-City
  const handleRemoveLeg = (index: number) => {
    if (legs.length <= 2) return;
    const updated = legs.filter((_, i) => i !== index);
    setLegs(updated);
  };

  // Update Leg field
  const handleLegChange = (index: number, field: keyof FlightLegState, value: string) => {
    const updated = [...legs];
    if (field === "originIata") {
      const airport = SITE_CONFIG.airports.find((a) => a.iata === value);
      updated[index].originIata = value;
      updated[index].originCity = airport?.cityEn || "";
      // If round trip, sync return leg destination
      if (tripType === "ROUND_TRIP" && index === 0 && updated[1]) {
        updated[1].destinationIata = value;
        updated[1].destinationCity = airport?.cityEn || "";
      }
    } else if (field === "destinationIata") {
      const airport = SITE_CONFIG.airports.find((a) => a.iata === value);
      updated[index].destinationIata = value;
      updated[index].destinationCity = airport?.cityEn || "";
      // If round trip, sync return leg origin
      if (tripType === "ROUND_TRIP" && index === 0 && updated[1]) {
        updated[1].originIata = value;
        updated[1].originCity = airport?.cityEn || "";
      }
    } else {
      updated[index][field] = value;
    }
    setLegs(updated);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!consentAgreed) {
      setErrorMessage(
        isBn
          ? "দয়া করে কোটেশন নীতিমালার সাথে সম্মতি প্রদান করুন।"
          : "Please agree to the quotation policy terms to proceed."
      );
      return;
    }

    if (!leadPassengerName.trim()) {
      setErrorMessage(
        isBn
          ? "প্রধান যাত্রীর পুরো নাম লিখুন।"
          : "Please enter the lead passenger's full legal name."
      );
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage(
        isBn ? "সঠিক মোবাইল নম্বর প্রদান করুন।" : "Please provide a valid phone number."
      );
      return;
    }

    // Lap infant rule check
    if (infants > adults) {
      setErrorMessage(
        isBn
          ? "প্রতি প্রাপ্তবয়স্ক যাত্রীর সাথে সর্বোচ্চ ১ জন কোলে ভ্রমণকারী শিশু (ইনফ্যান্ট) অনুমোদিত।"
          : "Infants cannot exceed the number of adult passengers (1 lap infant per adult)."
      );
      return;
    }

    // Origin != destination check
    for (let i = 0; i < legs.length; i++) {
      if (legs[i].originIata === legs[i].destinationIata) {
        setErrorMessage(
          isBn
            ? `ফ্লাইট লেগ ${i + 1}-এ শুরুর বিমানবন্দর ও গন্তব্য একই হতে পারে না।`
            : `Flight Leg ${i + 1} cannot have the same origin and destination.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        tripType,
        legs,
        cabinClass,
        passengers: { adults, children, infants },
        preferredCarrier,
        leadPassengerName,
        phoneCountryCode,
        phoneNumber,
        email: email || undefined,
        specialNotes,
        consentAgreed: true,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit quotation request");
      }

      setSubmittedData({
        referenceNo: data.referenceNo,
        whatsAppUrl: data.whatsAppUrl,
        enquiry: data.enquiry,
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(
        err.message || "An unexpected error occurred. Please verify your details and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="flight-quote" className="bg-surface-0 py-16 sm:py-24 border-b border-safaria-line">
      <div className="mx-auto max-w-wrap px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-safaria-gold">
            <Plane className="h-4 w-4" />
            <span>{isBn ? "বিমান টিকিট কোটেশন ডেস্ক" : "Flight Quotation Desk"}</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-safaria-ink">
            {isBn ? "ফ্লাইট কোটেশন অনুসন্ধান" : "Request a Flight Quotation"}
          </h2>
          <p className="text-sm sm:text-base text-safaria-inkMuted">
            {isBn
              ? "ওয়ান-ওয়ে, রাউন্ড-ট্রিপ বা মাল্টি-সিটি ভ্রমণ। তথ্য জমা দিন, আমাদের বিশেষজ্ঞ দল যাচাইকৃত কোটেশন পাঠাবে।"
              : "One-Way, Round-Trip, or dynamic Multi-City itineraries. Submit details to receive verified airline fares."}
          </p>
        </div>

        {/* If successfully submitted: Render Confirmation Banner */}
        {submittedData ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-safaria-success/60 bg-surface-100 p-8 shadow-panel text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-safaria-success/20 text-safaria-success">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-safaria-success">
                {isBn ? "কোটেশন অনুরোধ গৃহীত হয়েছে" : "Quotation Request Received"}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-safaria-ink">
                {isBn ? "অনুসন্ধান সফলভাবে সংরক্ষিত" : "Your Request is Server-Persisted"}
              </h3>
              <p className="text-sm text-safaria-inkMuted max-w-md mx-auto">
                {isBn
                  ? "সাফারিয়া ফ্লাইট অপারেশন্স টিম আপনার রুট ও সিট রুলস যাচাই করে দ্রুত সেরা ভাড়ার প্রস্তাবনা জানাবে।"
                  : "A SAFARIA air ticketing specialist will inspect live GDS seat availability and prepare your quotation."}
              </p>
            </div>

            {/* Reference Badge */}
            <div className="rounded-xl border border-safaria-gold/50 bg-surface-input p-4 max-w-md mx-auto">
              <span className="text-xs text-safaria-inkMuted block mb-1">
                {isBn ? "আপনার অফিসিয়াল রেফারেন্স নম্বর:" : "Official Reference Tracking Code:"}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-safaria-gold tracking-wider select-all">
                {submittedData.referenceNo}
              </span>
            </div>

            {/* Direct WhatsApp CTA & View Live Status */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={submittedData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-btn transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>
                  {isBn ? "হোয়াটসঅ্যাপে তাৎক্ষণিক ফলো-আপ করুন" : "Chat on WhatsApp with Reference"}
                </span>
              </a>

              <button
                type="button"
                onClick={() => setTrackingModalOpen(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-btn border border-safaria-gold/60 bg-surface-100 hover:bg-safaria-emerald/20 px-6 py-3.5 text-sm font-bold text-safaria-gold transition-all"
              >
                <Search className="h-4 w-4" />
                <span>{isBn ? "লাইভ স্ট্যাটাস দেখুন" : "View Live Status"}</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                className="text-xs text-safaria-inkMuted hover:text-safaria-gold underline"
              >
                {isBn ? "আরেকটি ফ্লাইট কোটেশন চান?" : "Submit another flight quotation"}
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Form Shell */
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto rounded-2xl border border-safaria-line bg-surface-100 p-6 sm:p-8 shadow-panel space-y-8"
          >
            {/* Trip Type Segmented Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-safaria-line/60 pb-5">
              {(
                [
                  { id: "ROUND_TRIP", labelBn: "রাউন্ড ট্রিপ (যাওয়া-আসা)", labelEn: "Round-Trip" },
                  { id: "ONE_WAY", labelBn: "ওয়ান ওয়ে (একমুখী)", labelEn: "One-Way" },
                  { id: "MULTI_CITY", labelBn: "মাল্টি-সিটি (বহুধাপ)", labelEn: "Multi-City" },
                ] as const
              ).map((type) => {
                const isActive = tripType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTripTypeChange(type.id)}
                    className={`rounded-btn px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border ${
                      isActive
                        ? "border-safaria-gold bg-safaria-gold text-safaria-onGold shadow-btn"
                        : "border-safaria-line/60 bg-surface-200/50 text-safaria-inkMuted hover:text-safaria-ink hover:border-safaria-gold/40"
                    }`}
                  >
                    {isBn ? type.labelBn : type.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Flight Legs Section (Supports 1-6 legs) */}
            <div className="space-y-4">
              {legs.map((leg, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-safaria-line/60 bg-surface-input p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-safaria-gold">
                      {isBn ? `ফ্লাইট লেগ ${index + 1}` : `Flight Leg ${index + 1}`}
                      {tripType === "ROUND_TRIP" && (index === 0 ? " (Outbound)" : " (Return)")}
                    </span>

                    {tripType === "MULTI_CITY" && legs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLeg(index)}
                        className="flex items-center gap-1 text-xs text-safaria-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isBn ? "লেগ মুছুন" : "Remove"}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Origin */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs text-safaria-inkMuted block">
                        {isBn ? "শুরুর স্থান (Origin)" : "From"}
                      </label>
                      <select
                        value={leg.originIata}
                        onChange={(e) => handleLegChange(index, "originIata", e.target.value)}
                        className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2.5 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                      >
                        {SITE_CONFIG.airports.map((airport) => (
                          <option key={airport.iata} value={airport.iata}>
                            {airport.iata} — {airport.cityEn} ({airport.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Middle Icon Indicator */}
                    <div className="hidden md:flex md:col-span-1 justify-center pt-5">
                      <Plane className="h-4 w-4 text-safaria-gold rotate-90 md:rotate-0" />
                    </div>

                    {/* Destination */}
                    <div className="md:col-span-4 space-y-1">
                      <label className="text-xs text-safaria-inkMuted block">
                        {isBn ? "গন্তব্য (Destination)" : "To"}
                      </label>
                      <select
                        value={leg.destinationIata}
                        onChange={(e) => handleLegChange(index, "destinationIata", e.target.value)}
                        className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2.5 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                      >
                        {SITE_CONFIG.airports.map((airport) => (
                          <option key={airport.iata} value={airport.iata}>
                            {airport.iata} — {airport.cityEn} ({airport.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Departure Date */}
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs text-safaria-inkMuted block">
                        {isBn ? "যাত্রার তারিখ" : "Departure Date"}
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={leg.departureDate}
                        onChange={(e) => handleLegChange(index, "departureDate", e.target.value)}
                        className="w-full rounded-lg border border-safaria-line bg-surface-0 px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Dynamic Add Leg Button for Multi-City */}
              {tripType === "MULTI_CITY" && legs.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddLeg}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-safaria-gold/60 bg-surface-200/30 py-3 text-xs sm:text-sm font-semibold text-safaria-gold hover:bg-safaria-gold/10 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isBn ? "+ আরেকটি ফ্লাইট লেগ যোগ করুন" : "+ Add Another Flight Leg"}</span>
                </button>
              )}
            </div>

            {/* Passenger Count, Cabin Class, Carrier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-safaria-line/60 pt-6">
              {/* Adults */}
              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "প্রাপ্তবয়স্ক (১২+ বছর)" : "Adults (12+ yrs)"}
                </label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Adult" : "Adults"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Children */}
              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "শিশু (২–১১ বছর)" : "Children (2–11 yrs)"}
                </label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Children
                    </option>
                  ))}
                </select>
              </div>

              {/* Infants */}
              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "শিশু (<২ বছর, কোলে)" : "Infants (Under 2)"}
                </label>
                <select
                  value={infants}
                  onChange={(e) => setInfants(Number(e.target.value))}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} Infant
                    </option>
                  ))}
                </select>
              </div>

              {/* Cabin Class */}
              <div className="space-y-1">
                <label className="text-xs text-safaria-inkMuted block">
                  {isBn ? "কেবিন ক্লাস" : "Cabin Class"}
                </label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as any)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business Class</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>
            </div>

            {/* Passenger Contact Information */}
            <div className="border-t border-safaria-line/60 pt-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-safaria-gold">
                {isBn ? "যাত্রীর যোগাযোগের তথ্য" : "Passenger Contact Details"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lead Name */}
                <div className="space-y-1">
                  <label htmlFor="lead-passenger-name" className="text-xs text-safaria-inkMuted block">
                    {isBn ? "প্রধান যাত্রীর পুরো নাম (পাসপোর্ট অনুযায়ী)" : "Lead Passenger Full Name"} *
                  </label>
                  <input
                    id="lead-passenger-name"
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={leadPassengerName}
                    onChange={(e) => setLeadPassengerName(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label htmlFor="phone-number" className="text-xs text-safaria-inkMuted block">
                    {isBn ? "মোবাইল / হোয়াটসঅ্যাপ নম্বর" : "Mobile / WhatsApp Number"} *
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="phone-country-code"
                      aria-label="Phone country code"
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="w-24 rounded-lg border border-safaria-line bg-surface-input px-2 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                    >
                      <option value="+880">+880 (BD)</option>
                      <option value="+971">+971 (UAE)</option>
                      <option value="+966">+966 (KSA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+1">+1 (USA/CA)</option>
                      <option value="+60">+60 (MY)</option>
                      <option value="+65">+65 (SG)</option>
                      <option value="+66">+66 (TH)</option>
                    </select>
                    <input
                      id="phone-number"
                      type="tel"
                      required
                      placeholder="1711223344"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="passenger-email" className="text-xs text-safaria-inkMuted block">
                    {isBn ? "ইমেইল ঠিকানা (ঐচ্ছিক)" : "Email Address (Optional)"}
                  </label>
                  <input
                    id="passenger-email"
                    type="email"
                    placeholder="tanvir@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>

                {/* Preferred Carrier */}
                <div className="space-y-1">
                  <label htmlFor="preferred-carrier" className="text-xs text-safaria-inkMuted block">
                    {isBn ? "পছন্দের এয়ারলাইন্স (ঐচ্ছিক)" : "Preferred Carrier (Optional)"}
                  </label>
                  <input
                    id="preferred-carrier"
                    type="text"
                    placeholder="e.g. Emirates, Biman, Qatar, Singapore Airlines"
                    value={preferredCarrier}
                    onChange={(e) => setPreferredCarrier(e.target.value)}
                    className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1">
                <label htmlFor="special-notes" className="text-xs text-safaria-inkMuted block">
                  {isBn ? "বিশেষ নির্দেশনা বা অনুরোধ (ঐচ্ছিক)" : "Special Requests / Notes"}
                </label>
                <textarea
                  id="special-notes"
                  rows={2}
                  placeholder={
                    isBn
                      ? "যেমনঃ জানালার পাশের সিট, অতিরিক্ত লাগেজ, ট্রানজিট ভিসা ইত্যাদি।"
                      : "e.g. Window seat, extra baggage requirement, transit inquiry, etc."
                  }
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full rounded-lg border border-safaria-line bg-surface-input px-3 py-2 text-sm text-safaria-ink focus:border-safaria-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-safaria-danger/60 bg-safaria-danger/10 p-3 text-xs text-safaria-danger">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Truthful Policy Disclaimer & Consent */}
            <div className="space-y-3 rounded-lg border border-safaria-line/60 bg-surface-0 p-3.5 text-xs text-safaria-inkMuted">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-safaria-line bg-surface-input text-safaria-gold focus:ring-safaria-gold"
                />
                <span className="leading-relaxed">
                  {isBn ? (
                    <>
                      আমি নিশ্চিত করছি যে এটি একটি <strong>ফ্লাইট কোটেশন অনুরোধ</strong>, নিশ্চিত
                      বুকিং বা টিকেট নয়। সাফারিয়া প্রতিনিধি ভাড়ার বিবরণ প্রদান করার পর আমার সম্মতিক্রমে
                      টিকেট প্রসেসিং সম্পন্ন হবে।
                    </>
                  ) : (
                    <>
                      I understand that this request generates an <strong>airfare quotation</strong>{" "}
                      and does not constitute an instant confirmed booking or issued ticket until
                      payment and issuance are explicitly confirmed with a SAFARIA specialist.
                    </>
                  )}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-btn bg-gradient-to-r from-safaria-goldHi to-safaria-goldLo py-4 text-sm font-bold text-safaria-onGold shadow-btn hover:shadow-btnHover transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isBn ? "কোটেশন তৈরি হচ্ছে..." : "Processing Quotation Request..."}</span>
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4" />
                  <span>{isBn ? "যাচাইকৃত কোটেশন অনুরোধ পাঠান" : "Submit Quotation Request"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Live Status Tracking Modal */}
      <TrackEnquiryModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        lang={lang}
        initialReference={submittedData?.referenceNo}
      />
    </section>
  );
}
