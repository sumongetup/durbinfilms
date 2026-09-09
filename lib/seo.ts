import type { Metadata } from "next";
import { getByPlatform, getFounder, getSite, getWorks } from "./content";
import { featuringOf, formatLabel, isPlaceholder, isoDuration, outletOf, playableOf } from "./work";
import type { Work } from "./types";

/** The site URL from site.json, or localhost while it is still a placeholder. */
export function siteUrl(): string {
  const raw = getSite().url;
  if (!raw || raw.includes("[")) return "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

const ORG_ID = () => `${siteUrl()}/#organization`;
const SITE_ID = () => `${siteUrl()}/#website`;

export function defaultMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: site.title, template: `%s — ${site.name}` },
    description: site.description,
    applicationName: site.name,
    keywords: [
      "Durbin Films",
      "Bangla natok",
      "Bangladeshi drama production house",
      "television drama Dhaka",
      "web series Bangladesh",
      "Eid natok",
      "brand film production Dhaka",
      "TVC production Bangladesh",
    ],
    authors: [{ name: site.name, url: siteUrl() }],
    creator: site.name,
    publisher: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.title,
      description: site.description,
      url: "/",
      locale: "en_GB",
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [site.ogImage],
    },
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
    ...(site.googleSiteVerification ? { verification: { google: site.googleSiteVerification } } : {}),
  };
}

export function founderMetadata(): Metadata {
  const founder = getFounder();
  const description = clampDescription(founder.seo.description);
  return {
    title: { absolute: founder.seo.title },
    description,
    alternates: { canonical: "/founder/" },
    openGraph: {
      type: "profile",
      title: founder.seo.title,
      description,
      url: "/founder/",
      images: [{ url: founder.portrait, width: 1200, height: 1500, alt: founder.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: founder.seo.title,
      description,
      images: [founder.portrait],
    },
  };
}

/**
 * Trims a description to what a search result actually shows. Cuts at the
 * last sentence that fits, or failing that at a word boundary.
 */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max + 1);
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "));
  if (sentenceEnd > max * 0.55) return clean.slice(0, sentenceEnd + 1);

  const wordEnd = window.lastIndexOf(" ");
  return `${clean.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[,;:.\s]+$/, "")}…`;
}

/** One factual sentence for search snippets when no synopsis has been written. */
export function workDescription(work: Work): string {
  if (!isPlaceholder(work.synopsis)) return work.synopsis;
  const site = getSite();
  const outlet = outletOf(work);
  const cast = featuringOf(work);
  const play = playableOf(work);
  const kind = formatLabel(work);
  const kindText = /^Eid/.test(kind) ? kind : kind.charAt(0).toLowerCase() + kind.slice(1);
  const parts = [
    `${work.title} is a ${/^\d{4}$/.test(work.year) ? `${work.year} ` : ""}${kindText} from ${site.name}` +
      (outlet && !isPlaceholder(outlet) ? `, released on ${outlet}` : "") +
      (cast ? `, starring ${cast}` : "") +
      ".",
  ];
  if (work.views) parts.push(`${work.views} views on YouTube.`);
  if (play) parts.push(play.kind === "trailer" ? "Watch the trailer and see the cast and crew." : "Watch the full video and see the cast and crew.");
  return parts.join(" ");
}

export function workMetadata(work: Work): Metadata {
  const site = getSite();
  const description = clampDescription(workDescription(work));
  const year = /^\d{4}$/.test(work.year) ? ` (${work.year})` : "";
  const kind = formatLabel(work);
  // The layout appends " — Durbin Films" (15 chars), and a search result shows
  // about 60 before truncating, so drop the format, then the year, to fit.
  const budget = 60 - (site.name.length + 3);
  const title = [`${work.title}${year} | ${kind}`, `${work.title}${year}`, work.title].find((t) => t.length <= budget) ?? work.title;
  return {
    title,
    description,
    alternates: { canonical: `/work/${work.slug}/` },
    openGraph: {
      type: work.type === "series" ? "video.tv_show" : "video.movie",
      title: `${work.title}${year} — ${site.name}`,
      description,
      url: `/work/${work.slug}/`,
      images: [{ url: absoluteUrl(work.backdrop), width: 1280, height: 720, alt: work.title }],
      ...(work.released ? { releaseDate: work.released } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${work.title}${year} — ${site.name}`,
      description,
      images: [absoluteUrl(work.backdrop)],
    },
  };
}

type JsonLd = Record<string, unknown>;

function organizationNode(): JsonLd {
  const site = getSite();
  const sameAs = site.social.map((s) => s.href).filter((h) => h && !h.includes("["));
  const data: JsonLd = {
    "@type": "Organization",
    "@id": ORG_ID(),
    name: site.name,
    url: `${siteUrl()}/`,
    logo: { "@type": "ImageObject", url: absoluteUrl(site.ogImage), width: 1200, height: 630 },
    description: site.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.city,
      addressCountry: "BD",
      ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
      ...(isPlaceholder(site.address.street) ? {} : { streetAddress: site.address.street }),
    },
    founder: { "@type": "Person", "@id": `${siteUrl()}/founder/#person`, name: getFounder().name, url: absoluteUrl("/founder/") },
  };
  if (!isPlaceholder(site.email)) data.email = site.email;
  if (!isPlaceholder(site.phone)) data.telephone = site.phone;
  if (site.founded) data.foundingDate = site.founded;
  if (site.founded) data.foundingLocation = { "@type": "Place", name: "Dhaka, Bangladesh" };
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

/** Organization plus WebSite (with site search) for the root layout. */
export function organizationJsonLd(): JsonLd {
  const site = getSite();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebSite",
        "@id": SITE_ID(),
        url: `${siteUrl()}/`,
        name: site.name,
        description: site.description,
        publisher: { "@id": ORG_ID() },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl()}/work/?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** FAQPage for the home page questions, so Google can show them as rich results. */
export function faqJsonLd(items: { q: string; a: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** ItemList of the studio's own dramas, for the home page. */
export function homeJsonLd(): JsonLd {
  const dramas = getByPlatform("DURBIN FILMS").filter((w) => w.type === "drama");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dramas and telefilms by Durbin Films",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: dramas.length,
    itemListElement: dramas.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: w.title,
      url: absoluteUrl(`/work/${w.slug}/`),
    })),
  };
}

export function personJsonLd(): JsonLd {
  const founder = getFounder();
  const site = getSite();
  const sameAs = [...(founder.contact.links ?? []).map((l) => l.href), ...site.social.map((s) => s.href)].filter(
    (h) => h && !h.includes("["),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl()}/founder/#person`,
    name: founder.name,
    jobTitle: "Founder",
    description: founder.seo.description,
    image: absoluteUrl(founder.portrait),
    url: absoluteUrl("/founder/"),
    worksFor: { "@id": ORG_ID() },
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function breadcrumb(items: { name: string; path: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/**
 * Detail page graph: the creative work (Movie, TVSeries or MusicVideoObject),
 * a VideoObject for the trailer or full video so Google can show a video
 * result, and the breadcrumb trail.
 */
export function productionJsonLd(work: Work): JsonLd {
  const site = getSite();
  const url = absoluteUrl(`/work/${work.slug}/`);
  const description = workDescription(work);
  const type = work.type === "series" ? "TVSeries" : work.type === "song" ? "MusicVideoObject" : "Movie";
  const creative: JsonLd = {
    "@type": type,
    "@id": `${url}#work`,
    name: work.title,
    ...(work.titleBn ? { alternateName: work.titleBn } : {}),
    url,
    image: absoluteUrl(work.backdrop),
    description,
    inLanguage: "bn",
    productionCompany: { "@id": ORG_ID() },
  };
  if (/^\d{4}$/.test(work.year)) creative.datePublished = work.released ?? work.year;
  if (work.type === "series") creative.numberOfEpisodes = work.episodes;
  const outlet = outletOf(work);
  if (!isPlaceholder(outlet)) creative.publisher = { "@type": "Organization", name: outlet };
  const director = work.credits?.find((c) => /direct/i.test(c.role));
  if (director && !isPlaceholder(director.name)) creative.director = { "@type": "Person", name: director.name };
  const actors = featuringOf(work);
  if (actors) creative.actor = actors.split(", ").map((name) => ({ "@type": "Person", name }));
  if (work.durationSeconds) creative.duration = isoDuration(work.durationSeconds);

  const graph: JsonLd[] = [creative];

  const play = playableOf(work);
  if (play && work.released) {
    const video: JsonLd = {
      "@type": "VideoObject",
      "@id": `${url}#video`,
      name: play.kind === "trailer" ? `${work.title} trailer` : work.title,
      description,
      thumbnailUrl: [absoluteUrl(work.backdrop)],
      uploadDate: work.released,
      embedUrl: `https://www.youtube-nocookie.com/embed/${play.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${play.id}`,
      publisher: { "@id": ORG_ID() },
      isFamilyFriendly: true,
      inLanguage: "bn",
    };
    if (play.kind === "full" && work.durationSeconds) video.duration = isoDuration(work.durationSeconds);
    if (work.views && play.kind === "full") {
      const n = parseViews(work.views);
      if (n) video.interactionStatistic = { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: n };
    }
    creative.trailer = play.kind === "trailer" ? { "@id": `${url}#video` } : undefined;
    if (play.kind !== "trailer") delete creative.trailer;
    graph.push(video);
  }

  graph.push(breadcrumb([{ name: site.name, path: "/" }, { name: "All work", path: "/work/" }, { name: work.title, path: `/work/${work.slug}/` }]));

  return { "@context": "https://schema.org", "@graph": graph };
}

/** "41M" -> 41000000, "9.6M" -> 9600000, "773K" -> 773000. */
function parseViews(v: string): number | null {
  const m = v.trim().match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] ?? 1;
  return Math.round(n * mult);
}

export function allWorkJsonLd(): JsonLd {
  const site = getSite();
  const works = getWorks();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl()}/work/#page`,
        name: `All work by ${site.name}`,
        url: absoluteUrl("/work/"),
        isPartOf: { "@id": SITE_ID() },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: works.length,
          itemListElement: works.map((w, i) => ({ "@type": "ListItem", position: i + 1, name: w.title, url: absoluteUrl(`/work/${w.slug}/`) })),
        },
      },
      breadcrumb([{ name: site.name, path: "/" }, { name: "All work", path: "/work/" }]),
    ],
  };
}

export function allWorkPaths(): string[] {
  return getWorks().map((w) => `/work/${w.slug}/`);
}
