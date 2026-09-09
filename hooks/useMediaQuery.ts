"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Always returns `false` on the server and on the
 * first client render, then updates in an effect so markup never mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
