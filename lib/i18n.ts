/**
 * The site's two languages. English lives at the root, Bangla under /bn/.
 * Interface strings are here; page copy lives in content/ and content/bn/.
 * No JSON imports, so client components can use this freely.
 */

export type Locale = "en" | "bn";

export const LOCALES: Locale[] = ["en", "bn"];

/** BCP 47 tag for <html lang> and hreflang. */
export const HTML_LANG: Record<Locale, string> = { en: "en", bn: "bn" };

/** Open Graph locale. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_GB", bn: "bn_BD" };

/** "/work/" becomes "/bn/work/" in Bangla. Hashes and external links pass through. */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en" || !path.startsWith("/")) return path;
  return path === "/" ? "/bn/" : `/bn${path}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "bn" : "en";
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Western digits to Bangla digits in Bangla, untouched in English. */
export function digits(locale: Locale, text: string | number): string {
  const s = String(text);
  return locale === "bn" ? s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : s;
}

/** "41M" -> 41000000, "9.6M" -> 9600000, "773K" -> 773000. */
export function parseCount(v: string): number | null {
  const m = v.trim().match(/^([\d.,]+)\s*([KMB])?$/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || "").toUpperCase()] ?? 1;
  return Math.round(n * mult);
}

/** 41000000 -> "৪.১ কোটি", 1380000 -> "১৩.৮ লাখ", 155000 -> "১.৬ লাখ". */
export function bnCount(n: number): string {
  const [unit, word] = n >= 1e7 ? [1e7, " কোটি"] : n >= 1e5 ? [1e5, " লাখ"] : n >= 1e3 ? [1e3, " হাজার"] : [1, ""];
  const value = Math.round((n / unit) * 10) / 10;
  return digits("bn", value) + word;
}

/** A YouTube style count ("41M", "3,335") as visitors in each language read it. */
export function countLabel(locale: Locale, label: string, exact?: number): string {
  if (locale === "en") return label;
  const n = exact ?? parseCount(label);
  return n === null ? digits("bn", label) : bnCount(n);
}

const BN_WORDS = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো"];
const EN_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "Five" or "পাঁচ": small numbers read better spelled out in a headline. */
export function spell(locale: Locale, n: number): string {
  if (locale === "bn") return BN_WORDS[n] ?? digits("bn", n);
  const word = EN_WORDS[n];
  return word ? word[0].toUpperCase() + word.slice(1) : String(n);
}

const en = {
  skip: "Skip to content",
  homeAria: "Durbin Films, home",
  logoAlt: "Durbin Films",
  switchLabel: "বাংলা",
  switchAria: "এই পাতা বাংলায় পড়ুন",
  nav: { dramas: "Dramas", serials: "Serials", shorts: "Shorts", songs: "Songs", services: "Services", founder: "Founder" },
  footerNav: { all: "All work", process: "Process", network: "Network", questions: "Questions", contact: "Contact" },
  cta: "Start a project",
  getInTouch: "Get in touch",
  menu: { open: "Open menu", close: "Close menu", sheet: "Menu", primary: "Primary", footer: "Footer" },
  whatsapp: {
    label: "WhatsApp",
    text: "Hi Durbin Films, I would like to talk about a project.",
    aria: "Chat with Durbin Films on WhatsApp",
    studio: "WhatsApp the studio",
  },
  footer: {
    tagline: "Television drama, web series and brand films. Script to final cut, in house.",
    group: "Also from the group:",
    explore: "EXPLORE",
    contact: "CONTACT",
    follow: "FOLLOW",
    since: (year: string) => ` · Since ${year}`,
  },
  contact: {
    kicker: "GET IN TOUCH",
    heading: "Got a script, a slate or a brief?",
    lead: "Send it over. You get back a plan, a schedule and a number, usually within two working days.",
    email: "EMAIL",
    phone: "PHONE",
    studio: "STUDIO",
    social: "SOCIAL",
    follow: "FOLLOW",
    emailButton: "Email the studio",
    call: (phone: string) => `Call ${phone}`,
  },
  hero: { aria: "Featured productions", browse: "Browse the work", dot: (n: number, title: string) => `Featured ${n}: ${title}`, scroll: "SCROLL" },
  marqueeAria: "What we make",
  rails: {
    dramas: "Dramas and telefilms",
    serials: "Natoks and serials",
    shortsKicker: "DIGITAL",
    shorts: "Short films",
    songsKicker: "MUSIC",
    songs: "Songs and title tracks",
    more: "All work",
    left: (heading: string) => `Scroll ${heading} left`,
    right: (heading: string) => `Scroll ${heading} right`,
  },
  channels: { channels: "Channels", subscribers: "Subscribers", videos: "Videos published", primary: "This studio", subs: "subscribers", vids: "videos" },
  poster: { isNew: "NEW", views: (v: string) => `${v} views` },
  play: { now: "Watch now", trailer: "Watch trailer" },
  trailer: {
    frameTitle: (title: string) => `${title} trailer`,
    heading: (title: string) => `${title} — trailer`,
    soon: "Trailer coming soon.",
    openYoutube: "Open on YouTube",
    fullDrama: "Watch the full drama",
    close: "Close",
    playTrailer: (title: string) => `Play the trailer for ${title}`,
    playFull: (title: string) => `Play ${title}`,
    fullOnYoutube: "Watch the full drama on YouTube",
  },
  work: {
    year: "YEAR",
    format: "FORMAT",
    views: "VIEWS",
    viewsOnYoutube: (v: string) => `${v} on YouTube`,
    episodes: "EPISODES",
    trailerKicker: "TRAILER",
    watchKicker: "WATCH",
    watchTrailer: "Watch the trailer",
    watchTitle: (title: string) => `Watch ${title}`,
    creditsKicker: "CAST AND CREW",
    credits: "Who made it",
    galleryKicker: "GALLERY",
    gallery: "Stills",
    still: (title: string, n: number) => `${title}, still ${n}`,
    moreKicker: "MORE FROM DURBIN FILMS",
    more: "Other productions",
    watchOnYoutube: "Watch on YouTube",
    browseAll: "Browse all work",
    outlet: { channel: "CHANNEL", festival: "FESTIVAL", platform: "PLATFORM", client: "CLIENT", outlet: "OUTLET" },
  },
  workIndex: {
    title: "All work: dramas, serials, short films and songs",
    description:
      "Every Durbin Films production in one place. Bangla natoks, Eid specials, serials, short films and songs, with cast, year and where to watch.",
    kicker: "ALL WORK",
    heading: "Every production, by channel",
    lead: (n: number) =>
      `${n} productions across the studio's three YouTube channels. Click a poster for the full page, or the play button to watch.`,
    groups: { films: "Dramas and telefilms", drama: "Natoks and serials", durbin: "Natoks and short films" },
    collection: (name: string) => `All work by ${name}`,
    homeList: "Dramas and telefilms by Durbin Films",
  },
  browser: {
    placeholder: "Search titles, cast, channel…",
    search: "Search productions",
    channel: "CHANNEL",
    type: "TYPE",
    channelGroup: "Channel",
    typeGroup: "Type",
    all: "All",
    year: "Year",
    anyYear: "Any year",
    clear: "Clear",
    none: "Nothing matches. Try a different word or clear the filters.",
    count: (n: number, total: number) => `${n} of ${total} productions`,
    types: { drama: "Dramas", series: "Serials", short: "Short films", song: "Songs", brand: "Brand films", documentary: "Documentaries" },
  },
  founder: {
    contact: "Contact",
    work: "See the work",
    social: (name: string) => `${name} on social media`,
    portraitAlt: "Md Sumon Howlader, founder of Durbin Films",
    jobTitle: "Founder",
  },
  formats: {
    telefilm: "Telefilm",
    eid: "Eid special drama",
    episodes: (n: number) => `${n} episode drama`,
    single: "Single episode drama",
    series: "Web series",
    tvc: "Television commercial",
    brand: "Brand film",
    short: "Short film",
    documentary: "Documentary",
    ost: "Original soundtrack",
    song: "Song",
  },
  chips: {
    drama: "Now streaming",
    series: (n: number) => `${n} episodes`,
    brand: "Campaign",
    short: "Short film",
    documentary: "Documentary",
    song: "Music video",
  },
  kickers: {
    drama: "FEATURED PRODUCTION",
    series: "NEW WEB SERIES",
    brand: "BRAND WORK",
    short: "SHORT FILM",
    documentary: "DOCUMENTARY",
    song: "MUSIC",
  },
  blurb: { with: (names: string) => `With ${names}.`, views: (v: string) => `${v} views on YouTube.` },
  /** Badges as they appear in works.json; anything missing is shown as is. */
  badges: {} as Record<string, string>,
  roles: {} as Record<string, string>,
  channelKinds: {} as Record<string, string>,
};

export type Dictionary = typeof en;

const bn: Dictionary = {
  skip: "মূল লেখায় যান",
  homeAria: "দুরবীন ফিল্মস, প্রথম পাতা",
  logoAlt: "দুরবীন ফিল্মস",
  switchLabel: "English",
  switchAria: "Read this page in English",
  nav: { dramas: "নাটক", serials: "ধারাবাহিক", shorts: "শর্টফিল্ম", songs: "গান", services: "সেবা", founder: "প্রতিষ্ঠাতা" },
  footerNav: { all: "সব কাজ", process: "কাজের ধারা", network: "চ্যানেল", questions: "জিজ্ঞাসা", contact: "যোগাযোগ" },
  cta: "কাজ শুরু করুন",
  getInTouch: "যোগাযোগ করুন",
  menu: { open: "মেনু খুলুন", close: "মেনু বন্ধ করুন", sheet: "মেনু", primary: "প্রধান মেনু", footer: "ফুটার" },
  whatsapp: {
    label: "হোয়াটসঅ্যাপ",
    text: "হ্যালো দুরবীন ফিল্মস, একটি প্রজেক্ট নিয়ে কথা বলতে চাই।",
    aria: "হোয়াটসঅ্যাপে দুরবীন ফিল্মসের সঙ্গে কথা বলুন",
    studio: "হোয়াটসঅ্যাপে লিখুন",
  },
  footer: {
    tagline: "টেলিভিশন নাটক, ওয়েব সিরিজ ও বিজ্ঞাপন। গল্প থেকে ফাইনাল কাট, সবই নিজেদের হাতে।",
    group: "আমাদের আরেক প্রতিষ্ঠান:",
    explore: "সাইটে যা আছে",
    contact: "যোগাযোগ",
    follow: "সঙ্গে থাকুন",
    since: (year: string) => ` · ${digits("bn", year)} সাল থেকে`,
  },
  contact: {
    kicker: "যোগাযোগ",
    heading: "হাতে স্ক্রিপ্ট, পরিকল্পনা বা ব্রিফ আছে?",
    lead: "আমাদের পাঠিয়ে দিন। সাধারণত দুই কর্মদিবসের মধ্যেই কাজের পরিকল্পনা, সময়সূচি আর খরচের হিসাব পেয়ে যাবেন।",
    email: "ইমেইল",
    phone: "ফোন",
    studio: "ঠিকানা",
    social: "সোশ্যাল মিডিয়া",
    follow: "সঙ্গে থাকুন",
    emailButton: "ইমেইল করুন",
    call: (phone: string) => `কল করুন ${phone}`,
  },
  hero: { aria: "নির্বাচিত প্রযোজনা", browse: "সব কাজ দেখুন", dot: (n: number, title: string) => `নির্বাচিত ${digits("bn", n)}: ${title}`, scroll: "নিচে দেখুন" },
  marqueeAria: "আমরা যা বানাই",
  rails: {
    dramas: "নাটক ও টেলিফিল্ম",
    serials: "নাটক ও ধারাবাহিক",
    shortsKicker: "অনলাইন",
    shorts: "শর্টফিল্ম",
    songsKicker: "গান",
    songs: "নাটকের গান",
    more: "সব কাজ",
    left: (heading: string) => `${heading}: আগেরগুলো দেখুন`,
    right: (heading: string) => `${heading}: পরেরগুলো দেখুন`,
  },
  channels: { channels: "চ্যানেল", subscribers: "সাবস্ক্রাইবার", videos: "প্রকাশিত ভিডিও", primary: "আমাদের মূল চ্যানেল", subs: "সাবস্ক্রাইবার", vids: "ভিডিও" },
  poster: { isNew: "নতুন", views: (v: string) => `${v} ভিউ` },
  play: { now: "এখনই দেখুন", trailer: "ট্রেলার দেখুন" },
  trailer: {
    frameTitle: (title: string) => `${title}, ট্রেলার`,
    heading: (title: string) => `${title}, ট্রেলার`,
    soon: "ট্রেলার শিগগিরই আসছে।",
    openYoutube: "ইউটিউবে দেখুন",
    fullDrama: "পুরো নাটক দেখুন",
    close: "বন্ধ করুন",
    playTrailer: (title: string) => `${title}: ট্রেলার চালু করুন`,
    playFull: (title: string) => `${title}: চালু করুন`,
    fullOnYoutube: "ইউটিউবে পুরো নাটক দেখুন",
  },
  work: {
    year: "সাল",
    format: "ধরন",
    views: "ভিউ",
    viewsOnYoutube: (v: string) => `ইউটিউবে ${v}`,
    episodes: "পর্ব",
    trailerKicker: "ট্রেলার",
    watchKicker: "দেখুন",
    watchTrailer: "ট্রেলার দেখুন",
    watchTitle: (title: string) => `দেখুন: ${title}`,
    creditsKicker: "শিল্পী ও কলাকুশলী",
    credits: "যাঁদের হাতে তৈরি",
    galleryKicker: "গ্যালারি",
    gallery: "স্থিরচিত্র",
    still: (title: string, n: number) => `${title}, স্থিরচিত্র ${digits("bn", n)}`,
    moreKicker: "দুরবীন ফিল্মসের আরও কাজ",
    more: "আরও দেখুন",
    watchOnYoutube: "ইউটিউবে দেখুন",
    browseAll: "সব কাজ দেখুন",
    outlet: { channel: "চ্যানেল", festival: "উৎসব", platform: "প্ল্যাটফর্ম", client: "ক্লায়েন্ট", outlet: "প্রচার" },
  },
  workIndex: {
    title: "সব কাজ: নাটক, ধারাবাহিক, শর্টফিল্ম ও গান",
    description:
      "দুরবীন ফিল্মসের সব নাটক, ঈদের নাটক, ধারাবাহিক, শর্টফিল্ম আর গান এক জায়গায়। কে অভিনয় করেছেন, কবে মুক্তি পেয়েছে আর কোথায় দেখবেন, সবই এখানে।",
    kicker: "সব কাজ",
    heading: "চ্যানেল অনুযায়ী সব কাজ",
    lead: (n: number) =>
      `স্টুডিওর তিনটি ইউটিউব চ্যানেলে মোট ${digits("bn", n)}টি কাজ। বিস্তারিত জানতে পোস্টারে ক্লিক করুন, আর দেখতে চাইলে প্লে বাটনে।`,
    groups: { films: "নাটক ও টেলিফিল্ম", drama: "নাটক ও ধারাবাহিক", durbin: "নাটক ও শর্টফিল্ম" },
    collection: (name: string) => `${name}-এর সব কাজ`,
    homeList: "দুরবীন ফিল্মসের নাটক ও টেলিফিল্ম",
  },
  browser: {
    placeholder: "নাটকের নাম, শিল্পী বা চ্যানেল লিখে খুঁজুন…",
    search: "কাজ খুঁজুন",
    channel: "চ্যানেল",
    type: "ধরন",
    channelGroup: "চ্যানেল",
    typeGroup: "ধরন",
    all: "সব",
    year: "সাল",
    anyYear: "সব সাল",
    clear: "ফিল্টার মুছুন",
    none: "কিছু পাওয়া যায়নি। অন্য শব্দে খুঁজে দেখুন, অথবা ফিল্টার মুছে দিন।",
    count: (n: number, total: number) => `${digits("bn", total)}টির মধ্যে ${digits("bn", n)}টি`,
    types: { drama: "নাটক", series: "ধারাবাহিক", short: "শর্টফিল্ম", song: "গান", brand: "বিজ্ঞাপন", documentary: "ডকুমেন্টারি" },
  },
  founder: {
    contact: "যোগাযোগ",
    work: "কাজগুলো দেখুন",
    social: (name: string) => `সোশ্যাল মিডিয়ায় ${name}`,
    portraitAlt: "দুরবীন ফিল্মসের প্রতিষ্ঠাতা মো. সুমন হাওলাদার",
    jobTitle: "প্রতিষ্ঠাতা",
  },
  formats: {
    telefilm: "টেলিফিল্ম",
    eid: "ঈদের নাটক",
    episodes: (n: number) => `${digits("bn", n)} পর্বের নাটক`,
    single: "একক নাটক",
    series: "ওয়েব সিরিজ",
    tvc: "টিভি বিজ্ঞাপন",
    brand: "বিজ্ঞাপনচিত্র",
    short: "শর্টফিল্ম",
    documentary: "ডকুমেন্টারি",
    ost: "নাটকের গান",
    song: "গান",
  },
  chips: {
    drama: "এখন দেখা যাচ্ছে",
    series: (n: number) => `${digits("bn", n)} পর্ব`,
    brand: "ক্যাম্পেইন",
    short: "শর্টফিল্ম",
    documentary: "ডকুমেন্টারি",
    song: "মিউজিক ভিডিও",
  },
  kickers: {
    drama: "নির্বাচিত নাটক",
    series: "নতুন ওয়েব সিরিজ",
    brand: "বিজ্ঞাপন",
    short: "শর্টফিল্ম",
    documentary: "ডকুমেন্টারি",
    song: "গান",
  },
  blurb: { with: (names: string) => `অভিনয়ে ${names}।`, views: (v: string) => `ইউটিউবে দেখা হয়েছে ${v} বার।` },
  badges: {
    DRAMA: "নাটক",
    "EID SPECIAL": "ঈদের নাটক",
    TELEFILM: "টেলিফিল্ম",
    "SHORT FILM": "শর্টফিল্ম",
    OST: "নাটকের গান",
    SONG: "গান",
    "RAP SONG": "র‍্যাপ গান",
    "TITLE TRACK": "টাইটেল গান",
    TVC: "বিজ্ঞাপন",
  },
  roles: {
    "Director and DOP": "পরিচালনা ও চিত্রগ্রহণ",
    Story: "গল্প",
    Cast: "অভিনয়ে",
    "Edit and colour": "সম্পাদনা ও রং",
    Music: "সংগীত",
    Producer: "প্রযোজক",
    "In association with": "সহযোগিতায়",
    "Also credited": "আরও আছেন",
    "Presented by": "পরিবেশনায়",
    "Script and direction": "রচনা ও পরিচালনা",
    "Art director": "শিল্প নির্দেশনা",
    Team: "নির্মাণ দল",
    From: "যে নাটকের গান",
    Featuring: "পর্দায়",
    Singer: "কণ্ঠ",
    Vocal: "কণ্ঠ",
    "Tune and lyrics": "কথা ও সুর",
    Director: "পরিচালনা",
    Cinematography: "চিত্রগ্রহণ",
  },
  channelKinds: {
    "Natok and serials": "নাটক ও ধারাবাহিক",
    "Motivational stories": "অনুপ্রেরণার গল্প",
    "Natok and short films": "নাটক ও শর্টফিল্ম",
    "Short films": "শর্টফিল্ম",
    "Drama and telefilm": "নাটক ও টেলিফিল্ম",
  },
};

export const UI: Record<Locale, Dictionary> = { en, bn };

/** A badge from works.json in the visitor's language, e.g. "29 EPISODES" -> "২৯ পর্ব". */
export function badgeLabel(locale: Locale, badge: string): string {
  if (locale === "en") return badge;
  const episodes = badge.match(/^(\d+) EPISODES$/i);
  if (episodes) return `${digits("bn", episodes[1])} পর্ব`;
  return UI.bn.badges[badge.toUpperCase()] ?? badge;
}
