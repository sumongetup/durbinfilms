"use client";

import Image from "next/image";
import { useState } from "react";
import { playableOf, trailerEmbedUrl } from "@/lib/work";
import type { Work } from "@/lib/types";

/**
 * Click-to-play YouTube embed for the trailer, or for the full video when
 * there is no trailer. The iframe is only created after the visitor presses
 * play, so the page does not pay for YouTube's scripts on load.
 */
export function TrailerEmbed({ work }: { work: Work }) {
  const [playing, setPlaying] = useState(false);
  const play = playableOf(work);

  if (!play) {
    return (
      <div className="embed">
        <p className="embed-note m-0">Trailer coming soon.</p>
      </div>
    );
  }

  const label = play.kind === "trailer" ? `Play the trailer for ${work.title}` : `Play ${work.title}`;

  return (
    <>
      <div className="embed">
        {playing ? (
          <iframe
            src={trailerEmbedUrl(play.id, play.kind === "trailer" ? work.trailerStart : undefined)}
            title={play.kind === "trailer" ? `${work.title} trailer` : work.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" className="embed-face" onClick={() => setPlaying(true)} aria-label={label}>
            <Image src={work.backdrop} alt="" fill sizes="(max-width: 1400px) 100vw, 1272px" className="object-cover" />
            <span className="embed-play" aria-hidden="true">
              ▶
            </span>
          </button>
        )}
      </div>
      {work.watchUrl ? (
        <p className="embed-more">
          <a href={work.watchUrl} target="_blank" rel="noopener noreferrer">
            {play.kind === "trailer" ? "Watch the full drama on YouTube" : "Open on YouTube"}
          </a>
        </p>
      ) : null}
    </>
  );
}
