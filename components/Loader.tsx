"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useReady } from "./providers/ReadyProvider";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { LOADER_MS, easeCurtain, easeSoft } from "@/lib/motion";

const WORDS: { text: string; gradient: boolean }[] = [
  { text: "DURBIN", gradient: false },
  { text: "FILMS", gradient: true },
];

const SEEN_KEY = "durbin-loader-seen";
const LETTER_LEAD = 0.08;
const LETTER_STEP = 0.045;
const BAR_DELAY = 0.15;
const BAR_DURATION = 1.45;
const BAR_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/**
 * Opening sequence, about 1.75s plus the wipe:
 *
 *  0.00s  soft glow breathes in behind the centre
 *  0.08s  the eleven letters of DURBIN FILMS rise one by one, 45ms apart
 *  0.15s  the progress bar fills over 1.45s while a counter runs 00 to 100
 *  1.75s  mark lifts and fades, glow blooms out, curtain sweeps up with a
 *         lit edge, and the hero headline starts its own word reveal
 *
 * Under prefers-reduced-motion nothing is shown and the page is ready at once.
 * FILMS keeps one continuous gradient because each letter paints its own
 * slice of a five-letter-wide background.
 */
export function Loader() {
  const { ready, setReady } = useReady();
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);

  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(2, "0"));
  const barWidth = useTransform(progress, (v) => `${v}%`);

  useEffect(() => {
    if (reduce) {
      setReady();
      return;
    }
    // Play once per browser session; coming back from a detail page skips it.
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        setReady();
        setGone(true);
        return;
      }
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: play normally */
    }
    const controls = animate(progress, 100, { duration: BAR_DURATION, delay: BAR_DELAY, ease: BAR_EASE });
    const t = window.setTimeout(setReady, LOADER_MS);
    return () => {
      controls.stop();
      window.clearTimeout(t);
    };
  }, [reduce, setReady, progress]);

  if (reduce || gone) return null;

  let letter = 0;

  return (
    <>
      <motion.div
        className="loader"
        aria-hidden="true"
        initial={false}
        animate={ready ? { opacity: 0, transitionEnd: { visibility: "hidden" } } : { opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeInOut", delay: ready ? 0.12 : 0 }}
      >
        <motion.div
          className="loader-glow"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={ready ? { opacity: 0, scale: 1.7 } : { opacity: 1, scale: 1 }}
          transition={{ duration: ready ? 0.7 : 1.4, ease: easeSoft }}
        />

        <motion.div
          className="loader-stack"
          initial={false}
          animate={ready ? { y: -16, scale: 0.96, opacity: 0 } : { y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeSoft }}
        >
          <div className="mark">
            {WORDS.map((word) => (
              <span key={word.text} className="mark-word">
                {word.text.split("").map((ch, i) => {
                  const n = letter++;
                  const style = word.gradient
                    ? ({
                        "--slices": `${word.text.length * 100}%`,
                        "--pos": `${(i / (word.text.length - 1)) * 100}%`,
                      } as React.CSSProperties)
                    : undefined;
                  return (
                    <motion.span
                      key={`${word.text}-${i}`}
                      className={`mark-letter${word.gradient ? " grad-slice" : ""}`}
                      style={style}
                      initial={{ y: "112%", rotate: 3 }}
                      animate={{ y: "0%", rotate: 0 }}
                      transition={{ duration: 0.75, ease: easeSoft, delay: LETTER_LEAD + n * LETTER_STEP }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </div>

          <div className="bar-row">
            <div className="bar">
              <motion.i style={{ width: barWidth }} />
            </div>
            <motion.span className="count">{count}</motion.span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="curtain"
        aria-hidden="true"
        initial={false}
        animate={{ y: ready ? "-100%" : "0%" }}
        transition={{ duration: 0.9, ease: easeCurtain, delay: ready ? 0.05 : 0 }}
        onAnimationComplete={() => {
          if (ready) setGone(true);
        }}
      >
        <span className="curtain-edge" />
      </motion.div>
    </>
  );
}
