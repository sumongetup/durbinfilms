import { ChannelGrid } from "@/components/ChannelGrid";
import { ContactBlock } from "@/components/ContactBlock";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { HeroSlider } from "@/components/HeroSlider";
import { HorizontalProcess } from "@/components/HorizontalProcess";
import { Loader } from "@/components/Loader";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { PosterRail } from "@/components/PosterRail";
import { ServiceTiles } from "@/components/ServiceTiles";
import { StudioBlock } from "@/components/StudioBlock";
import { TrailerProvider } from "@/components/TrailerModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ReadyProvider } from "@/components/providers/ReadyProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { getByPlatform, getByType, getChannels, getFeaturedSlides, getHome, getSite, getWorks } from "@/lib/content";
import { UI, localePath, otherLocale, type Locale } from "@/lib/i18n";
import { cta, homeLinks } from "@/lib/nav";
import { faqJsonLd, homeJsonLd } from "@/lib/seo";

/** The studio's own channel leads the page; everything else follows by kind. */
const HOME_PLATFORM = "DURBIN FILMS";

export function HomeView({ locale }: { locale: Locale }) {
  const site = getSite(locale);
  const home = getHome(locale);
  const t = UI[locale].rails;
  const more = { label: t.more, href: localePath(locale, "/work/") };
  const ownDramas = getByPlatform(HOME_PLATFORM, locale).filter((w) => w.type === "drama");
  const otherDramas = getWorks(locale).filter((w) => (w.type === "drama" && w.platform !== HOME_PLATFORM) || w.type === "series");
  const shorts = getByType(["short", "documentary"], locale);
  const songs = getByType(["song"], locale);
  const channels = getChannels();

  return (
    <ReadyProvider withLoader>
      <TrailerProvider>
        <div className="page" data-page="home">
          <Loader />
          <Nav links={homeLinks(locale)} cta={cta(locale)} switchHref={localePath(otherLocale(locale), "/")} />
          <main id="main">
            <HeroSlider slides={getFeaturedSlides(locale)} headline={home.hero.headline} />
            <Marquee items={home.marquee} locale={locale} />
            {ownDramas.length > 0 && (
              <PosterRail id="dramas" kicker={HOME_PLATFORM} heading={t.dramas} works={ownDramas} more={more} />
            )}
            {otherDramas.length > 0 && (
              <PosterRail id="serials" kicker="DURBIN DRAMA · DURBIN" heading={t.serials} works={otherDramas} more={more} />
            )}
            {shorts.length > 0 && <PosterRail id="shorts" kicker={t.shortsKicker} heading={t.shorts} works={shorts} more={more} />}
            {songs.length > 0 && <PosterRail id="songs" kicker={t.songsKicker} heading={t.songs} works={songs} more={more} />}
            <ChannelGrid
              kicker={home.channels.kicker}
              heading={home.channels.heading}
              lead={home.channels.lead}
              data={channels}
            />
            <HorizontalProcess kicker={home.process.kicker} heading={home.process.heading} steps={home.process.steps} />
            <ServiceTiles
              kicker={home.services.kicker}
              heading={home.services.heading}
              lead={home.services.lead}
              tiles={home.services.tiles}
            />
            <StudioBlock portrait={site.studioImage} studio={home.studio} />
            <FaqSection kicker={home.faq.kicker} heading={home.faq.heading} items={home.faq.items} />
            <ContactBlock site={site} locale={locale} copy={home.contact} />
          </main>
          <Footer site={site} locale={locale} />
          <WhatsAppButton site={site} locale={locale} />
        </div>
        <JsonLd data={homeJsonLd(locale)} />
        <JsonLd data={faqJsonLd(home.faq.items, locale)} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
