import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Noto_Sans_Bengali } from "next/font/google";
import { SAFARIA_CONFIG } from "@/config/constants";
import { PWARegistrar } from "@/components/pwa-registrar";
import { PwaClientShell } from "@/components/pwa-client-shell";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", display: "swap", preload: false });
const ui = Inter({ subsets: ["latin"], variable: "--font-ui", display: "swap", preload: true });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bengali", display: "swap", preload: true });

export const viewport: Viewport = {
  themeColor: "#031412",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SAFARIA_CONFIG.siteUrl),
  title: "SAFARIA Tours & Travels | Your Gateway to Global Travel",
  description: "Premium domestic & international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SAFARIA",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SAFARIA Tours & Travels",
    title: "SAFARIA Tours & Travels | Your Gateway to Global Travel",
    description: "Premium domestic & international flight quotations, visa assistance, and B2B travel agency subscriptions in Bangladesh.",
    locale: "bn_BD",
    alternateLocale: "en_US",
    images: [{ url: "/images/social-share.jpg", width: 1200, height: 630, alt: "SAFARIA journey atlas over Dhaka" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/social-share.jpg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${display.variable} ${ui.variable} ${bengali.variable}`}>
      <body className="font-bn pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0">
        <PWARegistrar />
        {children}
        <PwaClientShell />
      </body>
    </html>
  );
}
