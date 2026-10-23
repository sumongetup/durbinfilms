"use client";

import { useEffect, useMemo, useState } from "react";
import { Kicker } from "@/components/ui/Kicker";
import { PosterCard } from "@/components/ui/PosterCard";
import { useUI } from "@/components/providers/LocaleProvider";
import { digits, type Locale } from "@/lib/i18n";
import { featuringOf } from "@/lib/work";
import type { Work, WorkType } from "@/lib/types";

export interface WorkGroup {
  id: string;
  platform: string;
  heading: string;
}

const ALL = "all";

/**
 * The All work listing. With no filter active it shows one section per
 * channel plus a songs section; with any filter or search it shows one flat
 * grid of matches. `?q=` in the URL pre-fills the search box, which is what
 * the site's SearchAction structured data points at.
 */
export function WorkBrowser({ works, groups, locale }: { works: Work[]; groups: WorkGroup[]; locale: Locale }) {
  const ui = useUI();
  const t = ui.browser;
  const [channel, setChannel] = useState(ALL);
  const [type, setType] = useState<WorkType | typeof ALL>(ALL);
  const [year, setYear] = useState(ALL);
  const [q, setQ] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);

  const platforms = useMemo(() => groups.map((g) => g.platform).filter((p) => works.some((w) => w.platform === p)), [groups, works]);
  const types = useMemo(() => (Object.keys(t.types) as WorkType[]).filter((type) => works.some((w) => w.type === type)), [t, works]);
  const years = useMemo(
    () => [...new Set(works.map((w) => w.year).filter((y) => /^\d{4}$/.test(y)))].sort((a, b) => b.localeCompare(a)),
    [works],
  );

  const needle = q.trim().toLowerCase();
  const active = channel !== ALL || type !== ALL || year !== ALL || needle.length > 0;

  const matches = useMemo(() => {
    if (!active) return works;
    return works.filter((w) => {
      if (channel !== ALL && w.platform !== channel) return false;
      if (type !== ALL && w.type !== type) return false;
      if (year !== ALL && w.year !== year) return false;
      if (needle) {
        const hay = [w.title, w.titleBn ?? "", w.altTitle ?? "", w.platform, w.channel, featuringOf(w), ...(w.credits ?? []).map((c) => c.name)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [active, works, channel, type, year, needle]);

  const reset = () => {
    setChannel(ALL);
    setType(ALL);
    setYear(ALL);
    setQ("");
  };

  const chip = (selected: boolean, label: string, onClick: () => void, key: string) => (
    <button key={key} type="button" className={`chip filter-chip${selected ? " hot" : ""}`} aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <>
      <div className="wrap filters" role="search">
        <input
          type="search"
          className="search"
          placeholder={t.placeholder}
          aria-label={t.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="filter-row" role="group" aria-label={t.channelGroup}>
          <b>{t.channel}</b>
          {chip(channel === ALL, t.all, () => setChannel(ALL), "all")}
          {platforms.map((p) => chip(channel === p, p, () => setChannel(p), p))}
        </div>
        <div className="filter-row" role="group" aria-label={t.typeGroup}>
          <b>{t.type}</b>
          {chip(type === ALL, t.all, () => setType(ALL), "all")}
          {types.map((type_) => chip(type === type_, t.types[type_], () => setType(type_), type_))}
          <select className="filter-select ml-2" aria-label={t.year} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value={ALL}>{t.anyYear}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {digits(locale, y)}
              </option>
            ))}
          </select>
          {active ? (
            <button type="button" className="chip filter-chip" onClick={reset}>
              {t.clear}
            </button>
          ) : null}
        </div>
      </div>

      {active ? (
        <section className="wrap" aria-live="polite">
          <p className="results">
            {matches.length === 0 ? t.none : t.count(matches.length, works.length)}
          </p>
          {matches.length > 0 && (
            <ul className="work-grid">
              {matches.map((w, i) => (
                <PosterCard key={w.slug} work={w} index={i} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {groups
            .map((g) => ({ ...g, works: works.filter((w) => w.platform === g.platform && w.type !== "song") }))
            .filter((g) => g.works.length > 0)
            .map((g) => (
              <section key={g.id} className="sec wrap" id={g.id} aria-labelledby={`${g.id}-heading`}>
                <Kicker>{g.platform}</Kicker>
                <h2 id={`${g.id}-heading`} className="mt-[10px] text-[clamp(24px,3vw,40px)]">
                  {g.heading}
                </h2>
                <ul className="work-grid">
                  {g.works.map((w, i) => (
                    <PosterCard key={w.slug} work={w} index={i} />
                  ))}
                </ul>
              </section>
            ))}
          {works.some((w) => w.type === "song") && (
            <section className="sec wrap" id="songs" aria-labelledby="songs-heading">
              <Kicker>{ui.rails.songsKicker}</Kicker>
              <h2 id="songs-heading" className="mt-[10px] text-[clamp(24px,3vw,40px)]">
                {ui.rails.songs}
              </h2>
              <ul className="work-grid">
                {works
                  .filter((w) => w.type === "song")
                  .map((w, i) => (
                    <PosterCard key={w.slug} work={w} index={i} />
                  ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
