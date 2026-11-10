"use client";

import { useState, type FormEvent } from "react";
import { agencyErrors, agencyWhatsappHref, initialAgencyFields, type AgencyFields } from "@/lib/agency";
import { AGENCY_PRICING } from "@/config/constants";
import { focusInvalidField } from "@/lib/validation-motion";
import type { Language } from "@/lib/atlas-data";

export function AgencyPortal({ language }: { language: Language }) {
  const bn = language === "bn";
  const [fields, setFields] = useState<AgencyFields>(initialAgencyFields);
  const [touched, setTouched] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showMarkup, setShowMarkup] = useState(false);
  const errors = agencyErrors(fields);
  const set = <K extends keyof AgencyFields>(key: K, value: AgencyFields[K]) => setFields((current) => ({ ...current, [key]: value }));
  const touch = (key: string) => setTouched((current) => current.includes(key) ? current : [...current, key]);
  const invalid = (key: string) => errors.includes(key) && (touched.includes(key) || submitted);
  const message = (key: string) => invalid(key) && <small className="field-error">{bn ? "এই তথ্যটি যাচাই করুন" : "Please check this field"}</small>;
  function input(key: "agencyName" | "location" | "website" | "years" | "volume" | "fullName" | "phone" | "email", label: string, type = "text") {
    return <label className="field bg-surface-input rounded-radius-sm">{label}<input data-agency-field={key} type={type} value={fields[key]} onChange={(event) => set(key, event.target.value)} onBlur={() => touch(key)} aria-invalid={invalid(key)} autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "email" ? "email" : undefined} min={key === "years" ? 0 : undefined} max={key === "years" ? 150 : undefined} maxLength={key === "phone" ? 24 : 120} />{message(key)}</label>;
  }
  function select(key: "applicationType" | "businessStatus" | "requirement" | "contactMethod", label: string, options: [string, string, string][]) {
    return <label className="field bg-surface-input rounded-radius-sm">{label}<select data-agency-field={key} value={fields[key]} onChange={(event) => set(key, event.target.value)} onBlur={() => touch(key)} aria-invalid={invalid(key)}><option value="">{bn ? "নির্বাচন করুন" : "Select"}</option>{options.map(([value, b, e]) => <option value={value} key={value}>{bn ? b : e}</option>)}</select>{message(key)}</label>;
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.length) { focusInvalidField(`[data-agency-field="${errors[0]}"]`); return; }
    try { window.open(agencyWhatsappHref(fields, language), "_blank", "noopener,noreferrer"); } catch { setSubmitted(true); }
  }
  const annual = fields.interest === "annualPlan";
  const number = (value: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en-US").format(value);
  return <section id="sf-agency" className="content-section agency-section bg-sf-000 p-space-5 rounded-radius-md shadow-header" aria-labelledby="agency-title"><div className="section-heading"><p className="eyebrow">04 / AGENCY PARTNERS</p><h2 id="agency-title" className="display-heading">{bn ? "এজেন্সির জন্য নতুন সম্ভাবনা" : "Built for travel agencies"}</h2><p>{bn ? "আবেদন করুন; যাচাই ও লিখিত শর্তের পর পরবর্তী ধাপ জানানো হবে।" : "Apply for review; next steps follow verification and written terms."}</p></div>
    <div className="agency-layout"><div className="agency-pricing"><div className="plan-toggle" role="group" aria-label={bn ? "প্ল্যান বেছে নিন" : "Choose plan"}><button type="button" aria-pressed={!annual} onClick={() => set("interest", "monthlyPlan")}>{bn ? "মাসিক" : "Monthly"}</button><button type="button" aria-pressed={annual} onClick={() => set("interest", "annualPlan")}>{bn ? "বার্ষিক" : "Annual"}</button></div><div className="price-display"><span>{bn ? "এজেন্সি সাবস্ক্রিপশন" : "Agency subscription"}</span><strong>৳{number(annual ? AGENCY_PRICING.annual : AGENCY_PRICING.monthly)}</strong><small>/ {annual ? (bn ? "বছর" : "year") : (bn ? "মাস" : "month")}</small></div>{annual && <p className="savings-badge">✦ Save ৳{new Intl.NumberFormat("bn-BD").format(AGENCY_PRICING.annualSavings)}/year</p>}<div className="agency-benefit"><strong>0% SAFARIA Markup</strong><button type="button" onClick={() => setShowMarkup((current) => !current)} aria-expanded={showMarkup} aria-controls="markup-rule">ⓘ {bn ? "নিয়ম দেখুন" : "How it works"}</button><p id="markup-rule" hidden={!showMarkup}>{bn ? "শুধু যোগ্য এয়ার টিকিটে SAFARIA-এর নিজস্ব মার্কআপ ০%; এয়ারলাইন কর ও সরবরাহকারীর ফি এর বাইরে। যোগ্যতা ও শর্ত যাচাই সাপেক্ষে।" : "0% SAFARIA markup applies only to eligible air tickets. Airline taxes and supplier fees are excluded. Eligibility and terms require verification."}</p></div><p className="agency-fineprint">{bn ? "দাম প্রদর্শন আবেদন বা ট্রায়াল সক্রিয় করে না। বুকিং, ক্রেডিট ও সাবস্ক্রিপশন আলাদা লিখিত শর্ত সাপেক্ষে।" : "Displayed prices do not activate a subscription or trial. Booking, credits and subscription terms require written confirmation."}</p></div>
      <form id="sf-agency-form" className="agency-form ivory-surface" onSubmit={submit} noValidate><h3 className="display-heading">{bn ? "এজেন্সির আবেদন" : "Agency application"}</h3><p>{bn ? "১৬টি তথ্য দিয়ে আবেদন তৈরি করুন। WhatsApp-এ পাঠানোর আগে সব যাচাই করুন।" : "Complete the 16-field application, then review it in WhatsApp before sending."}</p><div className="agency-fields">
        {select("applicationType", bn ? "আবেদনের ধরন *" : "Application type *", [["trialRequest", "৭২ ঘণ্টার ট্রায়াল আবেদন", "72-hour trial application"], ["subscriptionRequest", "সাবস্ক্রিপশন আবেদন", "Subscription application"]])}
        {input("agencyName", bn ? "এজেন্সির নাম *" : "Agency name *")}{input("location", bn ? "অবস্থান *" : "Location *")}{input("website", bn ? "ওয়েবসাইট (ঐচ্ছিক)" : "Website (optional)", "url")}
        {select("businessStatus", bn ? "ব্যবসার অবস্থা *" : "Business status *", [["established", "চলমান", "Established"], ["starting", "শুরু হচ্ছে", "Starting"]])}
        {input("years", bn ? "কত বছর ধরে" : "Years in business", "number")}{input("volume", bn ? "আনুমানিক মাসিক ভলিউম" : "Estimated monthly volume")}
        {select("requirement", bn ? "প্রধান চাহিদা *" : "Primary requirement *", [["air", "এয়ার টিকিট", "Air tickets"], ["tour", "ট্যুর", "Tours"], ["hotel", "হোটেল", "Hotels"], ["visa", "ভিসা", "Visa"], ["other", "অন্যান্য", "Other"]])}
        <label className="field field-wide">{bn ? "ব্যবসার অতিরিক্ত তথ্য" : "Business notes"}<textarea value={fields.businessNotes} maxLength={500} rows={2} onChange={(event) => set("businessNotes", event.target.value)} /></label>
        {input("fullName", bn ? "যোগাযোগকারীর নাম *" : "Contact name *")}{input("phone", bn ? "ফোন / WhatsApp *" : "Phone / WhatsApp *", "tel")}{input("email", bn ? "ইমেইল *" : "Email *", "email")}
        {select("contactMethod", bn ? "যোগাযোগের মাধ্যম *" : "Contact method *", [["whatsapp", "WhatsApp", "WhatsApp"], ["phone", "ফোন", "Phone"], ["email", "ইমেইল", "Email"]])}
        <label className="consent-field field-wide"><input data-agency-field="consent" type="checkbox" checked={fields.consent} onChange={(event) => { set("consent", event.target.checked); touch("consent"); }} aria-invalid={invalid("consent")} />{bn ? "আবেদন যাচাইয়ের জন্য আমার তথ্য ব্যবহার করতে সম্মতি দিচ্ছি।" : "I consent to use of my details for application review."}</label>{message("consent")}
        <label className="consent-field field-wide"><input data-agency-field="trialConsent" type="checkbox" checked={fields.trialConsent} onChange={(event) => { set("trialConsent", event.target.checked); touch("trialConsent"); }} aria-invalid={invalid("trialConsent")} />{bn ? "আমি বুঝেছি ৭২ ঘণ্টার বিনামূল্যের ট্রায়াল যাচাই ও fair-use শর্তসাপেক্ষ; এই আবেদন ট্রায়াল সক্রিয় করে না।" : "I understand the 72-hour free trial is subject to verification and fair use; this application does not activate it."}</label>{message("trialConsent")}
      </div><button type="submit" className="button button-gold">{bn ? "WhatsApp আবেদন খসড়া খুলুন" : "Open WhatsApp application draft"} <span aria-hidden="true">↗</span></button><p className="form-handoff">{bn ? "WhatsApp খুললে নিজে Send চাপতে হবে।" : "You must press Send in WhatsApp."}</p></form></div>
  </section>;
}
