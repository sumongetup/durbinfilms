import type { NavLink } from "./types";

/** Nav for the home page, where the section anchors are on the same page. */
export const HOME_LINKS: NavLink[] = [
  { label: "Dramas", href: "#dramas" },
  { label: "Serials", href: "#serials" },
  { label: "Shorts", href: "#shorts" },
  { label: "Songs", href: "#songs" },
  { label: "Services", href: "#services" },
  { label: "Founder", href: "/founder/" },
];

/** Nav for every other page: the same items, pointing back at the home sections. */
export const PAGE_LINKS: NavLink[] = HOME_LINKS.map((l) => (l.href.startsWith("#") ? { ...l, href: `/${l.href}` } : l));

/** Footer-only extras. */
export const FOOTER_EXTRA_LINKS: NavLink[] = [
  { label: "All work", href: "/work/" },
  { label: "Process", href: "/#process" },
  { label: "Questions", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

export const CTA: NavLink = { label: "Start a project", href: "#contact" };
