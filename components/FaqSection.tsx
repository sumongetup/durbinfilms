import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import type { FaqItem } from "@/lib/types";

/**
 * Plain questions and answers, open by default so the text is in the page for
 * search engines rather than hidden behind a script. The matching FAQPage
 * structured data is rendered by the page that uses this.
 */
export function FaqSection({ kicker, heading, items }: { kicker: string; heading: string; items: FaqItem[] }) {
  return (
    <section className="sec wrap" id="faq" aria-labelledby="faq-heading">
      <Kicker>{kicker}</Kicker>
      <h2 id="faq-heading" className="svc-h2">
        {heading}
      </h2>
      <div className="faq-grid">
        {items.map((it, i) => (
          <Reveal key={it.q} delay={(i % 6) * 0.07}>
            <h3>{it.q}</h3>
            <p>{it.a}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
