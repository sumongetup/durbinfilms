"use client";

import { Backdrop } from "@/components/ui/Backdrop";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTrailer } from "@/components/TrailerModal";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { SplitWords } from "@/components/ui/SplitWords";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { UI, badgeLabel, countLabel, localePath } from "@/lib/i18n";
import { blurbOf, chipOf, metaOf, playLabel, playableOf } from "@/lib/work";
import type { Work } from "@/lib/types";

/** Detail-page hero: same backdrop treatment as the home hero, one production. */
export function WorkHeader({ work }: { work: Work }) {
  const reduce = useReducedMotion();
  const { open } = useTrailer();
  const locale = useLocale();
  const t = UI[locale];
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => (reduce ? 0 : v * 0.22));
  const play = playableOf(work);
  const blurb = blurbOf(work, locale);

  return (
    <section className="hero hero-work">
      <motion.div className="hero-bg" style={{ y }} aria-hidden="true">
        <div className="kb">
          <Backdrop src={work.backdrop} priority />
        </div>
      </motion.div>
      <div className="wrap hero-in">
        <div className="hero-copy">
          <Kicker>{badgeLabel(locale, work.badge)}</Kicker>
          <h1>
            <SplitWords text={work.title} />
          </h1>
          {work.altTitle ? (
            <p className="title-bn" lang={locale === "en" ? "bn" : "en"}>
              {work.altTitle}
            </p>
          ) : null}
          <div className="meta">
            <span className="chip-hot">
              <i className="pulse" aria-hidden="true" />
              {work.views ? t.poster.views(countLabel(locale, work.views)) : chipOf(work, locale)}
            </span>
            <span>{metaOf(work, locale)}</span>
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
                <span aria-hidden="true">▶</span> {playLabel(play.kind, locale)}
              </Button>
            ) : null}
            {work.watchUrl ? (
              <Button href={work.watchUrl} variant={play ? "ghost" : "primary"} target="_blank" rel="noopener noreferrer">
                {t.work.watchOnYoutube}
              </Button>
            ) : (
              <Button href={localePath(locale, "/work/")} variant="ghost">
                {t.work.browseAll}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
