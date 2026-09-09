"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NavLink } from "@/lib/types";

/**
 * Full-screen menu under the 74px bar. Fades in, links stagger up 60ms apart.
 * Body scroll is locked while open and focus moves to the first link.
 */
export function MobileSheet({ open, onClose, links }: { open: boolean; onClose: () => void; links: NavLink[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          ref={ref}
          id="mobile-sheet"
          className="sheet"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Link href={l.href} onClick={onClose}>
                {l.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
