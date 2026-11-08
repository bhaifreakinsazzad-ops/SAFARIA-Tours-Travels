import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#041713",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://safaria.vibing.world"),
  title: "SAFARIA Tours & Travels | Your Gateway to Global Travel",
  description:
    "SAFARIA Tours & Travels (Just Another Travel Group) — Verified flight quotations, visa facilitation, umrah packages, and B2B agency infrastructure in Dhaka, Bangladesh.",
  keywords: [
    "SAFARIA",
    "Air ticketing Dhaka",
    "Flight quotation Bangladesh",
    "Travel agency B2B",
    "Umrah packages",
    "Visa facilitation",
  ],
  alternates: {
    canonical: "https://safaria.vibing.world",
    languages: {
      "bn-BD": "https://safaria.vibing.world",
      "en-US": "https://safaria.vibing.world/en",
    },
  },
  openGraph: {
    title: "SAFARIA Tours & Travels | সঠিক ফ্লাইটে শুরু হোক যাত্রা",
    description: "আন্তর্জাতিক ও অভ্যন্তরীণ বিমান টিকেট, দ্রুত কোটেশন ও ডেডিকেটেড সাপোর্ট।",
    url: "https://safaria.vibing.world",
    siteName: "SAFARIA Tours & Travels",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-0 text-safaria-ink antialiased">
        {children}
      </body>
    </html>
  );
}
