"use client";

import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import { useLocale } from "./providers/LocaleProvider";
import { usePointerGlow } from "@/hooks/usePointerGlow";
import { UI, channelName, countLabel, digits, spell } from "@/lib/i18n";
import type { ChannelData } from "@/lib/types";

/**
 * The whole Durbin network, one card per YouTube channel, with the counts
 * each channel publishes. Refresh them with `npm run channels`.
 */
export function ChannelGrid({ kicker, heading, lead, data }: { kicker: string; heading: string; lead: string; data: ChannelData }) {
  const glow = usePointerGlow<HTMLDivElement>();
  const locale = useLocale();
  const t = UI[locale].channels;
  const kinds = UI[locale].channelKinds;

  return (
    <section className="sec wrap" id="channels" aria-labelledby="channels-heading">
      <Kicker>{kicker}</Kicker>
      <h2 className="svc-h2" id="channels-heading">
        {/* {channels} is filled from the live count, so the wording cannot
            drift when a channel is added or dropped. "Five channels" reads
            better in a headline than "5 channels". */}
        {heading.replace(/\{channels\}/g, spell(locale, data.totals.channels))}
      </h2>
      <p className="body mt-4">{lead}</p>

      <dl className="net-totals">
        <div>
          <dt>{t.channels}</dt>
          <dd className="grad">{digits(locale, data.totals.channels)}</dd>
        </div>
        <div>
          <dt>{t.subscribers}</dt>
          <dd className="grad">{countLabel(locale, data.totals.subscribersLabel, data.totals.subscribers)}</dd>
        </div>
        <div>
          <dt>{t.videos}</dt>
          <dd className="grad">{digits(locale, data.totals.videosLabel)}</dd>
        </div>
      </dl>

      <ul className="net-grid">
        {data.channels.map((c, i) => (
          <Reveal as="li" key={c.handle} className="net-card" delay={(i % 6) * 0.06} onPointerMove={glow}>
            <a href={c.url} target="_blank" rel="noopener noreferrer">
              <span className="net-kind">{kinds[c.kind] ?? c.kind}</span>
              <h3>
                {channelName(locale, c.label)}
                {c.primary ? <span className="net-flag">{t.primary}</span> : null}
              </h3>
              <p className="net-stats">
                <strong>{countLabel(locale, c.subscribersLabel, c.subscribers)}</strong> {t.subs}
                <span aria-hidden="true"> · </span>
                {countLabel(locale, c.videosLabel, c.videos)} {t.vids}
              </p>
              <span className="net-handle">{c.handle}</span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
