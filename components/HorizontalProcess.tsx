"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Kicker } from "./ui/Kicker";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import type { ProcessStep } from "@/lib/types";

/**
 * A 340vh track with a sticky, viewport-high row inside it. As the track
 * scrolls through, the row translates horizontally by the overflow distance
 * (useScroll + useTransform). Under 900px, or with reduced motion, the CSS
 * turns it into a plain vertical stack and the transform is not applied.
 */
export function HorizontalProcess({ kicker, heading, steps }: { kicker: string; heading: string; steps: ProcessStep[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const stacked = useMediaQuery("(max-width: 900px)");
  const [dist, setDist] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      if (!row) return;
      setDist(Math.max(row.scrollWidth - window.innerWidth + 40, 0));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const active = !reduce && !stacked;

  return (
    <div className="htrack" ref={trackRef} aria-labelledby="process">
      <div className="hsticky">
        <motion.div className="hrow" ref={rowRef} style={active ? { x } : undefined}>
          <div className="hintro">
            <Kicker>{kicker}</Kicker>
            <h2 id="process">{heading}</h2>
          </div>
          {steps.map((s) => (
            <div className="hcard" key={s.n}>
              <div className="n" aria-hidden="true">
                {s.n}
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
