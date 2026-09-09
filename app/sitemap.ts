import type { MetadataRoute } from "next";
import { getWorks } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/work/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/founder/`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...getWorks().map((w) => ({
      url: `${base}/work/${w.slug}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
