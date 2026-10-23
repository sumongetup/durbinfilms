import worksJson from "@/content/works.json";
import founderJson from "@/content/founder.json";
import siteJson from "@/content/site.json";
import homeJson from "@/content/home.json";
import channelsJson from "@/content/channels.json";
import bnWorksJson from "@/content/bn/works.json";
import bnFounderJson from "@/content/bn/founder.json";
import bnSiteJson from "@/content/bn/site.json";
import bnHomeJson from "@/content/bn/home.json";
import bnNamesJson from "@/content/bn/names.json";
import { countLabel, digits, type Locale } from "./i18n";
import type { ChannelData, Fact, FeaturedSlide, Founder, HeroCopy, Home, Site, Work, WorkType } from "./types";
import { toSlide } from "./work";

export {
  isPlaceholder,
  outletOf,
  outletLabel,
  formatLabel,
  chipOf,
  metaOf,
  toSlide,
  blurbOf,
  autoBlurb,
  featuringOf,
  playableOf,
  playLabel,
} from "./work";

const works = worksJson as Work[];
const founder = founderJson as Founder;
const site = siteJson as Site;
const home = homeJson as Home;
const channelData = channelsJson as ChannelData;

/** Bangla copy per production, keyed by slug. Anything missing falls back to generated text. */
const bnWorks = bnWorksJson as Record<string, { synopsis?: string; hero?: HeroCopy }>;

/** Names in the credits and link labels as Bangla pages write them; anything missing stays as is. */
const bnPeople = bnNamesJson.people as Record<string, string>;
const bnLinks = bnNamesJson.links as Record<string, string>;
const bnLink = <T extends { label: string }>(l: T): T => ({ ...l, label: bnLinks[l.label] ?? l.label });

/** Bangla overrides for site.json: the name, the search snippet and the address in Bangla. */
const bnSite: Site = {
  ...site,
  ...(bnSiteJson as Partial<Site>),
  address: { ...site.address, ...bnSiteJson.address },
  social: site.social.map(bnLink),
  network: bnSiteJson.network.map((n) => ({ ...n, links: n.links?.map(bnLink) })),
};

/** The Bangla founder page: Bangla text over the English file, so links and images stay in one place. */
const bnFounder: Founder = {
  ...founder,
  ...(bnFounderJson as Omit<Founder, "portrait" | "backdrop" | "contact"> & { contact: Omit<Founder["contact"], "links"> }),
  contact: { ...founder.contact, ...bnFounderJson.contact, links: founder.contact.links?.map(bnLink) },
};

/** Search keywords for the Bangla pages: the brand's spellings and what people type. */
export const BN_KEYWORDS: string[] = bnSiteJson.keywords;

/** Every spelling of the studio's name in Bangla, for structured data. */
export const BN_NAMES: string[] = bnSiteJson.keywords.filter((k) => /ফিল্মস$/.test(k));

export function getSite(locale: Locale = "en"): Site {
  return locale === "bn" ? bnSite : site;
}

export function getHome(locale: Locale = "en"): Home {
  return locale === "bn" ? (bnHomeJson as Home) : home;
}

/** The studio's own channel first, then the rest of the network by size. */
export function getChannels(): ChannelData {
  const channels = [...channelData.channels].sort((a, b) => {
    if (a.primary !== b.primary) return a.primary ? -1 : 1;
    return b.subscribers - a.subscribers;
  });
  return { ...channelData, channels };
}

export function getFounder(locale: Locale = "en"): Founder {
  return locale === "bn" ? bnFounder : founder;
}

/**
 * Fills {subscribers}, {videos} and {channels} in the founder facts from the
 * live channel totals, so `npm run channels` is the only place those numbers
 * are ever edited.
 */
export function resolveFacts(facts: Fact[], locale: Locale = "en"): Fact[] {
  const t = channelData.totals;
  const swap = (text: string) =>
    text
      .replace(/\{subscribers\}/g, countLabel(locale, t.subscribersLabel, t.subscribers))
      .replace(/\{videos\}/g, locale === "bn" ? digits("bn", t.videosLabel) : t.videosLabel)
      .replace(/\{channels\}/g, digits(locale, t.channels));
  return facts.map((f) => ({ value: swap(f.value), label: swap(f.label) }));
}

/** Every spelling of the founder's name, lower-cased, to recognise him in the credits. */
const founderNames = [founder, bnFounder].flatMap((f) => [f.name, ...(f.alternateNames ?? [])]).map((n) => n.toLowerCase());

/** The credited producer as the page writes it: the founder's own Bangla name on Bangla pages. */
function producerOf(work: Work, locale: Locale): string | undefined {
  const name = work.credits?.find((c) => /^producer$/i.test(c.role))?.name;
  if (!name) return undefined;
  return founderNames.includes(name.toLowerCase()) ? getFounder(locale).name : name;
}

/**
 * A production as a page in one language shows it. In Bangla the Bangla title
 * leads and the Latin one sits under it; the synopsis and hero copy come from
 * content/bn/works.json.
 */
function localize(work: Work, locale: Locale): Work {
  const producer = producerOf(work, locale);
  if (locale === "en") return { ...work, ...(work.titleBn ? { altTitle: work.titleBn } : {}), producer };
  const bn = bnWorks[work.slug] ?? {};
  return {
    ...work,
    title: work.titleBn || work.title,
    altTitle: work.titleBn ? work.title : undefined,
    synopsis: bn.synopsis ?? "",
    hero: bn.hero,
    producer,
    credits: work.credits?.map((c) => ({
      ...c,
      name: c.name
        .split(/,\s*/)
        .map((n) => bnPeople[n] ?? n)
        .join(", "),
    })),
  };
}

const localized: Record<Locale, Work[]> = {
  en: works.map((w) => localize(w, "en")),
  bn: works.map((w) => localize(w, "bn")),
};

export function getWorks(locale: Locale = "en"): Work[] {
  return localized[locale];
}

export function getWork(slug: string, locale: Locale = "en"): Work | undefined {
  return localized[locale].find((w) => w.slug === slug);
}

/** Productions of the given types, in file order. */
export function getByType(types: WorkType[], locale: Locale = "en"): Work[] {
  return localized[locale].filter((w) => types.includes(w.type));
}

/** Everything released on one channel or platform, songs excluded, in file order. */
export function getByPlatform(platform: string, locale: Locale = "en"): Work[] {
  return localized[locale].filter((w) => w.platform === platform && w.type !== "song");
}

/** Home hero slides: entries flagged featured, in file order. */
export function getFeaturedSlides(locale: Locale = "en"): FeaturedSlide[] {
  return localized[locale].filter((w) => w.featured).map((w) => toSlide(w, locale));
}

/** Other productions to suggest under a detail page: same type first, then the rest. */
export function getRelated(work: Work, locale: Locale = "en", limit = 8): Work[] {
  const others = localized[locale].filter((w) => w.slug !== work.slug);
  const same = others.filter((w) => w.type === work.type);
  const rest = others.filter((w) => w.type !== work.type);
  return [...same, ...rest].slice(0, limit);
}
