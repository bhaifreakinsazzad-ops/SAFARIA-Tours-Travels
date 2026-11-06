import { origin, routeByCode, type Language } from "./atlas-data";
import { cityName, countryName, destinationByCode, destinations, offerById } from "@/data/catalog";
import { whatsappHrefFor } from "@/config/constants";

export type AtlasEnquiry = {
  schemaVersion: 1;
  source: "journey-atlas" | "campaign-offer" | "destination-explorer";
  language: Language;
  origin: "DAC";
  destination: string;
  departureDate: string;
  returnDate: string | null;
  travellers: number;
  name: string;
  contact: string;
  notes: string;
  offerId?: string;
  airline?: string;
};

export function createEnquiry(input: Omit<AtlasEnquiry, "schemaVersion" | "source" | "origin">): AtlasEnquiry {
  const country = input.destination.startsWith("COUNTRY:") ? destinations.find((item) => item.country === input.destination.slice(8) && !item.origin) : undefined;
  if ((!destinationByCode(input.destination) && !country) || input.destination === "DAC") throw new Error("Unknown destination");
  const departure = new Date(`${input.departureDate}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.departureDate) || Number.isNaN(departure.getTime()) || departure.toISOString().slice(0, 10) !== input.departureDate) throw new Error("Invalid departure date");
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  if (input.departureDate < today) throw new Error("Departure date is in the past");
  if (input.returnDate) {
    const returning = new Date(`${input.returnDate}T00:00:00Z`);
    if (Number.isNaN(returning.getTime()) || returning.toISOString().slice(0, 10) !== input.returnDate) throw new Error("Invalid return date");
  }
  if (input.returnDate && input.returnDate < input.departureDate) throw new Error("Invalid return date");
  if (!Number.isInteger(input.travellers) || input.travellers < 1 || input.travellers > 9) throw new Error("Invalid traveller count");
  if (!input.name.trim() || !input.contact.trim()) throw new Error("Name and contact are required");
  if (!/^[+0-9().\s-]{6,24}$/.test(input.contact.trim())) throw new Error("Invalid contact number");
  if (input.offerId && !offerById(input.offerId)) throw new Error("Unknown offer");
  return { schemaVersion: 1, source: input.offerId ? "campaign-offer" : routeByCode(input.destination) ? "journey-atlas" : "destination-explorer", origin: "DAC", ...input };
}

export function whatsappHref(enquiry: AtlasEnquiry): string {
  const destination = destinationByCode(enquiry.destination);
  const country = enquiry.destination.startsWith("COUNTRY:") ? destinations.find((item) => item.country === enquiry.destination.slice(8) && !item.origin) : undefined;
  if (!destination && !country) throw new Error("Unknown destination");
  const offer = enquiry.offerId ? offerById(enquiry.offerId) : undefined;
  const message = [
    enquiry.language === "bn" ? "SAFARIA — ভ্রমণ কোটেশনের অনুরোধ / Travel quotation request" : "SAFARIA — Travel quotation request",
    destination ? `Route: ${origin.en} (${origin.code}) → ${destination.city} (${destination.code})${enquiry.language === "bn" ? ` / ${cityName(destination, "bn")}` : ""}` : `Route: ${origin.en} (${origin.code}) → ${country!.country} (city to confirm)${enquiry.language === "bn" ? ` / ${countryName(country!, "bn")}` : ""}`,
    ...(offer ? [`Offer: ${offer.en_title} / ${offer.bn_title}`] : []),
    ...(enquiry.airline ? [`Airline preference: ${enquiry.airline}`] : []),
    `Departure: ${enquiry.departureDate}`,
    `Return: ${enquiry.returnDate || "One way / undecided"}`,
    `Travellers: ${enquiry.travellers}`,
    `Name: ${enquiry.name}`,
    `Contact: ${enquiry.contact}`,
    ...(enquiry.notes ? [`Notes: ${enquiry.notes}`] : []),
    "Please confirm route options and provide a quotation. Availability and pricing require supplier confirmation; opening this draft does not send the enquiry.",
  ].join("\n");
  return whatsappHrefFor(message);
}
