"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easeWord } from "@/lib/motion";
import { trailerEmbedUrl } from "@/lib/work";

export interface Trailer {
  title: string;
  youtubeId: string;
  /** Whether the video is a trailer or the full production. */
  kind?: "trailer" | "full";
  /** Seconds into the trailer to start from. */
  start?: number;
  /** Link to the full production, shown as a second action in the footer. */
  watchUrl?: string;
}

interface TrailerContextValue {
  open: (trailer: Trailer) => void;
  close: () => void;
}

const TrailerContext = createContext<TrailerContextValue>({ open: () => {}, close: () => {} });

export function useTrailer(): TrailerContextValue {
  return useContext(TrailerContext);
}

/**
 * Owns the single trailer modal for a page. Anything that can play a trailer
 * (hero button, poster play buttons, detail page) calls `open()` from
 * `useTrailer()`. While open, the rest of the page is `inert` and scrolling is
 * locked; on close, focus returns to the element that opened it.
 */
export function TrailerProvider({ children }: { children: ReactNode }) {
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const isOpen = trailer !== null;

  const open = useCallback((next: Trailer) => {
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setTrailer(next);
  }, []);
  const close = useCallback(() => setTrailer(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      lastFocus.current?.focus();
    };
  }, [isOpen]);

  return (
    <TrailerContext.Provider value={value}>
      <div inert={isOpen || undefined}>{children}</div>
      <TrailerModal trailer={trailer} onClose={close} />
    </TrailerContext.Provider>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

export function TrailerModal({ trailer, onClose }: { trailer: Trailer | null; onClose: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = trailer !== null;

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !boxRef.current) return;
      const nodes = Array.from(boxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {trailer && (
        <motion.div
          key="trailer-modal"
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={boxRef}
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-title"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: easeWord }}
          >
            <div className="modal-video">
              {trailer.youtubeId ? (
                <iframe
                  src={trailerEmbedUrl(trailer.youtubeId, trailer.start)}
                  title={`${trailer.title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <p className="m-0">Trailer coming soon.</p>
              )}
            </div>
            <div className="modal-foot">
              <h3 id="trailer-title">{trailer.kind === "full" ? trailer.title : `${trailer.title} — trailer`}</h3>
              <div className="modal-actions">
                {trailer.watchUrl ? (
                  <a className="btn btn-primary" href={trailer.watchUrl} target="_blank" rel="noopener noreferrer">
                    {trailer.kind === "full" ? "Open on YouTube" : "Watch the full drama"}
                  </a>
                ) : null}
                <button ref={closeRef} type="button" className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
