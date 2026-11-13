import type { Metadata } from "next";
import { SeasonalLandingClient } from "@/components/seasonal-landing-client";

export const metadata: Metadata = {
  title: "Seasonal Travel Enquiries & Agency Planning | SAFARIA",
  description:
    "Explore seasonal travel planning enquiries and B2B agency workflow previews from SAFARIA. Domestic, Saudi, student and premium travel. Fares and availability require confirmation.",
  alternates: { canonical: "/seasonal" },
  openGraph: {
    type: "website",
    url: "/seasonal",
    title: "SAFARIA | Plan Travel. Explore Agency Partnerships.",
    description:
      "One landing page for travel enquiries and verified-first B2B agency pre-registration. No unconfirmed fare discounts.",
    images: [
      {
        url: "/images/social-share.jpg",
        width: 1200,
        height: 630,
        alt: "SAFARIA travel planning and destination enquiries",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/images/social-share.jpg"] },
};

export default async function SeasonalPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  const { audience } = await searchParams;
  return <SeasonalLandingClient initialAudience={audience === "b2b" ? "b2b" : "b2c"} />;
}
