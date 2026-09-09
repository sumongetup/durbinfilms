"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReady } from "@/components/providers/ReadyProvider";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { SplitWords } from "@/components/ui/SplitWords";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { easeCurtain, easeSoft } from "@/lib/motion";
import type { Founder } from "@/lib/types";

const CLOSED = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * Founder hero: dim backdrop with 0.18x parallax and a 20s zoom, a 4:5
 * portrait that wipes open 200ms after the page is ready, and the name
 * animating in word by word (80ms stagger, 180ms lead).
 */
export function FounderHero({ founder }: { founder: Founder }) {
  const reduce = useReducedMotion();
  const { ready } = useReady();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.18));
  const shown = ready || reduce;

  return (
    <section className="fhero">
      <motion.div className="fhero-bg" style={{ y }} aria-hidden="true">
        <div className="kb">
          <Image src={founder.backdrop} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
      </motion.div>
      <div className="wrap fhero-in">
        <motion.div
          className="shot"
          initial={false}
          animate={{ clipPath: shown ? OPEN : CLOSED }}
          transition={{ duration: reduce ? 0 : 1.1, ease: easeCurtain, delay: reduce ? 0 : 0.2 }}
        >
          <motion.div
            className="shot-img"
            initial={false}
            animate={{ scale: shown ? 1 : 1.12 }}
            transition={{ duration: 1.6, ease: easeSoft, delay: 0.2 }}
          >
            <Image src={founder.portrait} alt={founder.name} fill priority sizes="(max-width: 860px) 100vw, 36vw" className="object-cover" />
          </motion.div>
        </motion.div>
        <div>
          <Kicker>{founder.kicker}</Kicker>
          <h1>
            <SplitWords text={founder.name} base={180} step={80} />
          </h1>
          <div className="roles">
            {founder.roles.map((r) => (
              <span key={r} className="chip hot">
                {r}
              </span>
            ))}
          </div>
          <p className="intro">{founder.intro}</p>
          <div className="btns">
            <Button href="#contact">Contact</Button>
            <Button href="/#dramas" variant="ghost">
              See the work
            </Button>
          </div>
          {founder.contact.links && founder.contact.links.length > 0 ? (
            <ul className="social-row" aria-label={`${founder.name} on social media`}>
              {founder.contact.links.map((l) => (
                <li key={l.label}>
                  <a className="chip" href={l.href} target="_blank" rel="noopener noreferrer me">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
