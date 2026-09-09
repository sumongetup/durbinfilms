"use client";

import { Backdrop } from "@/components/ui/Backdrop";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTrailer } from "@/components/TrailerModal";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { SplitWords } from "@/components/ui/SplitWords";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { blurbOf, chipOf, metaOf, playLabel, playableOf } from "@/lib/work";
import type { Work } from "@/lib/types";

/** Detail-page hero: same backdrop treatment as the home hero, one production. */
export function WorkHeader({ work }: { work: Work }) {
  const reduce = useReducedMotion();
  const { open } = useTrailer();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.22));
  const play = playableOf(work);
  const blurb = blurbOf(work);

  return (
    <section className="hero hero-work">
      <motion.div className="hero-bg" style={{ y }} aria-hidden="true">
        <div className="kb">
          <Backdrop src={work.backdrop} priority />
        </div>
      </motion.div>
      <div className="wrap hero-in">
        <div className="hero-copy">
          <Kicker>{work.badge}</Kicker>
          <h1>
            <SplitWords text={work.title} />
          </h1>
          {work.titleBn ? <p className="title-bn">{work.titleBn}</p> : null}
          <div className="meta">
            <span className="chip-hot">
              <i className="pulse" aria-hidden="true" />
              {work.views ? `${work.views} views` : chipOf(work)}
            </span>
            <span>{metaOf(work)}</span>
          </div>
          {blurb ? <p className="syn">{blurb}</p> : null}
          <div className="btns">
            {play ? (
              <Button
                onClick={() =>
                  open({
                    title: work.title,
                    youtubeId: play.id,
                    kind: play.kind,
                    start: play.kind === "trailer" ? work.trailerStart : undefined,
                    watchUrl: work.watchUrl,
                  })
                }
              >
                <span aria-hidden="true">▶</span> {playLabel(play.kind)}
              </Button>
            ) : null}
            {work.watchUrl ? (
              <Button href={work.watchUrl} variant={play ? "ghost" : "primary"} target="_blank" rel="noopener noreferrer">
                Watch on YouTube
              </Button>
            ) : (
              <Button href="/work/" variant="ghost">
                Browse all work
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
