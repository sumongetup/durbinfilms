"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useReady } from "./providers/ReadyProvider";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { LOADER_MS, easeCurtain, easeSoft } from "@/lib/motion";

const SEEN_KEY = "durbin-loader-seen";
const BAR_DELAY = 0.15;
const BAR_DURATION = 1.45;
const BAR_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const HIDDEN = "inset(0 100% 0 0)";
const SHOWN = "inset(0 0% 0 0)";

/**
 * Opening sequence, about 1.75s plus the wipe:
 *
 *  0.00s  soft glow breathes in behind the centre
 *  0.15s  the logo wipes in from the left over 1.1s
 *  0.15s  the progress bar fills over 1.45s while a counter runs 00 to 100
 *  1.75s  the mark lifts and fades, the glow blooms out, and the curtain
 *         sweeps up with a lit edge
 *
 * Skipped entirely under prefers-reduced-motion, and on any visit after the
 * first in a session so moving between pages is not gated by it.
 */
export function Loader() {
  const { ready, setReady } = useReady();
  const reduce = useReducedMotion();
  const [skip, setSkip] = useState<boolean | null>(null);
  const [gone, setGone] = useState(false);

  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => String(Math.round(v)).padStart(2, "0"));
  const barWidth = useTransform(progress, (v) => `${v}%`);

  // Decide on the client only, so the server markup never disagrees.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode: just play it */
    }
    setSkip(seen);
  }, []);

  useEffect(() => {
    if (skip === null) return;
    if (skip || reduce) {
      setReady();
      setGone(true);
      return;
    }
    const controls = animate(progress, 100, { duration: BAR_DURATION, delay: BAR_DELAY, ease: BAR_EASE });
    const t = window.setTimeout(setReady, LOADER_MS);
    return () => {
      controls.stop();
      window.clearTimeout(t);
    };
  }, [skip, reduce, setReady, progress]);

  if (skip === null || skip || reduce || gone) return null;

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
          <motion.div
            className="loader-mark"
            initial={{ clipPath: HIDDEN, opacity: 0 }}
            animate={{ clipPath: SHOWN, opacity: 1 }}
            transition={{ clipPath: { duration: 1.1, ease: easeSoft, delay: 0.15 }, opacity: { duration: 0.3, delay: 0.15 } }}
          >
            <Image src="/images/brand/logo.png" alt="" width={1400} height={568} priority className="loader-logo" />
          </motion.div>

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
