import { AGENCY_PRICING, whatsappHrefFor } from "@/config/constants";
import type { Language } from "./atlas-data";

export type AgencyFields = {
  applicationType: string; agencyName: string; location: string; website: string; businessStatus: string; years: string; businessNotes: string; volume: string;
  requirement: string; interest: "monthlyPlan" | "annualPlan"; fullName: string; phone: string; email: string; contactMethod: string; consent: boolean; trialConsent: boolean;
};
export const initialAgencyFields: AgencyFields = {
  applicationType: "trialRequest", agencyName: "", location: "", website: "", businessStatus: "", years: "", businessNotes: "", volume: "",
  requirement: "", interest: "monthlyPlan", fullName: "", phone: "", email: "", contactMethod: "whatsapp", consent: false, trialConsent: false,
};
export function agencyErrors(fields: AgencyFields) {
  const errors: string[] = [];
  if (!["trialRequest", "subscriptionRequest"].includes(fields.applicationType)) errors.push("applicationType");
  if (!fields.agencyName.trim()) errors.push("agencyName");
  if (!fields.location.trim()) errors.push("location");
  if (!fields.businessStatus) errors.push("businessStatus");
  if (fields.years && (!/^\d+$/.test(fields.years) || Number(fields.years) > 150)) errors.push("years");
  if (!fields.requirement) errors.push("requirement");
  if (!fields.fullName.trim()) errors.push("fullName");
  if (!/^[+0-9().\s-]{6,24}$/.test(fields.phone.trim())) errors.push("phone");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.push("email");
  if (!fields.contactMethod) errors.push("contactMethod");
  if (!fields.consent) errors.push("consent");
  if (!fields.trialConsent) errors.push("trialConsent");
  return errors;
}
export function agencyWhatsappHref(fields: AgencyFields, language: Language) {
  if (agencyErrors(fields).length) throw new Error("Invalid agency application");
  const plan = fields.interest === "annualPlan" ? `Annual BDT ${AGENCY_PRICING.annual}/year` : `Monthly BDT ${AGENCY_PRICING.monthly}/month`;
  const message = [
    language === "bn" ? "SAFARIA — এজেন্সি আবেদন / Agency application" : "SAFARIA — Agency application",
    `Request: ${fields.applicationType}`,
    `Plan interest: ${plan}`,
    `Agency: ${fields.agencyName.trim()}`,
    `Location: ${fields.location.trim()}`,
    ...(fields.website ? [`Website: ${fields.website.trim()}`] : []),
    `Business status: ${fields.businessStatus}`,
    ...(fields.years ? [`Years in business: ${fields.years}`] : []),
    ...(fields.volume ? [`Estimated volume: ${fields.volume}`] : []),
    `Requirement: ${fields.requirement}`,
    ...(fields.businessNotes ? [`Business notes: ${fields.businessNotes}`] : []),
    `Contact: ${fields.fullName.trim()} / ${fields.phone.trim()} / ${fields.email.trim()}`,
    `Preferred contact: ${fields.contactMethod}`,
    "I consent to an application review and understand the 72-hour free trial is subject to verification and fair use. This draft does not activate a trial or subscription.",
  ].join("\n");
  return whatsappHrefFor(message);
}
