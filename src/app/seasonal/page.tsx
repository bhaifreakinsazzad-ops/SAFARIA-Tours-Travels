import type { Metadata } from "next";
import { SeasonalLandingClient } from "@/components/seasonal-landing-client";
import { SAFARIA_CONFIG } from "@/config/constants";

export const metadata: Metadata = {
  title: "Seasonal Travel Enquiries & Agency Planning | SAFARIA",
  description:
    "Explore seasonal travel planning enquiries and B2B agency workflow previews from SAFARIA. Domestic, Saudi, student and premium travel. Fares and availability require confirmation.",
  alternates: { canonical: "/seasonal" },
  openGraph: {
    type: "website",
    url: "/seasonal",
    siteName: "SAFARIA Tours & Travels",
    locale: "bn_BD",
    alternateLocale: "en_US",
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
  twitter: {
    card: "summary_large_image",
    title: "SAFARIA | Seasonal Travel Enquiries & Agency Planning",
    description:
      "Plan domestic, Saudi, student and premium travel enquiries or register agency partnership interest with SAFARIA.",
    images: ["/images/social-share.jpg"],
  },
  robots: { index: true, follow: true },
};

const seasonalJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "SAFARIA Seasonal Travel Enquiries & Agency Planning",
  url: `${SAFARIA_CONFIG.siteUrl}/seasonal`,
  description:
    "Bilingual travel quotation enquiries for travellers and verified-first B2B operational workflow previews for Bangladeshi travel agencies.",
  isPartOf: {
    "@type": "WebSite",
    name: "SAFARIA Tours & Travels",
    url: SAFARIA_CONFIG.siteUrl,
  },
  provider: {
    "@type": "TravelAgency",
    name: "SAFARIA Tours & Travels",
    url: SAFARIA_CONFIG.siteUrl,
    areaServed: "BD",
  },
};

export default async function SeasonalPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  const { audience } = await searchParams;
  const resolvedAudience = Array.isArray(audience) ? audience[0] : audience;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seasonalJsonLd) }}
      />
      <SeasonalLandingClient initialAudience={resolvedAudience === "b2b" ? "b2b" : "b2c"} />
    </>
  );
}
