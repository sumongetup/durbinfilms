import type { Metadata } from "next";
import { BN_KEYWORDS, BN_NAMES, getByPlatform, getChannels, getFounder, getSite, getWorks } from "./content";
import { HTML_LANG, LOCALES, OG_LOCALE, UI, countLabel, digits, localePath, otherLocale, parseCount, type Locale } from "./i18n";
import { featuringOf, formatLabel, isPlaceholder, isoDuration, outletOf, playableOf, producerLine } from "./work";
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
const SITE_ID = (locale: Locale) => `${siteUrl()}${localePath(locale, "/")}#website`;
const PERSON_ID = () => `${siteUrl()}/founder/#person`;
const NEWS_ID = () => `${siteUrl()}/#durbin-news`;

/**
 * Every way the founder's name is written, in both scripts, the page
 * language's own form first: মো. সুমন হাওলাদার, মোঃ সুমন হাওলাদার,
 * Md Sumon Howlader and so on. People search all of them.
 */
export function founderNames(locale: Locale = "en"): string[] {
  const here = getFounder(locale);
  const there = getFounder(otherLocale(locale));
  return [here.name, ...(here.alternateNames ?? []), there.name, ...(there.alternateNames ?? [])].filter(
    (n, i, all) => all.indexOf(n) === i,
  );
}

/** Format words as people type them into a search box: "Bangla Natok", "ঈদের নাটক". */
function searchKind(work: Work, locale: Locale): string {
  const t = UI[locale].searchKinds;
  const badge = work.badge.toUpperCase();
  switch (work.type) {
    case "drama":
      return badge === "EID SPECIAL" ? t.eid : badge === "TELEFILM" ? t.telefilm : t.natok;
    case "series":
      return t.serial;
    case "short":
      return t.short;
    case "song":
      return badge.includes("OST") ? t.ost : t.song;
    case "brand":
      return badge === "TVC" ? t.tvc : t.brand;
    case "documentary":
      return t.documentary;
  }
}

/**
 * Canonical plus hreflang for one page. `path` is the English path; the
 * Bangla copy lives at the same path under /bn/. English is the x-default.
 */
export function alternatesFor(path: string, locale: Locale): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], localePath(l, path)]));
  return { canonical: localePath(locale, path), languages: { ...languages, "x-default": path } };
}

/** Open Graph locale for the page and the one it is also available in. */
function ogLocale(locale: Locale) {
  return { locale: OG_LOCALE[locale], alternateLocale: [OG_LOCALE[otherLocale(locale)]] };
}

const EN_KEYWORDS = [
  "Durbin Films",
  "Bangla natok",
  "Bangladeshi drama production house",
  "television drama Dhaka",
  "web series Bangladesh",
  "Eid natok",
  "brand film production Dhaka",
  "TVC production Bangladesh",
];

export function defaultMetadata(locale: Locale = "en"): Metadata {
  const site = getSite(locale);
  return {
    metadataBase: new URL(siteUrl()),
    // A pipe, not an em dash, to match the home title and the house style.
    title: { default: site.title, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    keywords: locale === "bn" ? BN_KEYWORDS : EN_KEYWORDS,
    authors: [{ name: site.name, url: siteUrl() }],
    creator: site.name,
    publisher: site.name,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: site.title,
      description: site.description,
      url: localePath(locale, "/") === "/" ? siteUrl() : localePath(locale, "/"),
      ...ogLocale(locale),
      images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [{ url: site.ogImage, alt: site.name }],
    },
    alternates: alternatesFor("/", locale),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
    ...(site.googleSiteVerification ? { verification: { google: site.googleSiteVerification } } : {}),
  };
}

export function workIndexMetadata(locale: Locale = "en"): Metadata {
  const site = getSite(locale);
  const t = UI[locale].workIndex;
  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor("/work/", locale),
    openGraph: {
      type: "website",
      title: `${t.title} | ${site.name}`,
      description: t.description,
      url: localePath(locale, "/work/"),
      ...ogLocale(locale),
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.title} | ${site.name}`,
      description: t.description,
      images: [{ url: "/og-image.png", alt: site.name }],
    },
  };
}

export function founderMetadata(locale: Locale = "en"): Metadata {
  const founder = getFounder(locale);
  const description = clampDescription(founder.seo.description, locale === "bn" ? 180 : 158);
  const ventures = founder.ventures.items.map((v) => v.name);
  return {
    title: { absolute: founder.seo.title },
    description,
    keywords: [...founderNames(locale), ...ventures],
    alternates: alternatesFor("/founder/", locale),
    openGraph: {
      type: "profile",
      title: founder.seo.title,
      description,
      url: localePath(locale, "/founder/"),
      ...ogLocale(locale),
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
 * last sentence that fits, or failing that at a word boundary. `minSentence`
 * is how much of `max` a whole sentence must fill to be preferred over a cut.
 */
export function clampDescription(text: string, max = 158, minSentence = 0.55): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max + 1);
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "), window.lastIndexOf("। "));
  if (sentenceEnd > max * minSentence) return clean.slice(0, sentenceEnd + 1);

  const wordEnd = window.lastIndexOf(" ");
  return `${clean.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[,;:.।\s]+$/, "")}…`;
}

/** One factual sentence for search snippets when no synopsis has been written. */
export function workDescription(work: Work, locale: Locale = "en"): string {
  if (!isPlaceholder(work.synopsis)) return work.synopsis;
  const site = getSite(locale);
  const outlet = outletOf(work);
  const cast = featuringOf(work);
  const play = playableOf(work);
  const kind = formatLabel(work, locale);
  const year = /^\d{4}$/.test(work.year) ? work.year : "";

  if (locale === "bn") {
    const parts = [
      `${work.title}, ${site.name}-এর ${year ? `${digits("bn", year)} সালের ` : ""}${kind}` +
        (outlet && !isPlaceholder(outlet) ? `, প্রকাশিত হয়েছে ${outlet}-এ` : "") +
        "।",
    ];
    if (cast) parts.push(`অভিনয় করেছেন ${cast}।`);
    if (work.views) parts.push(`ইউটিউবে দেখা হয়েছে ${countLabel("bn", work.views)} বার।`);
    if (play) parts.push(play.kind === "trailer" ? "এখানে ট্রেলার দেখুন, জানুন শিল্পী ও কলাকুশলীদের কথা।" : "এখানে পুরো ভিডিও দেখুন, জানুন শিল্পী ও কলাকুশলীদের কথা।");
    return parts.join(" ");
  }

  const kindText = /^Eid/.test(kind) ? kind : kind.charAt(0).toLowerCase() + kind.slice(1);
  const parts = [
    `${work.title} is a ${year ? `${year} ` : ""}${kindText} from ${site.name}` +
      (outlet && !isPlaceholder(outlet) ? `, released on ${outlet}` : "") +
      (cast ? `, starring ${cast}` : "") +
      ".",
  ];
  if (work.views) parts.push(`${work.views} views on YouTube.`);
  if (play) parts.push(play.kind === "trailer" ? "Watch the trailer and see the cast and crew." : "Watch the full video and see the cast and crew.");
  return parts.join(" ");
}

export function workMetadata(work: Work, locale: Locale = "en"): Metadata {
  const site = getSite(locale);
  const path = `/work/${work.slug}/`;
  // Bangla vowel signs and conjuncts take extra code units per visible letter, so allow more.
  const max = locale === "bn" ? 180 : 158;
  // The producer line always survives the trim: the synopsis gives way to it,
  // ending on a whole sentence even if that leaves it short.
  const producer = producerLine(work, locale);
  const description = producer
    ? `${clampDescription(workDescription(work, locale), max - producer.length - 1, 0.25)} ${producer}`
    : clampDescription(workDescription(work, locale), max);
  const year = /^\d{4}$/.test(work.year) ? ` (${digits(locale, work.year)})` : "";
  // "Bangla Natok" rather than "Single episode drama": the words people search with.
  const kind = searchKind(work, locale);
  // The layout appends " | Durbin Films" (15 chars), and a search result shows
  // about 60 before truncating, so drop the format, then the year, to fit.
  const budget = 60 - (site.name.length + 3);
  const title = [`${work.title}${year} | ${kind}`, `${work.title}${year}`, work.title].find((t) => t.length <= budget) ?? work.title;
  return {
    title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: {
      type: work.type === "series" ? "video.tv_show" : "video.movie",
      title: `${work.title}${year} | ${site.name}`,
      description,
      url: localePath(locale, path),
      ...ogLocale(locale),
      images: [{ url: absoluteUrl(work.backdrop), width: 1280, height: 720, alt: work.title }],
      ...(work.released ? { releaseDate: work.released } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${work.title}${year} | ${site.name}`,
      description,
      images: [absoluteUrl(work.backdrop)],
    },
  };
}

type JsonLd = Record<string, unknown>;

function organizationNode(): JsonLd {
  const site = getSite();
  // Every channel in the network counts as the same entity elsewhere on
  // the web, which is what lets search engines join them up.
  const sameAs = [
    ...site.social.map((s) => s.href),
    ...getChannels().channels.map((c) => c.url),
  ].filter((h, i, all) => h && !h.includes("[") && all.indexOf(h) === i);
  const data: JsonLd = {
    // Also a LocalBusiness: there is a real studio at a real address in
    // Dhaka, which is what lets it surface for local searches.
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID(),
    name: site.name,
    // The Bangla spellings people search for, so a query in Bangla finds the same studio.
    alternateName: BN_NAMES,
    image: absoluteUrl(site.ogImage),
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
    founder: {
      "@type": "Person",
      "@id": PERSON_ID(),
      name: getFounder().name,
      alternateName: founderNames("en").slice(1),
      url: absoluteUrl("/founder/"),
    },
  };
  if (!isPlaceholder(site.email)) data.email = site.email;
  if (!isPlaceholder(site.phone)) data.telephone = site.phone;
  if (site.founded) data.foundingDate = site.founded;
  if (site.founded) data.foundingLocation = { "@type": "Place", name: "Dhaka, Bangladesh" };
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

/** Organization plus WebSite (with site search) for the root layout. */
export function organizationJsonLd(locale: Locale = "en"): JsonLd {
  const site = getSite(locale);
  const other = getSite(otherLocale(locale));
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      {
        "@type": "WebSite",
        "@id": SITE_ID(locale),
        url: absoluteUrl(localePath(locale, "/")),
        name: site.name,
        alternateName: other.name,
        description: site.description,
        publisher: { "@id": ORG_ID() },
        inLanguage: HTML_LANG[locale],
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(localePath(locale, "/work/"))}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** FAQPage for the home page questions, so Google can show them as rich results. */
export function faqJsonLd(items: { q: string; a: string }[], locale: Locale = "en"): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: HTML_LANG[locale],
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/** ItemList of the studio's own dramas, for the home page. */
export function homeJsonLd(locale: Locale = "en"): JsonLd {
  const dramas = getByPlatform("DURBIN FILMS", locale).filter((w) => w.type === "drama");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: UI[locale].workIndex.homeList,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: dramas.length,
    itemListElement: dramas.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: w.title,
      url: absoluteUrl(localePath(locale, `/work/${w.slug}/`)),
    })),
  };
}

/**
 * The founder page as Google's ProfilePage: the page, the person it is about
 * (with every spelling of the name), Durbin News as the other organisation
 * he founded, and the breadcrumb trail.
 */
export function founderJsonLd(locale: Locale = "en"): JsonLd {
  const founder = getFounder(locale);
  const site = getSite();
  const page = absoluteUrl(localePath(locale, "/founder/"));
  const sameAs = [...(founder.contact.links ?? []).map((l) => l.href), ...site.social.map((s) => s.href)].filter(
    (h, i, all) => h && !h.includes("[") && all.indexOf(h) === i,
  );
  const news = getSite("en").network?.find((n) => /durbinnews/.test(n.href));
  const newsBn = getSite("bn").network?.find((n) => /durbinnews/.test(n.href));

  const person: JsonLd = {
    "@type": "Person",
    "@id": PERSON_ID(),
    name: founder.name,
    alternateName: founderNames(locale).slice(1),
    jobTitle: UI[locale].founder.jobTitle,
    description: founder.seo.description,
    image: { "@type": "ImageObject", url: absoluteUrl(founder.portrait), width: 1200, height: 1500, caption: founder.name },
    url: page,
    mainEntityOfPage: { "@id": `${page}#page` },
    worksFor: [{ "@id": ORG_ID() }, ...(news ? [{ "@id": NEWS_ID() }] : [])],
    knowsAbout: UI[locale].founder.knowsAbout,
    nationality: { "@type": "Country", name: "Bangladesh" },
    address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const graph: JsonLd[] = [
    {
      "@type": "ProfilePage",
      "@id": `${page}#page`,
      url: page,
      name: founder.seo.title,
      inLanguage: HTML_LANG[locale],
      isPartOf: { "@id": SITE_ID(locale) },
      dateModified: new Date().toISOString(),
      mainEntity: { "@id": PERSON_ID() },
      breadcrumb: { "@id": `${page}#breadcrumb` },
    },
    person,
  ];
  if (news) {
    graph.push({
      "@type": "NewsMediaOrganization",
      "@id": NEWS_ID(),
      name: news.label,
      ...(newsBn ? { alternateName: newsBn.label } : {}),
      url: news.href,
      founder: { "@id": PERSON_ID() },
      ...(news.links?.length ? { sameAs: news.links.map((l) => l.href) } : {}),
    });
  }
  graph.push({
    ...breadcrumb([
      { name: getSite(locale).name, path: localePath(locale, "/") },
      { name: founder.name, path: localePath(locale, "/founder/") },
    ]),
    "@id": `${page}#breadcrumb`,
  });

  return { "@context": "https://schema.org", "@graph": graph };
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
export function productionJsonLd(work: Work, locale: Locale = "en"): JsonLd {
  const site = getSite(locale);
  const url = absoluteUrl(localePath(locale, `/work/${work.slug}/`));
  const description = [workDescription(work, locale), producerLine(work, locale)].filter(Boolean).join(" ");
  const type = work.type === "series" ? "TVSeries" : work.type === "song" ? "MusicVideoObject" : "Movie";
  const creative: JsonLd = {
    "@type": type,
    "@id": `${url}#work`,
    name: work.title,
    ...(work.altTitle ? { alternateName: work.altTitle } : {}),
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
  // When the studio's founder produced it, point at his profile rather than a bare name.
  const producer = work.credits?.find((c) => /^producer$/i.test(c.role));
  const names = founderNames(locale).map((n) => n.toLowerCase());
  if (producer && names.includes(producer.name.toLowerCase())) creative.producer = { "@id": PERSON_ID() };
  const actors = featuringOf(work);
  if (actors) creative.actor = actors.split(", ").map((name) => ({ "@type": "Person", name }));
  if (work.durationSeconds) creative.duration = isoDuration(work.durationSeconds);

  const graph: JsonLd[] = [creative];

  const play = playableOf(work);
  if (play && work.released) {
    const video: JsonLd = {
      "@type": "VideoObject",
      "@id": `${url}#video`,
      name: play.kind === "trailer" ? UI[locale].trailer.frameTitle(work.title) : work.title,
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
      const n = parseCount(work.views);
      if (n) video.interactionStatistic = { "@type": "InteractionCounter", interactionType: { "@type": "WatchAction" }, userInteractionCount: n };
    }
    creative.trailer = play.kind === "trailer" ? { "@id": `${url}#video` } : undefined;
    if (play.kind !== "trailer") delete creative.trailer;
    graph.push(video);
  }

  graph.push(
    breadcrumb([
      { name: site.name, path: localePath(locale, "/") },
      { name: UI[locale].footerNav.all, path: localePath(locale, "/work/") },
      { name: work.title, path: localePath(locale, `/work/${work.slug}/`) },
    ]),
  );

  return { "@context": "https://schema.org", "@graph": graph };
}

export function allWorkJsonLd(locale: Locale = "en"): JsonLd {
  const site = getSite(locale);
  const works = getWorks(locale);
  const page = absoluteUrl(localePath(locale, "/work/"));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${page}#page`,
        name: UI[locale].workIndex.collection(site.name),
        url: page,
        inLanguage: HTML_LANG[locale],
        isPartOf: { "@id": SITE_ID(locale) },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: works.length,
          itemListElement: works.map((w, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: w.title,
            url: absoluteUrl(localePath(locale, `/work/${w.slug}/`)),
          })),
        },
      },
      breadcrumb([
        { name: site.name, path: localePath(locale, "/") },
        { name: UI[locale].footerNav.all, path: localePath(locale, "/work/") },
      ]),
    ],
  };
}

export function allWorkPaths(): string[] {
  return getWorks().map((w) => `/work/${w.slug}/`);
}
