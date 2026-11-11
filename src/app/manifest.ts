import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SAFARIA Tours & Travels",
    short_name: "SAFARIA",
    description: "Flights, travel quotations, visa and Umrah assistance, plus agency partner services in Bangladesh",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#031412",
    theme_color: "#031412",
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
  };
}
