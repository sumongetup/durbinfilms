"use client";

import { Backdrop } from "@/components/ui/Backdrop";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Button } from "./ui/Button";
import { Kicker } from "./ui/Kicker";
import { SplitWords } from "./ui/SplitWords";
import { useTrailer } from "./TrailerModal";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { SLIDE_MS } from "@/lib/motion";
import { playLabel, playableOf } from "@/lib/work";
import type { FeaturedSlide } from "@/lib/types";

/**
 * Full-height hero. Backdrops crossfade every 6.5s with progress-bar dots,
 * the background parallaxes at 0.22x scroll and slowly zooms out over 22s,
 * and on fine pointers a soft spotlight follows the cursor. The headline
 * stays fixed and animates in word by word; kicker, chip, meta and blurb
 * change per slide.
 */
export function HeroSlider({ slides, headline }: { slides: FeaturedSlide[]; headline: string }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { open } = useTrailer();
  const heroRef = useRef<HTMLElement>(null);

  const [idx, setIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const current = slides[idx] ?? slides[0];

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.22));

  const spotX = useMotionValue<string | number>("50%");
  const spotY = useMotionValue<string | number>("40%");
  const [spotOn, setSpotOn] = useState(true);
  const trackSpot = !reduce && fine;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!trackSpot || !heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    spotX.set(e.clientX - r.left);
    spotY.set(e.clientY - r.top);
    setSpotOn(true);
  };
  const onLeave = () => {
    if (trackSpot) setSpotOn(false);
  };

  const go = useCallback((n: number) => {
    setIdx(n);
    setCycle((c) => c + 1);
  }, []);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [reduce, slides.length, cycle]);

  // The other backdrops are only needed at the first crossfade, so let the
  // first one win the bandwidth race for the largest contentful paint.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWarm(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  if (!current) return null;
  const play = playableOf(current);

  return (
    <section
      className="hero"
      ref={heroRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-roledescription="carousel"
      aria-label="Featured productions"
    >
      <motion.div className="hero-bg" style={{ y }} aria-hidden="true">
        {slides.map((s, i) => (
          <motion.div
            key={s.slug}
            className="slide"
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <div className="kb">{i === 0 || warm || i === idx ? <Backdrop src={s.backdrop} priority={i === 0} /> : null}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.span className="spot" aria-hidden="true" style={{ left: spotX, top: spotY, opacity: spotOn ? 1 : 0.35 }} />

      <div className="wrap hero-in">
        <div className="hero-copy">
          <Kicker>{current.kicker}</Kicker>
          <h1>
            <SplitWords text={headline} />
          </h1>
          <div className="meta">
            <span className="chip-hot">
              <i className="pulse" aria-hidden="true" />
              {current.chip}
            </span>
            <span>{current.meta}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.slug}
              className="syn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5 }}
            >
              {current.blurb}
            </motion.p>
          </AnimatePresence>
          <div className="btns">
            {play ? (
              <Button
                onClick={() =>
                  open({
                    title: current.title,
                    youtubeId: play.id,
                    kind: play.kind,
                    start: play.kind === "trailer" ? current.trailerStart : undefined,
                    watchUrl: current.watchUrl,
                  })
                }
              >
                <span aria-hidden="true">▶</span> {playLabel(play.kind)}
              </Button>
            ) : null}
            <Button href="#dramas" variant="ghost">
              Browse the work
            </Button>
          </div>
          <div className="dots">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                className={`dot${i === idx ? " on" : ""}`}
                aria-label={`Featured ${i + 1}: ${s.title}`}
                aria-current={i === idx ? "true" : undefined}
                onClick={() => go(i)}
              >
                <motion.b
                  key={`${idx}-${cycle}`}
                  initial={{ width: 0 }}
                  animate={{ width: i === idx ? "100%" : "0%" }}
                  transition={{ duration: i === idx && !reduce ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <span className="scroll-hint" aria-hidden="true">
        SCROLL
        <i />
      </span>
    </section>
  );
}
