import worksJson from "@/content/works.json";
import founderJson from "@/content/founder.json";
import siteJson from "@/content/site.json";
import homeJson from "@/content/home.json";
import type { FeaturedSlide, Founder, Home, Site, Work, WorkType } from "./types";
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

export function getSite(): Site {
  return site;
}

export function getHome(): Home {
  return home;
}

export function getFounder(): Founder {
  return founder;
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
