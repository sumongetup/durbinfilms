import { UI, countLabel, digits, type Locale } from "./i18n";
import type { FeaturedSlide, Work } from "./types";

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
export function outletLabel(work: Work, locale: Locale = "en"): string {
  const t = UI[locale].work.outlet;
  if (work.channel) return t.channel;
  if (work.platform) return work.type === "short" ? t.festival : t.platform;
  if (work.client) return t.client;
  return t.outlet;
}

export function formatLabel(work: Work, locale: Locale = "en"): string {
  const t = UI[locale].formats;
  switch (work.type) {
    case "drama": {
      const badge = work.badge.toUpperCase();
      if (badge === "TELEFILM") return t.telefilm;
      if (badge === "EID SPECIAL") return t.eid;
      return work.episodes > 1 ? t.episodes(work.episodes) : t.single;
    }
    case "series":
      return t.series;
    case "brand":
      return work.badge.toUpperCase() === "TVC" ? t.tvc : t.brand;
    case "short":
      return t.short;
    case "documentary":
      return t.documentary;
    case "song":
      return work.badge.toUpperCase().includes("OST") ? t.ost : t.song;
  }
}

export function chipOf(work: Work, locale: Locale = "en"): string {
  const t = UI[locale].chips;
  return work.type === "series" ? t.series(work.episodes) : t[work.type];
}

export function metaOf(work: Work, locale: Locale = "en"): string {
  return [digits(locale, work.year), formatLabel(work, locale), outletOf(work)].filter(Boolean).join(" · ");
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
export function autoBlurb(work: Work, locale: Locale = "en"): string {
  const t = UI[locale].blurb;
  const parts: string[] = [];
  const names = featuringOf(work);
  if (names) parts.push(t.with(names));
  if (work.views) parts.push(t.views(countLabel(locale, work.views)));
  return parts.join(" ");
}

/** The synopsis if it has been written, otherwise the factual fallback. */
export function blurbOf(work: Work, locale: Locale = "en"): string {
  return isPlaceholder(work.synopsis) ? autoBlurb(work, locale) : work.synopsis;
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

export function playLabel(kind: PlayKind | null | undefined, locale: Locale = "en"): string {
  return kind === "full" ? UI[locale].play.now : UI[locale].play.trailer;
}

export function toSlide(work: Work, locale: Locale = "en"): FeaturedSlide {
  return {
    slug: work.slug,
    title: work.title,
    titleBn: work.titleBn,
    kicker: work.hero?.kicker ?? UI[locale].kickers[work.type],
    chip: work.hero?.chip ?? chipOf(work, locale),
    meta: work.hero?.meta ?? metaOf(work, locale),
    blurb: work.hero?.blurb ?? blurbOf(work, locale),
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
