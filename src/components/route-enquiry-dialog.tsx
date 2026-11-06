"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { copy } from "@/lib/copy";
import { origin, type Language } from "@/lib/atlas-data";
import { cityName, countryName, destinationByCode, destinationForPreset, destinations, offerById } from "@/data/catalog";
import { createEnquiry, whatsappHref } from "@/lib/enquiry";

type Props = { open: boolean; selectedCode: string; selectedOfferId?: string; language: Language; onClose: () => void };

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

  useEffect(() => {
    if (!open) return;
    const preset = destinationForPreset(offerById(selectedOfferId)?.preset ?? "");
    const timer = window.setTimeout(() => { setDestination(selectedCode || preset.code); setAirline(preset.airline); }, 0);
    return () => window.clearTimeout(timer);
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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (returnDate && returnDate < departure) { setError(t.dateError); return; }
    try {
      const enquiry = createEnquiry({
        language, destination, departureDate: departure, returnDate: returnDate || null,
        travellers, name: name.trim(), contact: contact.trim(), notes: notes.trim(), offerId: selectedOfferId || undefined, airline: airline.trim() || undefined,
      });
      window.open(whatsappHref(enquiry), "_blank", "noopener,noreferrer");
    } catch {
      setError(language === "bn" ? "অনুগ্রহ করে তথ্যগুলো যাচাই করুন।" : "Please check the form details.");
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
              <button type="submit" className="button button-gold field-wide">{t.continue}<span aria-hidden="true">↗</span></button>
              <p className="form-handoff field-wide">{t.handoff}</p>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
