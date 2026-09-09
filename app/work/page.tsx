import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { TrailerProvider } from "@/components/TrailerModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ReadyProvider } from "@/components/providers/ReadyProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kicker } from "@/components/ui/Kicker";
import { WorkBrowser, type WorkGroup } from "@/components/work/WorkBrowser";
import { getSite, getWorks } from "@/lib/content";
import { CTA, PAGE_LINKS } from "@/lib/nav";
import { allWorkJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "All work: dramas, serials, short films and songs",
  description:
    "Every Durbin Films production in one place. Bangla natoks, Eid specials, serials, short films and songs from the DURBIN FILMS, DURBIN DRAMA and DURBIN channels, with cast, year and where to watch.",
  alternates: { canonical: "/work/" },
  openGraph: { title: "All work — Durbin Films", url: "/work/" },
};

/** One section per channel, the studio's own channel first, then all songs. */
const GROUPS: WorkGroup[] = [
  { id: "durbin-films", platform: "DURBIN FILMS", heading: "Dramas and telefilms" },
  { id: "durbin-drama", platform: "DURBIN DRAMA", heading: "Natoks and serials" },
  { id: "durbin", platform: "DURBIN", heading: "Natoks and short films" },
];

export default function AllWorkPage() {
  const site = getSite();
  const works = getWorks();

  return (
    <ReadyProvider>
      <TrailerProvider>
        <div className="page" data-page="work">
          <Nav links={PAGE_LINKS} cta={CTA} />
          <main id="main">
            <section className="wrap pt-[150px]">
              <Kicker>ALL WORK</Kicker>
              <h1 className="mt-3 text-[clamp(32px,5vw,64px)]">Every production, by channel</h1>
              <p className="body mt-4">
                {works.length} productions across the studio&apos;s three YouTube channels. Click a poster for the full page,
                or the play button to watch.
              </p>
            </section>
            <WorkBrowser works={works} groups={GROUPS} />
            <ContactBlock site={site} />
          </main>
          <Footer site={site} />
          <WhatsAppButton site={site} />
        </div>
        <JsonLd data={allWorkJsonLd()} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
