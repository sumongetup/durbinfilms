"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Kicker } from "./ui/Kicker";
import { PosterCard } from "./ui/PosterCard";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import type { Work } from "@/lib/types";

/**
 * Horizontal poster rail: native scroll-snap, arrow buttons that page by
 * 80% of the visible width, and mouse drag-to-scroll. A drag of more than
 * 6px swallows the click that would otherwise follow it.
 */
interface Props {
  id: string;
  kicker: string;
  heading: string;
  works: Work[];
  /** Optional "see everything" link shown beside the arrows. */
  more?: { label: string; href: string };
}

export function PosterRail({ id, kicker, heading, works, more }: Props) {
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);

  const page = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 760), behavior: reduce ? "auto" : "smooth" });
  };

  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { down: true, startX: e.clientX, startLeft: e.currentTarget.scrollLeft, moved: 0 };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.abs(dx);
    e.currentTarget.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => {
    if (!drag.current.down) return;
    drag.current.down = false;
    setDragging(false);
  };
  const onClickCapture = (e: MouseEvent<HTMLUListElement>) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <section className="sec wrap" id={id} aria-labelledby={`${id}-heading`}>
      <div className="rail-head">
        <div>
          <Kicker>{kicker}</Kicker>
          <h2 id={`${id}-heading`}>{heading}</h2>
        </div>
        {more ? (
          <span className="rail-more">
            <Link href={more.href}>{more.label} →</Link>
          </span>
        ) : null}
        <div className={`arrows${more ? " ml-0" : ""}`}>
          <button type="button" className="arrow" aria-label={`Scroll ${heading} left`} onClick={() => page(-1)}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" className="arrow" aria-label={`Scroll ${heading} right`} onClick={() => page(1)}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
      <ul
        ref={railRef}
        className={`rail${dragging ? " drag" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
        {works.map((w, i) => (
          <PosterCard key={w.slug} work={w} index={i} />
        ))}
      </ul>
    </section>
  );
}
