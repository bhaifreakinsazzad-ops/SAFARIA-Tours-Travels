import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SAFARIA Tours & Travels",
    short_name: "SAFARIA",
    description:
      "Flights, travel quotations, visa and Umrah assistance, plus agency partner services in Bangladesh",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#031412",
    theme_color: "#031412",
    categories: ["travel", "business", "navigation"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Request Flight Quote",
        short_name: "Quote",
        description: "Build a custom route quotation on WhatsApp",
        url: "/#sf-travel-form",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Destination Directory",
        short_name: "Destinations",
        description: "Explore curated international & domestic corridors",
        url: "/#sf-destinations",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "B2B Agency SaaS",
        short_name: "B2B SaaS",
        description: "Agency partner launch program and desks",
        url: "/b2b",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Partner Portal",
        short_name: "Partner",
        description: "Sign in to the agency partner workspace",
        url: "/partner",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
