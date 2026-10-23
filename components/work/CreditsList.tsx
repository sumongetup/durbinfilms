import Link from "next/link";
import { UI, type Locale } from "@/lib/i18n";
import type { Credit } from "@/lib/types";

/** Someone in the credits who has a page on this site, e.g. the founder. */
export interface CreditLink {
  /** Every spelling that should match, compared case-insensitively. */
  names: string[];
  /** The name as this page shows it. */
  label: string;
  href: string;
}

/**
 * Cast and crew as a definition list in the founder page's credentials style.
 * Names stay as credited, except a `link` match, which is shown in the page's
 * language and links to that person's page.
 */
export function CreditsList({ credits, locale, link }: { credits: Credit[]; locale: Locale; link?: CreditLink }) {
  const roles = UI[locale].roles;
  const names = link?.names.map((n) => n.toLowerCase()) ?? [];
  return (
    <dl className="creds credits">
      {credits.map((c, i) => (
        <div key={`${c.role}-${i}`}>
          <dt>{roles[c.role] ?? c.role}</dt>
          <dd>{link && names.includes(c.name.toLowerCase()) ? <Link href={link.href}>{link.label}</Link> : c.name}</dd>
        </div>
      ))}
    </dl>
  );
}
