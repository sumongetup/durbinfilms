import type { FeaturedSlide, Work, WorkType } from "./types";

/**
 * Pure helpers over a single Work. No JSON imports here, so client
 * components can use them without pulling content into the bundle.
 */

/** True when the value is empty or still a [bracketed] placeholder. */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || /^\s*\[.*\]\s*$/.test(value);
}

/** First non-empty of channel, platform, client. */
export function outletOf(work: Work): string {
  return work.channel || work.platform || work.client || "";
}

/** Label for the outlet column on the detail page. */
export function outletLabel(work: Work): string {
  if (work.channel) return "CHANNEL";
  if (work.platform) return work.type === "short" ? "FESTIVAL" : "PLATFORM";
  if (work.client) return "CLIENT";
  return "OUTLET";
}

const KICKER: Record<WorkType, string> = {
  drama: "FEATURED PRODUCTION",
  series: "NEW WEB SERIES",
  brand: "BRAND WORK",
  short: "SHORT FILM",
  documentary: "DOCUMENTARY",
  song: "MUSIC",
};

export function formatLabel(work: Work): string {
  switch (work.type) {
    case "drama": {
      const badge = work.badge.toUpperCase();
      if (badge === "TELEFILM") return "Telefilm";
      if (badge === "EID SPECIAL") return "Eid special drama";
      return work.episodes > 1 ? `${work.episodes} episode drama` : "Single episode drama";
    }
    case "series":
      return "Web series";
    case "brand":
      return work.badge.toUpperCase() === "TVC" ? "Television commercial" : "Brand film";
    case "short":
      return "Short film";
    case "documentary":
      return "Documentary";
    case "song":
      return work.badge.toUpperCase().includes("OST") ? "Original soundtrack" : "Song";
  }
}

export function chipOf(work: Work): string {
  switch (work.type) {
    case "drama":
      return "Now streaming";
    case "series":
      return `${work.episodes} episodes`;
    case "brand":
      return "Campaign";
    case "short":
      return "Short film";
    case "documentary":
      return "Documentary";
    case "song":
      return "Music video";
  }
}

export function metaOf(work: Work): string {
  return [work.year, formatLabel(work), outletOf(work)].filter(Boolean).join(" · ");
}

/** Names listed under Cast or Featuring in the credits, joined. */
export function featuringOf(work: Work): string {
  const names = (work.credits ?? [])
    .filter((c) => /^(cast|featuring|starring)$/i.test(c.role) && !isPlaceholder(c.name))
    .map((c) => c.name);
  return names.join(", ");
}

/**
 * One factual line for a production that has no written synopsis yet: who is
 * in it and how it has done on YouTube. Nothing here is invented.
 */
export function autoBlurb(work: Work): string {
  const parts: string[] = [];
  const names = featuringOf(work);
  if (names) parts.push(`With ${names}.`);
  if (work.views) parts.push(`${work.views} views on YouTube.`);
  return parts.join(" ");
}

/** The synopsis if it has been written, otherwise the factual fallback. */
export function blurbOf(work: Work): string {
  return isPlaceholder(work.synopsis) ? autoBlurb(work) : work.synopsis;
}

/** Extracts a YouTube video ID from a youtu.be or watch URL. */
export function youtubeIdFromUrl(url?: string): string {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
  return m ? m[1] : "";
}

export type PlayKind = "trailer" | "full";

/**
 * What the play button should open: the trailer when there is one, otherwise
 * the full video when it lives on YouTube, otherwise nothing.
 */
export function playableOf(work: Pick<Work, "youtubeId" | "watchUrl">): { id: string; kind: PlayKind } | null {
  if (work.youtubeId) return { id: work.youtubeId, kind: "trailer" };
  const full = youtubeIdFromUrl(work.watchUrl);
  return full ? { id: full, kind: "full" } : null;
}

export function playLabel(kind: PlayKind | null | undefined): string {
  return kind === "full" ? "Watch now" : "Watch trailer";
}

export function toSlide(work: Work): FeaturedSlide {
  return {
    slug: work.slug,
    title: work.title,
    titleBn: work.titleBn,
    kicker: work.hero?.kicker ?? KICKER[work.type],
    chip: work.hero?.chip ?? chipOf(work),
    meta: work.hero?.meta ?? metaOf(work),
    blurb: work.hero?.blurb ?? blurbOf(work),
    backdrop: work.backdrop,
    youtubeId: work.youtubeId,
    trailerStart: work.trailerStart,
    watchUrl: work.watchUrl,
  };
}

/** Released within the last six months. */
export function isNew(work: Pick<Work, "released">, now = new Date()): boolean {
  if (!work.released) return false;
  const t = Date.parse(work.released);
  if (Number.isNaN(t)) return false;
  return now.getTime() - t < 183 * 24 * 60 * 60 * 1000;
}

/** ISO 8601 duration for schema.org, e.g. PT49M20S. */
export function isoDuration(seconds?: number): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}${s ? `${s}S` : ""}`;
}

/** Human running time, e.g. "49 min". */
export function runtimeOf(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.round(seconds / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}

/** Embed URL for a YouTube video, privacy-enhanced, autoplaying, optional start offset. */
export function trailerEmbedUrl(youtubeId: string, start?: number): string {
  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (start && start > 0) params.set("start", String(Math.floor(start)));
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`;
}
