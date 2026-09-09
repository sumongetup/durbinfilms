"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Reveal } from "./Reveal";
import { useTrailer } from "@/components/TrailerModal";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { isNew, outletOf, playLabel, playableOf } from "@/lib/work";
import type { Work } from "@/lib/types";

const SPRING = { stiffness: 260, damping: 24, mass: 0.6 };

/**
 * One poster in a rail. The whole card links to the detail page through a
 * stretched `.cover` link; the play button sits above it and opens the
 * trailer modal (or the full video when there is no trailer). Hover gives
 * the 3D tilt, lift and light-follow glow.
 *
 * With `posterFit: "thumb"` a 16:9 image (a YouTube thumbnail) is shown
 * whole inside the 2:3 frame, over a blurred copy of itself.
 */
export function PosterCard({ work, index }: { work: Work; index: number }) {
  const reduce = useReducedMotion();
  const { open } = useTrailer();
  const artRef = useRef<HTMLSpanElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateX = useSpring(rx, SPRING);
  const rotateY = useSpring(ry, SPRING);
  const y = useSpring(ty, SPRING);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const art = artRef.current;
    if (!art) return;
    const r = art.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    art.style.setProperty("--mx", `${px}px`);
    art.style.setProperty("--my", `${py}px`);
    if (reduce || e.pointerType !== "mouse") return;
    rx.set((py / r.height - 0.5) * -8);
    ry.set((px / r.width - 0.5) * 8);
    ty.set(-6);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    ty.set(0);
  };

  const outlet = outletOf(work);
  const sub = outlet ? `${outlet} · ${work.year}` : work.year;
  const play = playableOf(work);
  const thumb = work.posterFit === "thumb";

  return (
    <Reveal as="li" className="poster" delay={(index % 6) * 0.07} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="art-box">
        <motion.span ref={artRef} className="art" style={{ rotateX, rotateY, y, transformPerspective: 900 }}>
          {thumb ? (
            <>
              <Image src={work.poster} alt="" fill sizes="246px" className="art-blur object-cover" aria-hidden="true" draggable={false} />
              <Image
                src={work.poster}
                alt=""
                fill
                sizes="(max-width: 700px) 50vw, 246px"
                className="object-contain"
                draggable={false}
              />
            </>
          ) : (
            <Image
              src={work.poster}
              alt=""
              fill
              sizes="(max-width: 700px) 50vw, 246px"
              className="object-cover"
              draggable={false}
            />
          )}
          <span className="glow" aria-hidden="true" />
          <span className="ep">{isNew(work) ? `NEW · ${work.badge}` : work.badge}</span>
          {work.views ? <span className="ep views-chip">{work.views} views</span> : null}
        </motion.span>
        {play ? (
          <button
            type="button"
            className="play"
            aria-label={`${playLabel(play.kind)}: ${work.title}`}
            onClick={() =>
              open({
                title: work.title,
                youtubeId: play.id,
                kind: play.kind,
                start: play.kind === "trailer" ? work.trailerStart : undefined,
                watchUrl: work.watchUrl,
              })
            }
          >
            <span aria-hidden="true">▶</span>
          </button>
        ) : null}
      </div>
      <h3>{work.title}</h3>
      <p>{sub}</p>
      <Link href={`/work/${work.slug}/`} className="cover" aria-label={`${work.title}, ${sub}`} draggable={false} />
    </Reveal>
  );
}
