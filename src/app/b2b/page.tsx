import type { Metadata } from "next";
import Link from "next/link";
import { AGENCY_PRICING, SAFARIA_CONFIG, whatsappHrefFor } from "@/config/constants";
import AgencyApplicationForm from "./agency-application-form";

export const metadata: Metadata = {
  title: "B2B Agency Membership | SAFARIA Tours & Travels",
  description: "SAFARIA agency membership: transparent subscription plans, six travel operations desks, verified agency onboarding and a clear application process.",
  alternates: { canonical: "/b2b" },
};

const services = [
  { number: "01", title: "FareDesk", bn: "Fare request, quotation ও comparison" },
  { number: "02", title: "BookingDesk", bn: "Booking workflow ও request tracking" },
  { number: "03", title: "ClearMargin", bn: "Payment records ও reconciliation" },
  { number: "04", title: "AfterCare Desk", bn: "Change, refund ও support-case tracking" },
  { number: "05", title: "Verified Workflow", bn: "Agency verification ও documented process" },
  { number: "06", title: "PartnerGrowth", bn: "Partner history ও performance reports" },
];
const money = (amount: number) => new Intl.NumberFormat("bn-BD").format(amount);

export default function B2BMembershipPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#041713] text-[#f8f5ec]">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-6 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d6b779]/20 pb-5">
          <Link href="/" className="text-2xl font-semibold tracking-[.16em] text-[#d6b779]">SAFARIA<span className="ml-2 text-xs tracking-normal text-white/55">TOURS & TRAVELS</span></Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-white/75 underline-offset-4 hover:underline">Partner Login</Link>
            <a href="#apply" className="rounded-full bg-[#d6b779] px-5 py-3 font-semibold text-[#041713]">Apply for Membership</a>
          </div>
        </header>
        <section className="relative isolate grid gap-10 py-20 md:grid-cols-[1.15fr_.85fr] md:items-center md:py-28">
          <div className="absolute -left-44 -top-28 -z-10 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[.32em] text-[#d6b779]">SAFARIA AGENCY PARTNER NETWORK</p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[1.07] tracking-tight md:text-7xl">Your Agency.<br /><span className="text-[#d6b779]">Our Travel Operations.</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/70 md:text-lg">নিজের এজেন্সি ও ক্লায়েন্ট আপনারই থাকুক। Fare requests, booking records, financial visibility এবং after-sales coordination পরিচালনা করুন একটি সংগঠিত B2B workspace-এ।</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#apply" className="rounded-xl bg-[#d6b779] px-7 py-4 text-sm font-bold text-[#041713]">Apply as an Agency Partner</a>
              <a href={whatsappHrefFor("Hello SAFARIA, I would like a B2B membership demonstration and current onboarding details.")} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[#d6b779]/50 px-7 py-4 text-sm font-semibold text-[#f8f5ec]">Request a Demo</a>
            </div>
            <p className="mt-5 text-xs leading-6 text-white/50">Membership is subject to agency verification, approved commercial terms and service availability. Application is not a booking or payment.</p>
          </div>
          <div className="rounded-[32px] border border-[#d6b779]/25 bg-gradient-to-br from-[#123e32] to-[#071f1a] p-8 shadow-2xl md:p-10">
            <p className="text-xs font-semibold tracking-[.24em] text-[#d6b779]">THE PARTNER ADVANTAGE</p>
            <div className="mt-8 space-y-6">
              {[
                ["01", "One organised request workflow", "কোটেশন, case status ও follow-up এক জায়গায়।"],
                ["02", "Clear financial records", "Booking-wise cost এবং payment transparency।"],
                ["03", "Accountable after-sales", "Refund/change requests-এর documented history।"],
              ].map((item) => (
                <div key={item[0]} className="flex gap-4 border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <span className="font-serif text-3xl text-[#d6b779]">{item[0]}</span>
                  <div><h2 className="text-lg font-semibold">{item[1]}</h2><p className="mt-2 text-sm leading-6 text-white/60">{item[2]}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-10" aria-labelledby="service-heading">
          <div className="mb-8"><p className="text-xs tracking-[.25em] text-[#d6b779]">SIX SPECIALISED DESKS</p><h2 id="service-heading" className="mt-3 font-serif text-4xl md:text-5xl">Everything in one partner workspace.</h2></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.number} className="rounded-2xl border border-[#d6b779]/20 bg-white/[.035] p-7">
                <span className="text-xs text-[#d6b779]">{service.number} / OPERATIONS</span>
                <h3 className="mt-6 text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{service.bn}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="plans" className="scroll-mt-20 py-20" aria-labelledby="plans-heading">
          <div className="max-w-2xl"><p className="text-xs tracking-[.25em] text-[#d6b779]">MEMBERSHIP PLANS</p><h2 id="plans-heading" className="mt-3 font-serif text-4xl md:text-5xl">Simple. Transparent. Agency-first.</h2><p className="mt-5 leading-8 text-white/65">নিচের মূল্য আমাদের প্রস্তাবিত B2B membership rate। চূড়ান্ত service scope, eligibility, taxes এবং activation লিখিত agreement অনুযায়ী প্রযোজ্য।</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-[#d6b779]/60 bg-[#092b23] p-8 md:p-10">
              <p className="text-sm text-[#d6b779]">MONTHLY PARTNER</p>
              <p className="mt-6 font-serif text-5xl">৳{money(AGENCY_PRICING.monthly)}<span className="ml-2 font-sans text-sm text-white/60">/ মাস</span></p>
              <p className="mt-5 text-sm leading-7 text-white/65">Flexible monthly membership • Verified agency access • Partner workspace • Structured service requests</p>
              <a href="#apply" className="mt-8 inline-flex rounded-xl bg-[#d6b779] px-6 py-4 font-semibold text-[#041713]">Choose Monthly</a>
            </article>
            <article className="rounded-3xl border border-white/15 bg-white/[.035] p-8 md:p-10">
              <p className="text-sm text-[#d6b779]">ANNUAL PARTNER</p>
              <p className="mt-6 font-serif text-5xl">৳{money(AGENCY_PRICING.annual)}<span className="ml-2 font-sans text-sm text-white/60">/ বছর</span></p>
              <p className="mt-5 text-sm leading-7 text-white/65">১২টি মাসিক subscription-এর তুলনায় বছরে ৳{money(AGENCY_PRICING.annualSavings)} কম। Annual activation subject to signed terms.</p>
              <a href="#apply" className="mt-8 inline-flex rounded-xl border border-[#d6b779]/60 px-6 py-4 font-semibold text-[#d6b779]">Choose Annual</a>
            </article>
          </div>
          <div className="mt-6 rounded-2xl border border-[#d6b779]/20 bg-white/[.025] p-6 text-sm leading-8 text-white/70">
            <p><strong className="text-[#d6b779]">৭২ ঘণ্টার trial:</strong> শুধুমাত্র যোগ্য এজেন্সির manual verification ও admin approval-এর পরে।</p>
            <p><strong className="text-[#d6b779]">0% SAFARIA markup:</strong> প্রযোজ্য হলে শুধুমাত্র eligible airfare booking-এ, সংশ্লিষ্ট supplier contract ও regulatory authorization অনুযায়ী। Airline fare, taxes ও third-party charges আলাদা।</p>
            <p><strong className="text-[#d6b779]">Important:</strong> Enquiry বা membership application কোনো confirmed booking নয়। Payment collection ও ticket issuance কেবল অনুমোদিত channel-এ চালু করা হবে।</p>
          </div>
        </section>
        <section id="apply" className="scroll-mt-10 grid gap-10 rounded-[32px] border border-[#d6b779]/25 bg-[#0b2d24] p-6 md:grid-cols-[.8fr_1.2fr] md:p-12">
          <div><p className="text-xs tracking-[.25em] text-[#d6b779]">APPLY TO JOIN</p><h2 className="mt-4 font-serif text-4xl md:text-5xl">Become a SAFARIA Partner.</h2><p className="mt-6 text-sm leading-8 text-white/65">এজেন্সির প্রাথমিক তথ্য দিন। WhatsApp-এ তৈরি হওয়া বার্তা নিজে Send করলে আমাদের টিম আবেদনটি গ্রহণ করে verification ও onboarding-এর পরবর্তী ধাপ জানাতে পারবে।</p><p className="mt-5 text-xs leading-6 text-white/50">এই public form-এ ট্রেড লাইসেন্সের ছবি, NID, passport বা payment information পাঠাবেন না।</p></div>
          <AgencyApplicationForm />
        </section>
        <footer className="mt-20 flex flex-wrap justify-between gap-4 border-t border-[#d6b779]/20 pt-7 text-xs text-white/55"><span>© {new Date().getFullYear()} SAFARIA Tours & Travels</span><span>Agency membership enquiries · Bangladesh</span><a href={whatsappHrefFor("Hello SAFARIA, I have a question about B2B partnership eligibility.")} target="_blank" rel="noopener noreferrer" className="text-[#d6b779]">Contact Partnership Desk</a></footer>
      </div>
    </main>
"use client";

import dynamic from "next/dynamic";

const B2BLandingClient = dynamic(() => import("@/components/b2b-landing-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#031412] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c5a059] border-t-transparent" />
    </div>
  ),
});

export default function B2BPage() {
  return <B2BLandingClient />;
}
