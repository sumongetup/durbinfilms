import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PosterRail } from "@/components/PosterRail";
import { TrailerProvider } from "@/components/TrailerModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ReadyProvider } from "@/components/providers/ReadyProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { CreditsList } from "@/components/work/CreditsList";
import { Gallery } from "@/components/work/Gallery";
import { TrailerEmbed } from "@/components/work/TrailerEmbed";
import { WorkHeader } from "@/components/work/WorkHeader";
import { formatLabel, getRelated, getSite, getWork, getWorks, outletLabel, outletOf } from "@/lib/content";
import { CTA, PAGE_LINKS } from "@/lib/nav";
import { productionJsonLd, workMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks().map((w) => ({ slug: w.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  return work ? workMetadata(work) : {};
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const site = getSite();
  const credits = work.credits ?? [];
  const gallery = work.gallery ?? [];
  const related = getRelated(work);

  return (
    <ReadyProvider>
      <TrailerProvider>
        <div className="page" data-page="work">
          <Nav links={PAGE_LINKS} cta={CTA} />
          <main id="main">
            <WorkHeader work={work} />

            <section className="sec wrap" aria-labelledby="trailer-heading">
              <Reveal className="info mt-0 pt-0 border-t-0">
                <div>
                  <b>YEAR</b>
                  {work.year}
                </div>
                <div>
                  <b>FORMAT</b>
                  {formatLabel(work)}
                </div>
                <div>
                  <b>{outletLabel(work)}</b>
                  {outletOf(work) || "—"}
                </div>
                {work.views ? (
                  <div>
                    <b>VIEWS</b>
                    {work.views} on YouTube
                  </div>
                ) : (
                  <div>
                    <b>EPISODES</b>
                    {work.episodes}
                  </div>
                )}
              </Reveal>
              <div className="mt-(--pad)">
                <Kicker>{work.youtubeId ? "TRAILER" : "WATCH"}</Kicker>
                <h2 id="trailer-heading">{work.youtubeId ? "Watch the trailer" : `Watch ${work.title}`}</h2>
                <TrailerEmbed work={work} />
              </div>
            </section>

            {credits.length > 0 && (
              <section className="sec wrap" aria-labelledby="credits-heading">
                <Kicker>CAST AND CREW</Kicker>
                <h2 id="credits-heading">Who made it</h2>
                <CreditsList credits={credits} />
              </section>
            )}

            {gallery.length > 0 && (
              <section className="sec wrap" aria-labelledby="gallery-heading">
                <Kicker>GALLERY</Kicker>
                <h2 id="gallery-heading">Stills</h2>
                <Gallery images={gallery} title={work.title} />
              </section>
            )}

            {related.length > 0 && (
              <PosterRail id="more" kicker="MORE FROM DURBIN FILMS" heading="Other productions" works={related} />
            )}

            <ContactBlock site={site} />
          </main>
          <Footer site={site} />
          <WhatsAppButton site={site} />
        </div>
        <JsonLd data={productionJsonLd(work)} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
