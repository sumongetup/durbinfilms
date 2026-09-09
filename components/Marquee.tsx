import { Fragment } from "react";
import type { MarqueeItem } from "@/lib/types";

/**
 * Infinite strip. The list is rendered twice and the track slides by 50%
 * over 30s, so the loop is seamless. The duplicate is hidden from screen
 * readers. Under prefers-reduced-motion the CSS animation is switched off.
 */
export function Marquee({ items }: { items: MarqueeItem[] }) {
  const strip = items.map((it, i) => (
    <Fragment key={i}>
      <span>{it.highlight ? <em>{it.label}</em> : it.label}</span>
      <i aria-hidden="true" />
    </Fragment>
  ));
  return (
    <div className="marq" aria-label="What we make">
      <div className="marq-in">
        <div className="contents">{strip}</div>
        <div className="contents" aria-hidden="true">
          {strip}
        </div>
      </div>
    </div>
  );
}
