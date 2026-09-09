"use client";

import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import type { ServiceTile } from "@/lib/types";

/** Three service tiles with a lift on hover and a pointer-following glow. */
export function ServiceTiles({
  kicker,
  heading,
  lead,
  tiles,
}: {
  kicker: string;
  heading: string;
  lead?: string;
  tiles: ServiceTile[];
}) {
  const glow = usePointerGlow<HTMLDivElement>();
  return (
    <section className="sec wrap" id="services" aria-labelledby="services-heading">
      <Kicker>{kicker}</Kicker>
      <h2 className="svc-h2" id="services-heading">
        {heading}
      </h2>
      {lead ? <p className="body mt-4">{lead}</p> : null}
      <div className="svc-grid">
        {tiles.map((s, i) => (
          <Reveal key={s.title} className="tile" delay={(i % 6) * 0.07} onPointerMove={glow}>
            <div className="ico" aria-hidden="true">
              {s.icon}
            </div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ul>
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
