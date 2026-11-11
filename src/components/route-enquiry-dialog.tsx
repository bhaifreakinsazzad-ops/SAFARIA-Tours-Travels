"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/copy";
import { origin, type Language } from "@/lib/atlas-data";
import { cityName, countryName, destinationByCode, destinationForPreset, destinations, offerById } from "@/data/catalog";
import { createEnquiry, whatsappHref } from "@/lib/enquiry";

type Props = { open: boolean; selectedCode: string; selectedOfferId?: string; language: Language; onClose: () => void };
type HandoffState = { referenceNo?: string; whatsAppUrl: string; saved: boolean };

function todayLocal() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function RouteEnquiryDialog({ open, selectedCode, selectedOfferId = "", language, onClose }: Props) {
  const t = copy[language];
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const destinationRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const [destination, setDestination] = useState(selectedCode);
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [airline, setAirline] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<HandoffState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const preset = destinationForPreset(offerById(selectedOfferId)?.preset ?? "");
    const timer = window.setTimeout(() => { setDestination(selectedCode || preset.code); setAirline(preset.airline); }, 0);
    return () => {
      window.clearTimeout(timer);
      setSubmittedData(null);
      setError("");
      setCopied(false);
    };
  }, [open, selectedCode, selectedOfferId]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>(".site-shell");
    shell?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => (selectedCode ? dateRef.current : destinationRef.current)?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, select, input, textarea, a[href]"))
        .filter((item) => !item.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      shell?.removeAttribute("inert");
      previous?.focus();
    };
  }, [open, onClose, selectedCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (returnDate && returnDate < departure) { setError(t.dateError); return; }

    setSubmitting(true);
    try {
      const enquiry = createEnquiry({
        language, destination, departureDate: departure, returnDate: returnDate || null,
        travellers, name: name.trim(), contact: contact.trim(), notes: notes.trim(), offerId: selectedOfferId || undefined, airline: airline.trim() || undefined,
      });

      const destCode = destination.slice(0, 3).toUpperCase();
      const destCity = selected ? cityName(selected, "en") : (selectedCountry ? countryName(selectedCountry, "en") : destination);
      const cleanPhone = contact.replace(/[^0-9]/g, "");

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripType: returnDate ? "RETURN" : "ONE_WAY",
          legs: [
            {
              originIata: "DAC",
              originCity: "Dhaka",
              destinationIata: destCode,
              destinationCity: destCity,
              departureDate: departure,
            },
            ...(returnDate ? [{
              originIata: destCode,
              originCity: destCity,
              destinationIata: "DAC",
              destinationCity: "Dhaka",
              departureDate: returnDate,
            }] : []),
          ],
          cabinClass: "ECONOMY",
          passengers: { adults: travellers, children: 0, infants: 0 },
          preferredCarrier: airline.trim() || undefined,
          leadPassengerName: name.trim(),
          phoneCountryCode: "+880",
          phoneNumber: cleanPhone.startsWith("880") ? cleanPhone.slice(3) : cleanPhone,
          specialNotes: notes.trim() || undefined,
          consentAgreed: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.referenceNo) {
        setSubmittedData({
          referenceNo: data.referenceNo,
          whatsAppUrl: data.whatsAppUrl || whatsappHref(enquiry),
          saved: true,
        });
      } else {
        setSubmittedData({
          whatsAppUrl: whatsappHref(enquiry),
          saved: false,
        });
      }
    } catch {
      try {
        const enquiry = createEnquiry({
          language, destination, departureDate: departure, returnDate: returnDate || null,
          travellers, name: name.trim(), contact: contact.trim(), notes: notes.trim(), offerId: selectedOfferId || undefined, airline: airline.trim() || undefined,
        });
        setSubmittedData({
          whatsAppUrl: whatsappHref(enquiry),
          saved: false,
        });
      } catch {
        setError(language === "bn" ? "অনুগ্রহ করে তথ্যগুলো যাচাই করুন।" : "Please check the form details.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const selected = destinationByCode(destination);
  const selectedCountry = destination.startsWith("COUNTRY:") ? destinations.find((item) => item.country === destination.slice(8) && !item.origin) : undefined;
  const offer = offerById(selectedOfferId);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.section ref={dialogRef} className="enquiry-dialog ivory-surface" role="dialog" aria-modal="true" aria-labelledby="enquiry-title"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.24 }}>
            <button className="dialog-close" type="button" onClick={onClose} aria-label={t.close}>×</button>
            <h2 id="enquiry-title" className="display-heading">{t.modalTitle}</h2>
            {offer && <p className="dialog-offer">{language === "bn" ? offer.bn_title : offer.en_title}</p>}
            <div className="dialog-route"><span>{origin[language]} <small>DAC</small></span><span aria-hidden="true">→</span><span>{selected ? cityName(selected, language) : selectedCountry ? countryName(selectedCountry, language) : t.choose} {selected && <small>{selected.code}</small>}</span></div>
            {submittedData ? (
              <div className="space-y-4 py-2">
                <div className="rounded-xl border border-safaria-line bg-[#f1dfb9] p-5 text-center space-y-3">
                  <span className="text-[11px] font-bold tracking-widest text-[#386258] uppercase">
                    {submittedData.saved
                      ? (language === "bn" ? "কোটেশন অনুরোধ নিবন্ধিত" : "Quotation request registered")
                      : (language === "bn" ? "WhatsApp-এ অনুরোধ পাঠান" : "Continue your enquiry in WhatsApp")}
                  </span>
                  {submittedData.referenceNo && <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-xl font-extrabold text-[#062b27]">{submittedData.referenceNo}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(submittedData.referenceNo ?? "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className="rounded border border-[#386258]/40 bg-[#fffdf7] px-2.5 py-1 text-xs font-semibold text-[#062b27] hover:bg-white"
                    >
                      {copied ? (language === "bn" ? "কপি হয়েছে!" : "Copied!") : (language === "bn" ? "কপি" : "Copy")}
                    </button>
                  </div>}
                  <p className="text-xs text-[#386258] leading-relaxed max-w-md mx-auto">
                    {submittedData.saved
                      ? (language === "bn"
                        ? "আপনার অনুরোধটি সংরক্ষিত হয়েছে। পরবর্তী সহায়তার জন্য WhatsApp-এ বার্তা নিজে Send করুন; এটি টিকিট বুকিং নয়।"
                        : "Your request has been saved. Open WhatsApp and press Send for follow-up; this is not a confirmed booking.")
                      : (language === "bn"
                        ? "সার্ভারে অনুরোধটি সংরক্ষণ করা যায়নি, তাই কোনো ট্র্যাকিং নম্বর দেওয়া হচ্ছে না। WhatsApp খুলে Send চাপলে টিম আপনার বার্তাটি পাবে।"
                        : "We could not save this request online, so no tracking number was issued. Open WhatsApp and press Send to contact our team.")}
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <a
                    href={submittedData.whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-gold w-full text-center flex items-center justify-center gap-2"
                  >
                    <span>{language === "bn" ? "WhatsApp-এ চ্যাট খুলুন" : "Open in WhatsApp"}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-xs font-bold text-[#062b27] hover:underline"
                  >
                    {language === "bn" ? "সম্পন্ন / বন্ধ করুন" : "Done / Close"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="enquiry-form">
                <label className="field field-wide">{t.to} *
                  <select ref={destinationRef} required value={destination} onChange={(event) => setDestination(event.target.value)}>
                    <option value="">{t.choose}</option>
                    {selectedCountry && <option value={destination}>{countryName(selectedCountry, language)} ({language === "bn" ? "শহর পরে নিশ্চিত করুন" : "city to confirm"})</option>}
                    {destinations.filter((item) => !item.origin).map((route) => <option key={route.code} value={route.code}>{cityName(route, language)} ({route.code})</option>)}
                  </select>
                </label>
                {offer && <label className="field field-wide">{language === "bn" ? "পছন্দের এয়ারলাইন (ঐচ্ছিক)" : "Preferred airline (optional)"}<input value={airline} maxLength={80} onChange={(event) => setAirline(event.target.value)} /></label>}
                <label className="field">{t.depart} *<input ref={dateRef} required type="date" min={todayLocal()} value={departure} onChange={(event) => setDeparture(event.target.value)} /></label>
                <label className="field">{t.return}<input type="date" min={departure || todayLocal()} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>
                <label className="field field-wide">{t.travellers} *
                  <select value={travellers} onChange={(event) => setTravellers(Number(event.target.value))}>{Array.from({ length: 9 }, (_, i) => i + 1).map((count) => <option key={count} value={count}>{count} {t.travellersUnit}</option>)}</select>
                </label>
                <label className="field">{t.name} *<input required autoComplete="name" maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className="field">{t.phone} *<input required type="tel" autoComplete="tel" minLength={6} maxLength={24} value={contact} onChange={(event) => setContact(event.target.value)} /></label>
                <label className="field field-wide">{t.notes}<textarea maxLength={500} rows={2} placeholder={t.notesHint} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
                {error && <p className="form-error field-wide" role="alert">{error}</p>}
                <p className="form-disclaimer field-wide">{t.disclaimer}</p>
                <button type="submit" disabled={submitting} className="button button-gold field-wide">
                  {submitting ? (language === "bn" ? "প্রক্রিয়াকরণ হচ্ছে…" : "Processing…") : t.continue}
                  <span aria-hidden="true">↗</span>
                </button>
                <p className="form-handoff field-wide">{t.handoff}</p>
              </form>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
