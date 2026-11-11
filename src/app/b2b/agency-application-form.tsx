"use client";

import { useState, type FormEvent } from "react";
import { whatsappHrefFor } from "@/config/constants";

type Plan = "monthly" | "annual" | "demo";

export default function AgencyApplicationForm() {
  const [agency, setAgency] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [plan, setPlan] = useState<Plan>("monthly");
  const [accepted, setAccepted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accepted || !/^01[0-9]{9}$/.test(phone)) return;
    const message = [
      "SAFARIA | B2B Agency Partnership Enquiry",
      "Agency: " + agency.trim(),
      "Contact: " + contact.trim(),
      "Mobile: " + phone,
      "District: " + district.trim(),
      "Interested Plan: " + plan,
      "Request: Please explain verification, current commercial terms and activation requirements.",
      "I understand this is an enquiry, not a paid subscription or ticket booking.",
    ].join("\n");
    window.location.assign(whatsappHrefFor(message));
  };

  const inputClass = "mt-2 w-full rounded-xl border border-white/20 bg-[#041713]/75 px-4 py-3 text-[#f8f5ec] outline-none placeholder:text-white/35 focus:border-[#d6b779]";
  return (
    <form className="grid gap-5 rounded-3xl border border-[#d6b779]/20 bg-[#041713]/50 p-6 md:p-8" onSubmit={onSubmit}>
      <label className="text-sm font-medium">Agency / Business Name
        <input className={inputClass} required maxLength={100} autoComplete="organization" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="Your registered agency" />
      </label>
      <label className="text-sm font-medium">Contact Person
        <input className={inputClass} required maxLength={80} autoComplete="name" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Full name" />
      </label>
      <label className="text-sm font-medium">Bangladesh Mobile Number
        <input className={inputClass} required type="tel" inputMode="numeric" pattern="01[0-9]{9}" title="Enter 11 digits starting with 01" maxLength={11} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
      </label>
      <label className="text-sm font-medium">District
        <input className={inputClass} required maxLength={50} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Dhaka / Chattogram / ..." />
      </label>
      <label className="text-sm font-medium">Interested Plan
        <select className={inputClass} value={plan} onChange={(e) => setPlan(e.target.value as Plan)}>
          <option value="monthly">Monthly Membership</option>
          <option value="annual">Annual Membership</option>
          <option value="demo">Request Demo / Eligibility Review</option>
        </select>
      </label>
      <label className="flex items-start gap-3 text-xs leading-6 text-white/70">
        <input type="checkbox" className="mt-1 accent-[#d6b779]" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        <span>I consent to share the information above with SAFARIA through WhatsApp for this partnership enquiry. I will review the message and press Send in WhatsApp.</span>
      </label>
      <button type="submit" className="rounded-xl bg-[#d6b779] px-5 py-4 font-bold text-[#041713] hover:bg-[#ecd49f]">Continue to WhatsApp →</button>
      <p className="text-xs leading-6 text-white/50">No data is submitted from this website form. WhatsApp opens with a prepared message; you must press Send. No membership is activated or charged automatically.</p>
    </form>
  );
}
