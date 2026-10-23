import { UI, type Locale } from "@/lib/i18n";
import type { Credit } from "@/lib/types";

/** Cast and crew as a definition list in the founder page's credentials style. Names stay as credited. */
export function CreditsList({ credits, locale }: { credits: Credit[]; locale: Locale }) {
  const roles = UI[locale].roles;
  return (
    <dl className="creds credits">
      {credits.map((c, i) => (
        <div key={`${c.role}-${i}`}>
          <dt>{roles[c.role] ?? c.role}</dt>
          <dd>{c.name}</dd>
        </div>
      ))}
    </dl>
  );
}
