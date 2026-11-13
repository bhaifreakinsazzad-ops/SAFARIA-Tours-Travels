import type { Metadata } from "next";
import B2BLandingClient from "@/components/b2b-landing-client";

export const metadata: Metadata = {
  title: "B2B Agency Membership | SAFARIA Tours & Travels",
  description:
    "SAFARIA agency partner network: interactive Agency Needs Finder, six specialized travel operations desks, transparent BDT 5,999 monthly and BDT 69,999 annual plans, and WhatsApp-first onboarding.",
  alternates: { canonical: "/b2b" },
};

export default function B2BPage() {
  return <B2BLandingClient />;
}
