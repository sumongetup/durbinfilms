import { Reveal } from "./ui/Reveal";
import type { TimelineItem } from "@/lib/types";

/** Vertical timeline with gradient year labels and dots on a hairline rule. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="tl">
      {items.map((item, i) => (
        <Reveal as="li" className="row" key={`${item.year}-${item.title}`} delay={(i % 5) * 0.07}>
          <div className="yr">{item.year}</div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
