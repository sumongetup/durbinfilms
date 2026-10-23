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
import { formatLabel, getFounder, getRelated, getSite, outletLabel, outletOf } from "@/lib/content";
import { UI, countLabel, digits, localePath, otherLocale, type Locale } from "@/lib/i18n";
import { cta, pageLinks } from "@/lib/nav";
import { founderNames, productionJsonLd } from "@/lib/seo";
import type { Work } from "@/lib/types";

/** One production's page. `work` is already read in `locale` (see getWork). */
export function WorkView({ work, locale }: { work: Work; locale: Locale }) {
  const site = getSite(locale);
  const t = UI[locale].work;
  const credits = work.credits ?? [];
  const gallery = work.gallery ?? [];
  const related = getRelated(work, locale);
  const founderLink = { names: founderNames(locale), label: getFounder(locale).name, href: localePath(locale, "/founder/") };

  return (
    <ReadyProvider>
      <TrailerProvider>
        <div className="page" data-page="work">
          <Nav
            links={pageLinks(locale)}
            cta={cta(locale)}
            switchHref={localePath(otherLocale(locale), `/work/${work.slug}/`)}
          />
          <main id="main">
            <WorkHeader work={work} />

            <section className="sec wrap" aria-labelledby="trailer-heading">
              <Reveal className="info mt-0 pt-0 border-t-0">
                <div>
                  <b>{t.year}</b>
                  {digits(locale, work.year)}
                </div>
                <div>
                  <b>{t.format}</b>
                  {formatLabel(work, locale)}
                </div>
                <div>
                  <b>{outletLabel(work, locale)}</b>
                  {outletOf(work) || "—"}
                </div>
                {work.views ? (
                  <div>
                    <b>{t.views}</b>
                    {t.viewsOnYoutube(countLabel(locale, work.views))}
                  </div>
                ) : (
                  <div>
                    <b>{t.episodes}</b>
                    {digits(locale, work.episodes)}
                  </div>
                )}
              </Reveal>
              <div className="mt-(--pad)">
                <Kicker>{work.youtubeId ? t.trailerKicker : t.watchKicker}</Kicker>
                <h2 id="trailer-heading">{work.youtubeId ? t.watchTrailer : t.watchTitle(work.title)}</h2>
                <TrailerEmbed work={work} />
              </div>
            </section>

            {credits.length > 0 && (
              <section className="sec wrap" aria-labelledby="credits-heading">
                <Kicker>{t.creditsKicker}</Kicker>
                <h2 id="credits-heading">{t.credits}</h2>
                <CreditsList credits={credits} locale={locale} link={founderLink} />
              </section>
            )}

            {gallery.length > 0 && (
              <section className="sec wrap" aria-labelledby="gallery-heading">
                <Kicker>{t.galleryKicker}</Kicker>
                <h2 id="gallery-heading">{t.gallery}</h2>
                <Gallery images={gallery} title={work.title} locale={locale} />
              </section>
            )}

            {related.length > 0 && <PosterRail id="more" kicker={t.moreKicker} heading={t.more} works={related} />}

            <ContactBlock site={site} locale={locale} />
          </main>
          <Footer site={site} locale={locale} />
          <WhatsAppButton site={site} locale={locale} />
        </div>
        <JsonLd data={productionJsonLd(work, locale)} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
