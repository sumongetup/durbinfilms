import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Timeline } from "@/components/Timeline";
import { VentureCard } from "@/components/VentureCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FounderHero } from "@/components/founder/FounderHero";
import { ReadyProvider } from "@/components/providers/ReadyProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { Kicker } from "@/components/ui/Kicker";
import { Reveal } from "@/components/ui/Reveal";
import { getFounder, getSite, resolveFacts } from "@/lib/content";
import { PAGE_LINKS } from "@/lib/nav";
import { founderMetadata, personJsonLd } from "@/lib/seo";

export const metadata: Metadata = founderMetadata();

export default function FounderPage() {
  const site = getSite();
  const founder = getFounder();

  return (
    <ReadyProvider>
      <div className="page" data-page="founder">
        <Nav links={PAGE_LINKS} cta={{ label: "Get in touch", href: "#contact" }} />
        <main id="main">
          <FounderHero founder={founder} />

          <section className="sec wrap" aria-labelledby="profile-heading">
            <div className="two">
              <Reveal>
                <Kicker>{founder.profile.kicker}</Kicker>
                <h2 id="profile-heading">{founder.profile.heading}</h2>
              </Reveal>
              <Reveal className="body" delay={0.07}>
                {founder.profile.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </Reveal>
            </div>
            <Reveal className="facts" delay={0.14}>
              {resolveFacts(founder.facts).map((f) => (
                <div className="fact" key={f.label}>
                  <div className="n grad">{f.value}</div>
                  <p>{f.label}</p>
                </div>
              ))}
            </Reveal>
          </section>

          <section className="sec wrap" aria-labelledby="timeline-heading">
            <Kicker>{founder.timeline.kicker}</Kicker>
            <h2 id="timeline-heading">{founder.timeline.heading}</h2>
            <Timeline items={founder.timeline.items} />
          </section>

          <section className="sec wrap" aria-labelledby="ventures-heading">
            <Kicker>{founder.ventures.kicker}</Kicker>
            <h2 id="ventures-heading">{founder.ventures.heading}</h2>
            <div className="vents">
              {founder.ventures.items.map((v, i) => (
                <VentureCard key={v.name} venture={v} index={i} />
              ))}
            </div>
          </section>

          <section className="sec wrap" aria-labelledby="credentials-heading">
            <Kicker>{founder.credentials.kicker}</Kicker>
            <h2 id="credentials-heading">{founder.credentials.heading}</h2>
            <Reveal as="dl" className="creds">
              {founder.credentials.items.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.value}</dd>
                </div>
              ))}
            </Reveal>
          </section>

          <section className="sec wrap">
            <Reveal as="figure" className="quote m-0">
              <Kicker>{founder.quote.kicker}</Kicker>
              <blockquote>{founder.quote.text}</blockquote>
              <figcaption className="who">{founder.quote.who}</figcaption>
            </Reveal>
          </section>

          <ContactBlock
            site={site}
            variant="founder"
            kicker={founder.contact.kicker}
            heading={founder.contact.heading}
            lead={founder.contact.lead}
            links={founder.contact.links}
          />
        </main>
        <Footer site={site} />
        <WhatsAppButton site={site} />
      </div>
      <JsonLd data={personJsonLd()} />
    </ReadyProvider>
  );
}
