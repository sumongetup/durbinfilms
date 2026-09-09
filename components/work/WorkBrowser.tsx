"use client";

import { useEffect, useMemo, useState } from "react";
import { Kicker } from "@/components/ui/Kicker";
import { PosterCard } from "@/components/ui/PosterCard";
import { featuringOf } from "@/lib/work";
import type { Work, WorkType } from "@/lib/types";

export interface WorkGroup {
  id: string;
  platform: string;
  heading: string;
}

const TYPE_LABEL: Record<WorkType, string> = {
  drama: "Dramas",
  series: "Serials",
  short: "Short films",
  song: "Songs",
  brand: "Brand films",
  documentary: "Documentaries",
};

const ALL = "all";

/**
 * The All work listing. With no filter active it shows one section per
 * channel plus a songs section; with any filter or search it shows one flat
 * grid of matches. `?q=` in the URL pre-fills the search box, which is what
 * the site's SearchAction structured data points at.
 */
export function WorkBrowser({ works, groups }: { works: Work[]; groups: WorkGroup[] }) {
  const [channel, setChannel] = useState(ALL);
  const [type, setType] = useState<WorkType | typeof ALL>(ALL);
  const [year, setYear] = useState(ALL);
  const [q, setQ] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQ(initial);
  }, []);

  const platforms = useMemo(() => groups.map((g) => g.platform).filter((p) => works.some((w) => w.platform === p)), [groups, works]);
  const types = useMemo(() => (Object.keys(TYPE_LABEL) as WorkType[]).filter((t) => works.some((w) => w.type === t)), [works]);
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
        const hay = [w.title, w.titleBn ?? "", w.platform, w.channel, featuringOf(w), ...(w.credits ?? []).map((c) => c.name)]
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
          placeholder="Search titles, cast, channel…"
          aria-label="Search productions"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="filter-row" role="group" aria-label="Channel">
          <b>CHANNEL</b>
          {chip(channel === ALL, "All", () => setChannel(ALL), "all")}
          {platforms.map((p) => chip(channel === p, p, () => setChannel(p), p))}
        </div>
        <div className="filter-row" role="group" aria-label="Type">
          <b>TYPE</b>
          {chip(type === ALL, "All", () => setType(ALL), "all")}
          {types.map((t) => chip(type === t, TYPE_LABEL[t], () => setType(t), t))}
          <select className="filter-select ml-2" aria-label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value={ALL}>Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {active ? (
            <button type="button" className="chip filter-chip" onClick={reset}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {active ? (
        <section className="wrap" aria-live="polite">
          <p className="results">
            {matches.length === 0 ? "Nothing matches. Try a different word or clear the filters." : `${matches.length} of ${works.length} productions`}
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
              <Kicker>MUSIC</Kicker>
              <h2 id="songs-heading" className="mt-[10px] text-[clamp(24px,3vw,40px)]">
                Songs and title tracks
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
