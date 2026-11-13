import type { MetadataRoute } from "next";
import { SAFARIA_CONFIG } from "@/config/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/partner", "/login", "/offline"],
    },
    sitemap: `${SAFARIA_CONFIG.siteUrl}/sitemap.xml`,
  };
}
