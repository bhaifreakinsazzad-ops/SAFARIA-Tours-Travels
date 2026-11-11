"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { destinationByCode } from "@/data/catalog";
import { whatsappHrefFor } from "@/config/constants";
import type { Language } from "./atlas-data";

export type TravelLeg = { origin: string; destination: string; departure: string };
export type TravelFields = {
  category: string; tripType: string; origin: string; destination: string; departure: string; returnDate: string;
  multiCityLegs: TravelLeg[];
  adults: number; children: number; infants: number; cabin: string; airline: string; baggage: string; flexible: string; notes: string;
  fullName: string; phone: string; email: string; contactMethod: string; consent: boolean;
};
export const initialTravelFields: TravelFields = {
  category: "air", tripType: "return", origin: "DAC", destination: "", departure: "", returnDate: "",
  multiCityLegs: [{ origin: "", destination: "", departure: "" }],
  adults: 1, children: 0, infants: 0, cabin: "economy", airline: "", baggage: "", flexible: "flexible", notes: "",
  fullName: "", phone: "", email: "", contactMethod: "whatsapp", consent: false,
};
type TravelState = { step: number; fields: TravelFields; update: (patch: Partial<TravelFields>) => void; setStep: (step: number) => void; reset: () => void; preset: (patch: Partial<TravelFields>) => void };
export const useTravelStore = create<TravelState>()(persist((set) => ({
  step: 0,
  fields: initialTravelFields,
  update: (patch) => set((state) => ({ fields: { ...state.fields, ...patch } })),
  setStep: (step) => set({ step: Math.max(0, Math.min(4, step)) }),
  reset: () => set({ step: 0, fields: initialTravelFields }),
  preset: (patch) => set((state) => ({ fields: { ...state.fields, ...patch }, step: 1 })),
}), { name: "safaria-travel-draft-v1", skipHydration: true, partialize: (state) => ({ step: state.step, fields: state.fields }) }));

export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
function validDate(value: string) { const date = new Date(`${value}T00:00:00Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value; }
export function travelStepErrors(step: number, fields: TravelFields): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!fields.category) errors.push("category");
    if (!fields.tripType) errors.push("tripType");
  }
  if (step === 1) {
    if (!destinationByCode(fields.origin)) errors.push("origin");
    if (!destinationByCode(fields.destination) || fields.destination === fields.origin) errors.push("destination");
    if (!validDate(fields.departure) || fields.departure < localToday()) errors.push("departure");
    if (fields.tripType === "return" && (!validDate(fields.returnDate) || fields.returnDate < fields.departure)) errors.push("returnDate");
    if (fields.tripType === "multi-city") {
      const extraLegs = fields.multiCityLegs ?? [];
      if (extraLegs.length < 1 || extraLegs.length > 5) errors.push("multiCityLegs");
      let precedingDate = fields.departure;
      for (const leg of extraLegs) {
        if (!destinationByCode(leg.origin) ||
            !destinationByCode(leg.destination) ||
            leg.origin === leg.destination ||
            !validDate(leg.departure) ||
            leg.departure < localToday() ||
            leg.departure < precedingDate) {
          errors.push("multiCityLegs");
          break;
        }
        precedingDate = leg.departure;
      }
    }
  }
  if (step === 2) {
    if (!Number.isInteger(fields.adults) || fields.adults < 1 || fields.adults > 9) errors.push("adults");
    if (!Number.isInteger(fields.children) || fields.children < 0 || fields.children > 8) errors.push("children");
    if (!Number.isInteger(fields.infants) || fields.infants < 0 || fields.infants > 4 || fields.infants > fields.adults) errors.push("infants");
    if (fields.adults + fields.children + fields.infants > 9) errors.push("passengerLimit");
  }
  if (step === 3) {
    if (!fields.cabin) errors.push("cabin");
  }
  if (step === 4) {
    if (!fields.fullName.trim()) errors.push("fullName");
    if (!/^[+0-9().\s-]{6,24}$/.test(fields.phone.trim())) errors.push("phone");
    if ((fields.email || fields.contactMethod === "email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.push("email");
    if (!fields.contactMethod) errors.push("contactMethod");
    if (!fields.consent) errors.push("consent");
  }
  return errors;
}

export function travelWhatsappHref(fields: TravelFields, language: Language) {
  for (let step = 0; step < 5; step++) if (travelStepErrors(step, fields).length) throw new Error(`Invalid travel step ${step + 1}`);
  const from = destinationByCode(fields.origin)!;
  const to = destinationByCode(fields.destination)!;
  const message = [
    language === "bn" ? "SAFARIA — ভ্রমণ পরিকল্পনার কোটেশন অনুরোধ / Travel Studio" : "SAFARIA — Travel Studio quotation request",
    `Service: ${fields.category}`,
    `Trip: ${fields.tripType}`,
    `Route: ${from.city} (${from.code}) → ${to.city} (${to.code})`,
    `Departure: ${fields.departure}`,
    ...(fields.tripType === "return" ? [`Return: ${fields.returnDate}`] : []),
    ...(fields.tripType === "multi-city" ? (fields.multiCityLegs ?? []).map((leg, index) =>
      `Leg ${index + 2}: ${leg.origin} → ${leg.destination} on ${leg.departure}`) : []),
    `Passengers: ${fields.adults} adult(s), ${fields.children} child(ren), ${fields.infants} infant(s)`,
    `Cabin: ${fields.cabin}`,
    ...(fields.airline ? [`Airline: ${fields.airline}`] : []),
    ...(fields.baggage ? [`Baggage: ${fields.baggage}`] : []),
    `Date flexibility: ${fields.flexible}`,
    ...(fields.notes ? [`Notes: ${fields.notes}`] : []),
    `Name: ${fields.fullName.trim()}`,
    `Phone/WhatsApp: ${fields.phone.trim()}`,
    ...(fields.email ? [`Email: ${fields.email.trim()}`] : []),
    `Contact preference: ${fields.contactMethod}`,
    "This is a quotation request, subject to supplier confirmation. Opening this WhatsApp draft does not send it.",
  ].join("\n");
  return whatsappHrefFor(message);
}
