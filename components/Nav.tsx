"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { MobileSheet } from "./MobileSheet";
import { Button } from "./ui/Button";
import type { NavLink } from "@/lib/types";

/**
 * Fixed top bar. Transparent over the hero, solid with blur after 30px of
 * scroll. Under 960px the links and CTA hide behind a burger that opens the
 * MobileSheet.
 */
export function Nav({ links, cta }: { links: NavLink[]; cta: NavLink }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 30));
  useEffect(() => setSolid(window.scrollY > 30), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 960) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      <header className={`nav${solid ? " solid" : ""}`}>
        <div className="wrap nav-in">
          <Link className="logo" href="/" aria-label="Durbin Films, home">
            Durbin<span className="grad">Films</span>
          </Link>
          <nav className="links" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <Button href={cta.href} className="nav-cta">
            {cta.label}
          </Button>
          <button
            type="button"
            className={`burger${open ? " is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </header>
      <MobileSheet open={open} onClose={() => setOpen(false)} links={[...links, cta]} />
    </>
  );
}
