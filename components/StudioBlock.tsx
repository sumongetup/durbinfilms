"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "./ui/Button";
import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { easeCurtain, easeSoft } from "@/lib/motion";
import type { Home } from "@/lib/types";

const CLOSED = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * Founder portrait revealed with a clip-path wipe from the top while the
 * image settles from 1.1x to 1x, beside the studio quote and copy.
 *
 * The observed element is an unclipped wrapper, not the clipped frame:
 * Chromium measures IntersectionObserver visibility from the element's visual
 * rect, and a frame clipped to zero height never reports as intersecting.
 */
export function StudioBlock({ portrait, studio }: { portrait: string; studio: Home["studio"] }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.12, margin: "0px 0px -8% 0px" });
  const shown = inView || reduce;

  return (
    <section className="sec wrap" id="studio" aria-labelledby="studio-heading">
      <Kicker id="studio-heading">{studio.kicker}</Kicker>
      <div className="studio-grid">
        <div ref={wrapRef}>
          <motion.div
            className="frame"
            initial={false}
            animate={{ clipPath: shown ? OPEN : CLOSED }}
            transition={{ duration: reduce ? 0 : 1.1, ease: easeCurtain }}
          >
            <motion.div
              className="frame-img"
              initial={false}
              animate={{ scale: shown ? 1 : 1.1 }}
              transition={{ duration: reduce ? 0 : 1.4, ease: easeSoft }}
            >
              <Image
                src={portrait}
                alt="Md Sumon Howlader, founder of Durbin Films"
                fill
                sizes="(max-width: 860px) 100vw, 40vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
        <Reveal>
          <blockquote className="studio-quote">{studio.quote}</blockquote>
          <div className="body">
            {studio.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <p className="sign">{studio.sign}</p>
          <Button href="/founder/" variant="ghost" className="mt-[18px]">
            {studio.cta}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
