"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cityName, destinations } from "@/data/catalog";
import type { Language } from "@/lib/atlas-data";
import { localToday, travelStepErrors, travelWhatsappHref, useTravelStore, type TravelFields } from "@/lib/travel-store";
import { focusInvalidField } from "@/lib/validation-motion";

const labels = {
  bn: ["সেবা", "রুট ও তারিখ", "যাত্রী", "পছন্দ", "পর্যালোচনা"],
  en: ["Service", "Route & dates", "Passengers", "Preferences", "Review"],
};
const serviceOptions = [
  ["air", "ফ্লাইট", "Flights"], ["tour", "ট্যুর", "Tours"], ["hotel", "হোটেল", "Hotels"], ["visa", "ভিসা", "Visa"], ["umrah", "ওমরাহ", "Umrah"], ["transport", "যাতায়াত", "Transfers"],
];

export function TravelStudio({ language }: { language: Language }) {
  const step = useTravelStore((state) => state.step);
  const fields = useTravelStore((state) => state.fields);
  const update = useTravelStore((state) => state.update);
  const setStep = useTravelStore((state) => state.setStep);
  const reset = useTravelStore((state) => state.reset);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => { Promise.resolve(useTravelStore.persist.rehydrate()).then(() => setHydrated(true)); return () => { if (timerRef.current) window.clearInterval(timerRef.current); }; }, []);
  const bn = language === "bn";
  const set = <K extends keyof TravelFields>(key: K, value: TravelFields[K]) => { update({ [key]: value } as Partial<TravelFields>); setErrors((current) => current.filter((item) => item !== key)); };
  const extraLegs = fields.multiCityLegs?.length ? fields.multiCityLegs : [{ origin: fields.destination || "", destination: "", departure: "" }];
  const updateLeg = (index: number, key: "origin" | "destination" | "departure", value: string) => {
    const next = extraLegs.map((leg, pos) => pos === index ? { ...leg, [key]: value } : leg);
    set("multiCityLegs", next);
  };
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ referenceNo?: string; whatsAppUrl: string; saved: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  async function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = travelStepErrors(step, fields);
    if (invalid.length) { setErrors(invalid); focusInvalidField(`[data-travel-field="${invalid[0]}"]`); return; }
    setErrors([]);
    if (step < 4) { setStep(step + 1); return; }

    setSubmitting(true);
    try {
      const cleanPhone = fields.phone.replace(/[^0-9]/g, "");
      const cabinMap: Record<string, "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"> = {
        "economy": "ECONOMY",
        "premium-economy": "PREMIUM_ECONOMY",
        "business": "BUSINESS",
        "first": "FIRST",
      };
      const generalServiceType: Record<string, "VISA" | "HOLIDAY" | "HOTEL" | "UMRAH" | "CUSTOM"> = {
        visa: "VISA", tour: "HOLIDAY", hotel: "HOTEL", umrah: "UMRAH", transport: "CUSTOM",
      };
      const res = await fetch(fields.category === "air" ? "/api/enquiries" : "/api/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields.category === "air" ? {
          tripType: fields.tripType === "return" ? "ROUND_TRIP" : (fields.tripType === "multi-city" ? "MULTI_CITY" : "ONE_WAY"),
          legs: [
            {
              originIata: fields.origin || "DAC",
              originCity: destinations.find((d) => d.code === fields.origin)?.city || "Dhaka",
              destinationIata: fields.destination || "DXB",
              destinationCity: destinations.find((d) => d.code === fields.destination)?.city || "Dubai",
              departureDate: fields.departure,
            },
            ...(fields.tripType === "return" && fields.returnDate ? [{
              originIata: fields.destination || "DXB",
              originCity: destinations.find((d) => d.code === fields.destination)?.city || "Dubai",
              destinationIata: fields.origin || "DAC",
              destinationCity: destinations.find((d) => d.code === fields.origin)?.city || "Dhaka",
              departureDate: fields.returnDate,
            }] : []),
            ...(fields.tripType === "multi-city" ? extraLegs.map((leg) => ({
              originIata: leg.origin,
              originCity: destinations.find((d) => d.code === leg.origin)?.city || leg.origin,
              destinationIata: leg.destination,
              destinationCity: destinations.find((d) => d.code === leg.destination)?.city || leg.destination,
              departureDate: leg.departure,
            })) : []),
          ],
          cabinClass: cabinMap[fields.cabin] || "ECONOMY",
          passengers: { adults: fields.adults, children: fields.children, infants: fields.infants },
          preferredCarrier: fields.airline.trim() || undefined,
          leadPassengerName: fields.fullName.trim(),
          phoneCountryCode: "+880",
          phoneNumber: cleanPhone.startsWith("880") ? cleanPhone.slice(3) : cleanPhone,
          email: fields.email.trim() || undefined,
          specialNotes: `${fields.baggage ? `Baggage: ${fields.baggage}. ` : ""}${fields.notes}`.trim().slice(0, 500) || undefined,
          consentAgreed: fields.consent,
        } : {
          serviceType: generalServiceType[fields.category] || "CUSTOM",
          fullName: fields.fullName.trim(),
          phone: fields.phone.trim(),
          email: fields.email.trim() || undefined,
          destinationOrCountry: destinations.find((d) => d.code === fields.destination)?.city || fields.destination,
          passengerOrPaxCount: fields.adults + fields.children + fields.infants,
          message: `Route: ${fields.origin} → ${fields.destination}. Departure: ${fields.departure}. Trip type: ${fields.tripType}. Cabin: ${fields.cabin}. ${fields.notes || "Please provide a quotation and service details."}`.slice(0, 1000),
        }),
      });
      const data = await res.json();
      if (data.success && data.referenceNo) {
        setSubmittedData({
          referenceNo: data.referenceNo,
          whatsAppUrl: data.whatsAppUrl || travelWhatsappHref(fields, language),
          saved: true,
        });
      } else {
        setSubmittedData({
          whatsAppUrl: travelWhatsappHref(fields, language),
          saved: false,
        });
      }
    } catch {
      setSubmittedData({
        whatsAppUrl: travelWhatsappHref(fields, language),
        saved: false,
      });
    } finally {
      setSubmitting(false);
    }
  }
  function makeDraft() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const to = destinations.find((item) => item.code === fields.destination);
    const from = destinations.find((item) => item.code === fields.origin);
    const draft = bn
      ? `${from ? cityName(from, language) : "আমার শহর"} থেকে ${to ? cityName(to, language) : "পছন্দের গন্তব্যে"} ${fields.departure || "পছন্দের তারিখে"} যাত্রা করতে চাই। ${fields.adults + fields.children} জনের জন্য ${fields.cabin} কেবিন, ${fields.baggage || "প্রয়োজন অনুযায়ী"} ব্যাগেজ ও উপযুক্ত রুটের কোটেশন দিন।`
      : `I would like to travel from ${from?.city || "my origin"} to ${to?.city || "my destination"} on ${fields.departure || "my preferred date"}. Please quote suitable ${fields.cabin} options for ${fields.adults + fields.children} traveller(s), with ${fields.baggage || "appropriate"} baggage.`;
    if (reduceMotion) { set("notes", draft); return; }
    setDrafting(true);
    set("notes", "");
    let index = 0;
    timerRef.current = window.setInterval(() => {
      index = Math.min(index + 3, draft.length);
      update({ notes: draft.slice(0, index) });
      if (index >= draft.length && timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; setDrafting(false); }
    }, 22);
  }
  const fieldError = (key: string) => errors.includes(key) ? <span className="field-error">{bn ? "এই তথ্যটি যাচাই করুন" : "Please check this field"}</span> : null;
  const selectDestination = (key: "origin" | "destination", text: string) => <label className="field">{text}<select data-travel-field={key} value={fields[key]} onChange={(event) => set(key, event.target.value)} aria-invalid={errors.includes(key)}><option value="">{bn ? "নির্বাচন করুন" : "Select"}</option>{destinations.map((item) => <option key={item.code} value={item.code}>{cityName(item, language)} ({item.code})</option>)}</select>{fieldError(key)}</label>;
  const input = (key: "airline" | "baggage" | "fullName" | "phone" | "email", text: string, type = "text") => <label className="field">{text}<input data-travel-field={key} type={type} value={fields[key]} onChange={(event) => set(key, event.target.value)} aria-invalid={errors.includes(key)} autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "email" ? "email" : undefined} maxLength={key === "phone" ? 24 : 120} />{fieldError(key)}</label>;

  return <section id="sf-travel-form" className="content-section studio-section" aria-labelledby="studio-title"><div className="section-heading"><p className="eyebrow">03 / PERSONAL TRAVEL STUDIO</p><h2 id="studio-title" className="display-heading">{bn ? "আপনার যাত্রা, আপনার মতো" : "Shape your next journey"}</h2><p>{bn ? "পাঁচটি ছোট ধাপে পরিকল্পনা সাজান। খসড়াটি এই ডিভাইসে সংরক্ষিত থাকবে।" : "Plan in five short steps. Your draft stays on this device."}</p></div>
    <div className="studio-shell"><div className="studio-progress" aria-label={bn ? "ফর্মের অগ্রগতি" : "Form progress"}>{labels[language].map((label, index) => <div key={label} className={index === step ? "current" : index < step ? "complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><small>{label}</small></div>)}</div>
      {hydrated && <div className="draft-bar"><span>● {bn ? "এই ডিভাইসে খসড়া সংরক্ষিত" : "Draft saved on this device"}</span><button type="button" onClick={() => { reset(); setErrors([]); }}>{bn ? "খসড়া মুছুন" : "Clear draft"}</button></div>}
      {submittedData ? (
        <div className="p-8 space-y-6">
          <div className="rounded-xl border border-safaria-line bg-[#092c27] p-6 text-center space-y-4">
            <span className="text-xs font-bold tracking-widest text-safaria-gold uppercase">
              {submittedData.saved
                ? (bn ? "কোটেশন অনুরোধ নিবন্ধিত" : "Quotation request registered")
                : (bn ? "WhatsApp-এ অনুরোধ পাঠান" : "Continue in WhatsApp")}
            </span>
            {submittedData.referenceNo && <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold text-safaria-gold">{submittedData.referenceNo}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(submittedData.referenceNo ?? "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="rounded border border-safaria-gold/40 bg-surface-200 px-3 py-1 text-xs font-semibold text-safaria-ivory hover:border-safaria-gold"
              >
                {copied ? (bn ? "কপি হয়েছে!" : "Copied!") : (bn ? "কপি" : "Copy")}
              </button>
            </div>}
            <p className="text-xs text-safaria-muted leading-relaxed max-w-lg mx-auto">
              {submittedData.saved
                ? (bn
                  ? "আপনার পরিকল্পনা সংরক্ষিত হয়েছে। WhatsApp-এ Send চাপলে আমাদের টিম ফলো-আপ করতে পারবে; বুকিং নিশ্চিত হয়নি।"
                  : "Your itinerary has been saved. Press Send in WhatsApp for follow-up; no booking is confirmed.")
                : (bn
                  ? "সার্ভারে সংরক্ষণ করা যায়নি, তাই ট্র্যাকিং নম্বর তৈরি হয়নি। WhatsApp-এ বার্তা নিজে Send করে অনুরোধটি পাঠাতে পারবেন।"
                  : "Online saving was unavailable; no tracking reference was issued. Open WhatsApp and press Send to contact our team.")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={submittedData.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-gold w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              <span>{bn ? "WhatsApp-এ চ্যাট খুলুন" : "Open in WhatsApp"}</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              onClick={() => {
                reset();
                setErrors([]);
                setSubmittedData(null);
              }}
              className="button button-outline w-full sm:w-auto text-center"
            >
              {bn ? "নতুন পরিকল্পনা শুরু করুন" : "Plan Another Trip"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={advance} noValidate><AnimatePresence mode="wait"><motion.div key={step} layoutId={reduceMotion ? undefined : "travel-step-panel"} className="studio-panel" initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -18 }} transition={{ duration: reduceMotion ? 0 : 0.24 }}>
          <p className="step-count">{bn ? "ধাপ" : "STEP"} {step + 1} / 5</p><h3 className="display-heading">{labels[language][step]}</h3>
          {step === 0 && <div className="studio-fields"><fieldset className="studio-choice field-wide"><legend>{bn ? "কোন সেবাটি দরকার?" : "What do you need?"}</legend><div>{serviceOptions.map(([value, b, e]) => <label key={value} className={fields.category === value ? "selected" : ""}><input type="radio" name="category" value={value} checked={fields.category === value} onChange={() => set("category", value)} />{bn ? b : e}</label>)}</div>{fieldError("category")}</fieldset><fieldset className="studio-choice field-wide"><legend>{bn ? "যাত্রার ধরন" : "Trip type"}</legend><div>{[["one-way", "একমুখী", "One way"], ["return", "ফেরাসহ", "Return"], ["multi-city", "একাধিক শহর", "Multi city"]].map(([value, b, e]) => <label key={value} className={fields.tripType === value ? "selected" : ""}><input type="radio" name="tripType" value={value} checked={fields.tripType === value} onChange={() => set("tripType", value)} />{bn ? b : e}</label>)}</div>{fieldError("tripType")}</fieldset></div>}
          {step === 1 && <div className="studio-fields">{selectDestination("origin", bn ? "যাত্রা শুরু *" : "From *")}{selectDestination("destination", bn ? "গন্তব্য *" : "To *")}<label className="field">{bn ? "যাত্রার তারিখ *" : "Departure date *"}<input data-travel-field="departure" type="date" min={localToday()} value={fields.departure} onChange={(event) => set("departure", event.target.value)} aria-invalid={errors.includes("departure")} />{fieldError("departure")}</label>{fields.tripType === "return" && <label className="field">{bn ? "ফেরার তারিখ *" : "Return date *"}<input data-travel-field="returnDate" type="date" min={fields.departure || localToday()} value={fields.returnDate} onChange={(event) => set("returnDate", event.target.value)} aria-invalid={errors.includes("returnDate")} />{fieldError("returnDate")}</label>}{fields.tripType === "multi-city" && <div className="field-wide space-y-4">
            <p className="studio-note">{bn ? "একাধিক গন্তব্যের প্রতিটি ফ্লাইট লেগ এবং তারিখ যোগ করুন (মোট ২–৬ লেগ)।" : "Add each connecting journey and its date (2–6 flight legs total)."}</p>
            {extraLegs.map((leg, index) => <fieldset key={index} className="rounded-xl border border-safaria-line p-4 space-y-3">
              <legend className="px-2 font-semibold text-safaria-gold">{bn ? "ফ্লাইট লেগ" : "Flight leg"} {index + 2}</legend>
              <div className="studio-fields">
                <label className="field">{bn ? "কোথা থেকে *" : "From *"}
                  <select data-travel-field="multiCityLegs" value={leg.origin} onChange={(event) => updateLeg(index, "origin", event.target.value)}>
                    <option value="">{bn ? "নির্বাচন করুন" : "Select"}</option>
                    {destinations.map((destination) => <option key={destination.code} value={destination.code}>{cityName(destination, language)} ({destination.code})</option>)}
                  </select>
                </label>
                <label className="field">{bn ? "কোথায় *" : "To *"}
                  <select value={leg.destination} onChange={(event) => updateLeg(index, "destination", event.target.value)}>
                    <option value="">{bn ? "নির্বাচন করুন" : "Select"}</option>
                    {destinations.map((destination) => <option key={destination.code} value={destination.code}>{cityName(destination, language)} ({destination.code})</option>)}
                  </select>
                </label>
                <label className="field">{bn ? "যাত্রার তারিখ *" : "Departure date *"}
                  <input type="date" min={index === 0 ? (fields.departure || localToday()) : extraLegs[index - 1].departure || localToday()} value={leg.departure} onChange={(event) => updateLeg(index, "departure", event.target.value)} />
                </label>
              </div>
              {extraLegs.length > 1 && <button type="button" className="button button-outline" onClick={() => set("multiCityLegs", extraLegs.filter((_, itemIndex) => itemIndex !== index))}>{bn ? "এই লেগটি মুছুন" : "Remove this leg"}</button>}
            </fieldset>)}
            {extraLegs.length < 5 && <button type="button" className="button button-outline" onClick={() => set("multiCityLegs", [...extraLegs, { origin: extraLegs[extraLegs.length - 1]?.destination || fields.destination, destination: "", departure: "" }])}>{bn ? "+ আরও একটি ফ্লাইট লেগ" : "+ Add flight leg"}</button>}
            {fieldError("multiCityLegs")}
          </div>}</div>}
          {step === 2 && <div className="studio-fields">{(["adults", "children", "infants"] as const).map((key) => <label className="field" key={key}>{key === "adults" ? (bn ? "প্রাপ্তবয়স্ক *" : "Adults *") : key === "children" ? (bn ? "শিশু" : "Children") : (bn ? "শিশু (কোলের)" : "Infants")}<input data-travel-field={key} type="number" min={key === "adults" ? 1 : 0} max="9" value={fields[key]} onChange={(event) => set(key, Number(event.target.value))} aria-invalid={errors.includes(key)} />{fieldError(key)}</label>)}{errors.includes("passengerLimit") && <p className="form-error field-wide">{bn ? "একটি অনুরোধে সব মিলিয়ে সর্বোচ্চ ৯ জন যাত্রী।" : "Maximum 9 passengers including infants per request."}</p>}<p className="studio-note field-wide">{bn ? "কোলের শিশুর সংখ্যা প্রাপ্তবয়স্কের বেশি হতে পারবে না।" : "Infants cannot exceed the number of adults."}</p></div>}
          {step === 3 && <div className="studio-fields"><label className="field">{bn ? "কেবিন *" : "Cabin *"}<select data-travel-field="cabin" value={fields.cabin} onChange={(event) => set("cabin", event.target.value)}><option value="economy">Economy</option><option value="premium-economy">Premium Economy</option><option value="business">Business</option><option value="first">First</option></select>{fieldError("cabin")}</label><label className="field">{bn ? "তারিখের নমনীয়তা" : "Date flexibility"}<select value={fields.flexible} onChange={(event) => set("flexible", event.target.value)}><option value="flexible">{bn ? "কিছুটা নমনীয়" : "Flexible"}</option><option value="fixed">{bn ? "নির্দিষ্ট" : "Fixed"}</option></select></label>{input("airline", bn ? "পছন্দের এয়ারলাইন" : "Preferred airline")}{input("baggage", bn ? "ব্যাগেজের চাহিদা" : "Baggage needs")}<label className="field field-wide">{bn ? "অতিরিক্ত তথ্য" : "Additional notes"}<textarea data-travel-field="notes" value={fields.notes} maxLength={800} rows={4} aria-invalid={errors.includes("notes")} onChange={(event) => set("notes", event.target.value)} />{fieldError("notes")}</label><button type="button" className="magic-draft" onClick={makeDraft} disabled={drafting}>✦ {bn ? "AI Draft My Trip — খসড়া তৈরি করুন" : "AI Draft My Trip"}</button><p className="studio-note field-wide">{bn ? "এই বোতামটি আপনার দেওয়া তথ্য দিয়ে স্থানীয়ভাবে একটি খসড়া লেখে; AI সেবায় তথ্য পাঠায় না।" : "This writes a local draft from your answers; no data is sent to an AI service."}</p></div>}
          {step === 4 && <div className="studio-fields"><div className="studio-review field-wide"><strong>{bn ? "পরিকল্পনার সারাংশ" : "Your trip at a glance"}</strong><p>{fields.origin} → {fields.destination} · {fields.departure || "—"}{fields.tripType === "return" ? ` → ${fields.returnDate || "—"}` : ""}</p>{fields.tripType === "multi-city" && extraLegs.map((leg, index) => <p key={index}>#{index + 2}: {leg.origin} → {leg.destination} · {leg.departure}</p>)}<p>{fields.adults + fields.children + fields.infants} {bn ? "যাত্রী" : "travellers"} · {fields.cabin}</p>{fields.notes && <p>{fields.notes}</p>}</div>{input("fullName", bn ? "পুরো নাম *" : "Full name *")}{input("phone", bn ? "ফোন / WhatsApp *" : "Phone / WhatsApp *", "tel")}{input("email", bn ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)", "email")}<label className="field">{bn ? "যোগাযোগের মাধ্যম *" : "Contact method *"}<select value={fields.contactMethod} onChange={(event) => set("contactMethod", event.target.value)}><option value="whatsapp">WhatsApp</option><option value="phone">{bn ? "ফোন" : "Phone"}</option><option value="email">Email</option></select></label><label className="consent-field field-wide"><input data-travel-field="consent" type="checkbox" checked={fields.consent} onChange={(event) => set("consent", event.target.checked)} aria-invalid={errors.includes("consent")} />{bn ? "কোটেশন প্রস্তুত করতে আমার দেওয়া তথ্য ব্যবহার ও WhatsApp খসড়া খুলতে সম্মতি দিচ্ছি।" : "I agree to use my details to prepare a quotation and open a WhatsApp draft."}</label>{fieldError("consent")}</div>}
        </motion.div></AnimatePresence>
        {errors.includes("form") && <p className="form-error" role="alert">{bn ? "তথ্যগুলো আবার যাচাই করুন।" : "Please review your details."}</p>}
        <div className="studio-actions">{step > 0 && <button type="button" className="button button-outline" onClick={() => { setErrors([]); setStep(step - 1); }}>{bn ? "পেছনে" : "Back"}</button>}<button type="submit" disabled={submitting} className="button button-gold">{submitting ? (bn ? "সংরক্ষণ হচ্ছে…" : "Submitting…") : (step === 4 ? (bn ? "অনুরোধ নিশ্চিত করুন" : "Confirm Request") : (bn ? "পরের ধাপ" : "Continue"))} <span aria-hidden="true">→</span></button></div>
        <p className="studio-fineprint">{bn ? "কোটেশন সরবরাহকারীর নিশ্চিতকরণ সাপেক্ষে। WhatsApp খোলার পর আপনাকেই Send চাপতে হবে।" : "Quotation subject to supplier confirmation. You must press Send in WhatsApp."}</p>
        </form>
      )}</div>
  </section>;
}
