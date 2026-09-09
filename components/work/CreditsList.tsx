import type { Credit } from "@/lib/types";

/** Cast and crew as a definition list in the founder page's credentials style. */
export function CreditsList({ credits }: { credits: Credit[] }) {
  return (
    <dl className="creds credits">
      {credits.map((c, i) => (
        <div key={`${c.role}-${i}`}>
          <dt>{c.role}</dt>
          <dd>{c.name}</dd>
        </div>
      ))}
    </dl>
  );
}
