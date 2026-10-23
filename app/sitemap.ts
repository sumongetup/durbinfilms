import type { MetadataRoute } from "next";
import { getWorks } from "@/lib/content";
import { HTML_LANG, LOCALES, localePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

/** Every page in both languages, each listing its other-language twin. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const pages: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/work/", changeFrequency: "weekly", priority: 0.9 },
    { path: "/founder/", changeFrequency: "monthly", priority: 0.7 },
    ...getWorks().map((w) => ({ path: `/work/${w.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
  return LOCALES.flatMap((locale) =>
    pages.map((p) => ({
      url: `${base}${localePath(locale, p.path)}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], `${base}${localePath(l, p.path)}`])),
      },
    })),
  );
}
