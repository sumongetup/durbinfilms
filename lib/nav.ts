import { UI, localePath, type Locale } from "./i18n";
import type { NavLink } from "./types";

/** Nav for the home page, where the section anchors are on the same page. */
export function homeLinks(locale: Locale): NavLink[] {
  const t = UI[locale].nav;
  return [
    { label: t.dramas, href: "#dramas" },
    { label: t.serials, href: "#serials" },
    { label: t.shorts, href: "#shorts" },
    { label: t.songs, href: "#songs" },
    { label: t.services, href: "#services" },
    { label: t.founder, href: localePath(locale, "/founder/") },
  ];
}

/** Nav for every other page: the same items, pointing back at the home sections. */
export function pageLinks(locale: Locale): NavLink[] {
  const home = localePath(locale, "/");
  return homeLinks(locale).map((l) => (l.href.startsWith("#") ? { ...l, href: `${home}${l.href}` } : l));
}

/** Footer-only extras. */
export function footerExtraLinks(locale: Locale): NavLink[] {
  const t = UI[locale].footerNav;
  const home = localePath(locale, "/");
  return [
    { label: t.all, href: localePath(locale, "/work/") },
    { label: t.process, href: `${home}#process` },
    { label: t.network, href: `${home}#channels` },
    { label: t.questions, href: `${home}#faq` },
    { label: t.contact, href: `${home}#contact` },
  ];
}

export function cta(locale: Locale): NavLink {
  return { label: UI[locale].cta, href: "#contact" };
}
