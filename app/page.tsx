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
import { CTA, HOME_LINKS } from "@/lib/nav";
import { faqJsonLd, homeJsonLd } from "@/lib/seo";

/** The studio's own channel leads the page; everything else follows by kind. */
const HOME_PLATFORM = "DURBIN FILMS";
const MORE = { label: "All work", href: "/work/" };

export default function HomePage() {
  const site = getSite();
  const home = getHome();
  const ownDramas = getByPlatform(HOME_PLATFORM).filter((w) => w.type === "drama");
  const otherDramas = getWorks().filter((w) => (w.type === "drama" && w.platform !== HOME_PLATFORM) || w.type === "series");
  const shorts = getByType("short", "documentary");
  const songs = getByType("song");
  const channels = getChannels();

  return (
    <ReadyProvider withLoader>
      <TrailerProvider>
        <div className="page" data-page="home">
          <Loader />
          <Nav links={HOME_LINKS} cta={CTA} />
          <main id="main">
            <HeroSlider slides={getFeaturedSlides()} headline={home.hero.headline} />
            <Marquee items={home.marquee} />
            {ownDramas.length > 0 && (
              <PosterRail id="dramas" kicker={HOME_PLATFORM} heading="Dramas and telefilms" works={ownDramas} more={MORE} />
            )}
            {otherDramas.length > 0 && (
              <PosterRail id="serials" kicker="DURBIN DRAMA · DURBIN" heading="Natoks and serials" works={otherDramas} more={MORE} />
            )}
            {shorts.length > 0 && <PosterRail id="shorts" kicker="DIGITAL" heading="Short films" works={shorts} more={MORE} />}
            {songs.length > 0 && <PosterRail id="songs" kicker="MUSIC" heading="Songs and title tracks" works={songs} more={MORE} />}
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
            <ContactBlock site={site} copy={home.contact} />
          </main>
          <Footer site={site} />
          <WhatsAppButton site={site} />
        </div>
        <JsonLd data={homeJsonLd()} />
        <JsonLd data={faqJsonLd(home.faq.items)} />
      </TrailerProvider>
    </ReadyProvider>
  );
}
