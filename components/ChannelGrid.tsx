"use client";

import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import type { ChannelData } from "@/lib/types";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "Five channels" reads better in a headline than "5 channels". */
function spell(n: number): string {
  const word = WORDS[n];
  return word ? word[0].toUpperCase() + word.slice(1) : String(n);
}

/**
 * The whole Durbin network, one card per YouTube channel, with the counts
 * each channel publishes. Refresh them with `npm run channels`.
 */
export function ChannelGrid({ kicker, heading, lead, data }: { kicker: string; heading: string; lead: string; data: ChannelData }) {
  const glow = usePointerGlow<HTMLDivElement>();

  return (
    <section className="sec wrap" id="channels" aria-labelledby="channels-heading">
      <Kicker>{kicker}</Kicker>
      <h2 className="svc-h2" id="channels-heading">
        {/* {channels} is filled from the live count, so the wording cannot
            drift when a channel is added or dropped. */}
        {heading.replace(/\{channels\}/g, spell(data.totals.channels))}
      </h2>
      <p className="body mt-4">{lead}</p>

      <dl className="net-totals">
        <div>
          <dt>Channels</dt>
          <dd className="grad">{data.totals.channels}</dd>
        </div>
        <div>
          <dt>Subscribers</dt>
          <dd className="grad">{data.totals.subscribersLabel}</dd>
        </div>
        <div>
          <dt>Videos published</dt>
          <dd className="grad">{data.totals.videosLabel}</dd>
        </div>
      </dl>

      <ul className="net-grid">
        {data.channels.map((c, i) => (
          <Reveal as="li" key={c.handle} className="net-card" delay={(i % 6) * 0.06} onPointerMove={glow}>
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              <span className="net-kind">{c.kind}</span>
              <h3>
                {c.label}
                {c.primary ? <span className="net-flag">This studio</span> : null}
              </h3>
              <p className="net-stats">
                <strong>{c.subscribersLabel}</strong> subscribers
                <span aria-hidden="true"> · </span>
                {c.videosLabel} videos
              </p>
              <span className="net-handle">{c.handle}</span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
