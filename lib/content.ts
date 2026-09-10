import worksJson from "@/content/works.json";
import founderJson from "@/content/founder.json";
import siteJson from "@/content/site.json";
import homeJson from "@/content/home.json";
import channelsJson from "@/content/channels.json";
import type { ChannelData, Fact, FeaturedSlide, Founder, Home, Site, Work, WorkType } from "./types";
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

export function getSite(): Site {
  return site;
}

export function getHome(): Home {
  return home;
}

/** The studio's own channel first, then the rest of the network by size. */
export function getChannels(): ChannelData {
  const channels = [...channelData.channels].sort((a, b) => {
    if (a.primary !== b.primary) return a.primary ? -1 : 1;
    return b.subscribers - a.subscribers;
  });
  return { ...channelData, channels };
}

export function getFounder(): Founder {
  return founder;
}

/**
 * Fills {subscribers}, {videos} and {channels} in the founder facts from the
 * live channel totals, so `npm run channels` is the only place those numbers
 * are ever edited.
 */
export function resolveFacts(facts: Fact[]): Fact[] {
  const t = channelData.totals;
  const swap = (text: string) =>
    text
      .replace(/\{subscribers\}/g, t.subscribersLabel)
      .replace(/\{videos\}/g, t.videosLabel)
      .replace(/\{channels\}/g, String(t.channels));
  return facts.map((f) => ({ value: swap(f.value), label: swap(f.label) }));
}

export function getWorks(): Work[] {
  return works;
}

export function getWork(slug: string): Work | undefined {
  return works.find((w) => w.slug === slug);
}

/** Productions of the given types, in file order. */
export function getByType(...types: WorkType[]): Work[] {
  return works.filter((w) => types.includes(w.type));
}

/** Rail one: television drama and telefilm. */
export function getDramas(): Work[] {
  return getByType("drama");
}

/** Rail two: web series, short films, brand work and documentaries. */
export function getDigital(): Work[] {
  return getByType("series", "short", "brand", "documentary");
}

/** Rail three: songs, title tracks and soundtracks. */
export function getSongs(): Work[] {
  return getByType("song");
}

/** Everything released on one channel or platform, songs excluded, in file order. */
export function getByPlatform(platform: string): Work[] {
  return works.filter((w) => w.platform === platform && w.type !== "song");
}

/** Home hero slides: entries flagged featured, in file order. */
export function getFeaturedSlides(): FeaturedSlide[] {
  return works.filter((w) => w.featured).map(toSlide);
}

/** Other productions to suggest under a detail page: same type first, then the rest. */
export function getRelated(work: Work, limit = 8): Work[] {
  const others = works.filter((w) => w.slug !== work.slug);
  const same = others.filter((w) => w.type === work.type);
  const rest = others.filter((w) => w.type !== work.type);
  return [...same, ...rest].slice(0, limit);
}
