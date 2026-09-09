export type WorkType = "drama" | "series" | "brand" | "short" | "documentary" | "song";

export interface Credit {
  role: string;
  name: string;
}

/** Optional overrides for the home hero. Any missing key is derived from the work. */
export interface HeroCopy {
  kicker?: string;
  chip?: string;
  meta?: string;
  blurb?: string;
}

export interface Work {
  slug: string;
  /** Display title in Latin script. */
  title: string;
  /** The title in Bangla script, shown under the Latin title where there is room. */
  titleBn?: string;
  type: WorkType;
  year: string;
  channel: string;
  platform: string;
  client: string;
  episodes: number;
  badge: string;
  synopsis: string;
  poster: string;
  /** "thumb" letterboxes a 16:9 image inside the 2:3 poster frame over a blurred copy of itself. */
  posterFit?: "cover" | "thumb";
  backdrop: string;
  /** Trailer video ID. Empty until there is one. */
  youtubeId: string;
  /** Seconds into the trailer to start from. */
  trailerStart?: number;
  /** Where the whole production can be watched, e.g. the full drama on YouTube. */
  watchUrl?: string;
  /** Public view count as shown on YouTube, e.g. "18M". */
  views?: string;
  /** Release or upload date, ISO YYYY-MM-DD. Drives "New" tags and video structured data. */
  released?: string;
  /** Running time in seconds, for video structured data. */
  durationSeconds?: number;
  featured: boolean;
  hero?: HeroCopy;
  credits?: Credit[];
  gallery?: string[];
}

/** Everything the hero slider needs for one slide, fully resolved. */
export interface FeaturedSlide {
  slug: string;
  title: string;
  titleBn?: string;
  kicker: string;
  chip: string;
  meta: string;
  blurb: string;
  backdrop: string;
  youtubeId: string;
  trailerStart?: number;
  watchUrl?: string;
}

export interface Fact {
  value: string;
  label: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  text: string;
}

export interface Venture {
  tag: string;
  name: string;
  text: string;
  role: string;
  href: string;
}

export interface Credential {
  label: string;
  value: string;
}

export interface Founder {
  seo: { title: string; description: string };
  name: string;
  kicker: string;
  roles: string[];
  intro: string;
  portrait: string;
  backdrop: string;
  profile: { kicker: string; heading: string; paragraphs: string[] };
  facts: Fact[];
  timeline: { kicker: string; heading: string; items: TimelineItem[] };
  ventures: { kicker: string; heading: string; items: Venture[] };
  credentials: { kicker: string; heading: string; items: Credential[] };
  quote: { kicker: string; text: string; who: string };
  contact: {
    kicker: string;
    heading: string;
    lead: string;
    /** The founder's own profiles (LinkedIn, Facebook, Instagram, X, Threads). */
    links?: SocialLink[];
  };
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Site {
  name: string;
  title: string;
  description: string;
  url: string;
  email: string;
  /** Dialable form, used in tel: links. */
  phone: string;
  /** Human-readable form shown on the page; falls back to `phone`. */
  phoneDisplay?: string;
  address: { street: string; city: string; postalCode?: string; country: string };
  /** WhatsApp number in international format; enables the click-to-chat button. */
  whatsapp?: string;
  /** Founding date, ISO YYYY-MM-DD. Shown in the footer and in the Organization structured data. */
  founded?: string;
  /** Company registration date, ISO YYYY-MM-DD. */
  registered?: string;
  /** Durbin News launch date, PID registration date and number. */
  newsFounded?: string;
  newsRegistered?: string;
  newsRegistrationNo?: string;
  social: SocialLink[];
  ogImage: string;
  /** 4:5 portrait shown in the home page studio block. */
  studioImage: string;
  /** Google Search Console verification token, rendered as a meta tag when set. */
  googleSiteVerification?: string;
  /** The studio's YouTube channels, used by `npm run sync` to spot new uploads. */
  youtubeChannels?: { handle: string; label: string }[];
  /** Sister ventures linked from the footer, e.g. the Durbin News portal. */
  network?: { label: string; href: string; note?: string; links?: SocialLink[] }[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface MarqueeItem {
  label: string;
  highlight?: boolean;
}

export interface ProcessStep {
  n: string;
  title: string;
  text: string;
}

export interface ServiceTile {
  icon: string;
  title: string;
  text: string;
  bullets: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Everything on the home page that is brand voice rather than production data. */
export interface Home {
  hero: { headline: string };
  marquee: MarqueeItem[];
  process: { kicker: string; heading: string; steps: ProcessStep[] };
  services: { kicker: string; heading: string; lead?: string; tiles: ServiceTile[] };
  studio: { kicker: string; quote: string; paragraphs: string[]; sign: string; cta: string };
  faq: { kicker: string; heading: string; items: FaqItem[] };
  contact: { kicker: string; heading: string; lead: string };
}
