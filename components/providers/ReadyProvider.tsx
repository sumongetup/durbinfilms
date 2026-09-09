"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface ReadyContextValue {
  /** True once the page is allowed to play its entrance animations. */
  ready: boolean;
  setReady: () => void;
}

const ReadyContext = createContext<ReadyContextValue>({ ready: true, setReady: () => {} });

/**
 * The prototype toggles a `ready` class on <html> when the loader finishes
 * (home) or on the first animation frame (other pages). The hero headline,
 * curtain and portrait reveal all listen to it.
 */
export function ReadyProvider({ children, withLoader = false }: { children: ReactNode; withLoader?: boolean }) {
  const [ready, set] = useState(false);
  const setReady = useCallback(() => set(true), []);

  useEffect(() => {
    if (withLoader) return;
    const id = requestAnimationFrame(setReady);
    return () => cancelAnimationFrame(id);
  }, [withLoader, setReady]);

  const value = useMemo(() => ({ ready, setReady }), [ready, setReady]);
  return <ReadyContext.Provider value={value}>{children}</ReadyContext.Provider>;
}

export function useReady(): ReadyContextValue {
  return useContext(ReadyContext);
}
