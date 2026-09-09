"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { useReady } from "@/components/providers/ReadyProvider";
import { easeWord } from "@/lib/motion";

/**
 * Word-by-word headline reveal. Each word sits in an overflow-hidden span and
 * slides up from 105% once the page is `ready`, staggered like the prototype.
 */
export function SplitWords({ text, base = 200, step = 70 }: { text: string; base?: number; step?: number }) {
  const { ready } = useReady();
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((word, n) => (
        <Fragment key={`${word}-${n}`}>
          <span className="word">
            <motion.b
              initial={{ y: "105%" }}
              animate={{ y: ready ? "0%" : "105%" }}
              transition={{ duration: 0.85, ease: easeWord, delay: (base + n * step) / 1000 }}
            >
              {word}
            </motion.b>
          </span>
          {n < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}
