"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Framer Motion honours prefers-reduced-motion site-wide through this config. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
