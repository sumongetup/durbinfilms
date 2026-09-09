"use client";

import Link from "next/link";
import { Reveal } from "./ui/Reveal";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import type { Venture } from "@/lib/types";

/** One of the founder's ventures: tag, name, blurb and his role, with hover glow. */
export function VentureCard({ venture, index }: { venture: Venture; index: number }) {
  const glow = usePointerGlow<HTMLDivElement>();
  const linked = venture.href && !venture.href.includes("[");
  return (
    <Reveal className="vent" delay={(index % 5) * 0.07} onPointerMove={glow}>
      <span className="tag">{venture.tag}</span>
      <h3>{linked ? <Link href={venture.href}>{venture.name}</Link> : venture.name}</h3>
      <p>{venture.text}</p>
      <span className="go">{venture.role}</span>
    </Reveal>
  );
}
