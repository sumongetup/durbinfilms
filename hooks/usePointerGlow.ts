"use client";

import { useCallback } from "react";
import type { PointerEvent } from "react";

/**
 * Writes the pointer position into `--mx` / `--my` on the element so the
 * radial-gradient glow in CSS follows the cursor. Same trick as the prototype.
 */
export function usePointerGlow<T extends HTMLElement = HTMLElement>() {
  return useCallback((e: PointerEvent<T>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);
}
