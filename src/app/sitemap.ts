import type { MetadataRoute } from "next";
import { SAFARIA_CONFIG } from "@/config/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SAFARIA_CONFIG.siteUrl}/`, changeFrequency: "weekly", priority: 1 }];
}
