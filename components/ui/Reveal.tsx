"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { easeSoft, revealViewport } from "@/lib/motion";

const tags = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
  article: motion.article,
  figure: motion.figure,
  dl: motion.dl,
} as const;

type Props = HTMLMotionProps<"div"> & {
  as?: keyof typeof tags;
  /** Seconds. The prototype staggers siblings by 70ms. */
  delay?: number;
};

/**
 * The prototype's `.rise` element: fades and lifts in once when it enters the
 * viewport. Transform is skipped automatically under prefers-reduced-motion
 * via MotionConfig; opacity still fades, which is not motion.
 */
export function Reveal({ as = "div", delay = 0, children, ...rest }: Props) {
  const Tag = tags[as] as unknown as typeof motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={revealViewport}
      transition={{ duration: 0.8, ease: easeSoft, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
