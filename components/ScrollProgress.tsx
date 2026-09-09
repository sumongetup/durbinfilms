"use client";

import { motion, useScroll } from "framer-motion";

/** The 3px gradient bar along the top edge that tracks page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="prog" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}
