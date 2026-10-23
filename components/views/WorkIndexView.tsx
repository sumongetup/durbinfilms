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
import { UI, localePath, otherLocale, type Locale } from "@/lib/i18n";
import { cta, pageLinks } from "@/lib/nav";
import { allWorkJsonLd } from "@/lib/seo";

/** One section per channel, the studio's own channel first, then all songs. */
function groups(locale: Locale): WorkGroup[] {
  const t = UI[locale].workIndex.groups;
  return [
    { id: "durbin-films", platform: "DURBIN FILMS", heading: t.films },
    { id: "durbin-drama", platform: "DURBIN DRAMA", heading: t.drama },
    { id: "durbin", platform: "DURBIN", heading: t.durbin },
  ];
}

export function WorkIndexView({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const works = getWorks(locale);
  const t = UI[locale].workIndex;

  return (
    <ReadyProvider>
      <TrailerProvider>
        <div className="page" data-page="work">
          <Nav links={pageLinks(locale)} cta={cta(locale)} switchHref={localePath(otherLocale(locale), "/work/")} />
          <main id="main">
            <section className="wrap pt-[150px]">
              <Kicker>{t.kicker}</Kicker>
              <h1 className="mt-3 text-[clamp(32px,5vw,64px)]">{t.heading}</h1>
              <p className="body mt-4">{t.lead(works.length)}</p>
            </section>
            <WorkBrowser works={works} groups={groups(locale)} locale={locale} />
            <ContactBlock site={site} locale={locale} />
          </main>
          <Footer site={site} locale={locale} />
          <WhatsAppButton site={site} locale={locale} />
        </div>
        <JsonLd data={allWorkJsonLd(locale)} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
