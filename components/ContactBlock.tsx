import { Button } from "./ui/Button";
import { Kicker } from "./ui/Kicker";
import { Reveal } from "./ui/Reveal";
import { whatsappUrl } from "@/lib/contact";
import { UI, type Locale } from "@/lib/i18n";
import type { Site, SocialLink } from "@/lib/types";

function SocialList({ site, labels }: { site: Site; labels: string[] }) {
  return (
    <span className="info-links">
      {labels.map((label) => {
        const href = site.social.find((s) => s.label === label)?.href;
        const usable = href && !href.includes("[");
        return usable ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <span key={label}>{label}</span>
        );
      })}
    </span>
  );
}

const cityLine = (site: Site) => [site.address.city, site.address.postalCode].filter(Boolean).join(" ");
const phoneText = (site: Site) => site.phoneDisplay || site.phone;

interface HomeProps {
  site: Site;
  locale: Locale;
  variant?: "home";
  /** Copy for the gradient CTA box; falls back to the studio's default lines. */
  copy?: { kicker: string; heading: string; lead: string };
}

interface FounderProps {
  site: Site;
  locale: Locale;
  variant: "founder";
  kicker: string;
  heading: string;
  lead: string;
  /** The founder's own profiles; falls back to the studio's channels when empty. */
  links?: SocialLink[];
}

/**
 * Contact section. The home variant is the gradient CTA box with email and
 * phone buttons; the founder variant is the plain heading, lead and grid.
 * Email, phone and address always come from site.json. The home FOLLOW list
 * shows every social entry that has a link; the founder page lists the
 * labels named in founder.json.
 */
export function ContactBlock(props: HomeProps | FounderProps) {
  const { site } = props;
  const t = UI[props.locale].contact;

  if (props.variant === "founder") {
    return (
      <section className="sec wrap" id="contact" aria-labelledby="contact-heading">
        <Kicker>{props.kicker}</Kicker>
        <h2 id="contact-heading">{props.heading}</h2>
        <p className="body mt-4">{props.lead}</p>
        <div className="info">
          <div>
            <b>{t.email}</b>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div>
            <b>{t.phone}</b>
            <a href={`tel:${site.phone}`}>{phoneText(site)}</a>
          </div>
          <div>
            <b>{t.studio}</b>
            {site.address.street}, {cityLine(site)}
          </div>
          <div>
            <b>{t.social}</b>
            {props.links && props.links.length > 0 ? (
              <span className="info-links">
                {props.links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer me">
                    {l.label}
                  </a>
                ))}
              </span>
            ) : (
              <SocialList site={site} labels={site.social.map((s) => s.label)} />
            )}
          </div>
        </div>
      </section>
    );
  }

  const followLabels = site.social.filter((s) => s.href && !s.href.includes("[")).map((s) => s.label);
  const wa = whatsappUrl(site, props.locale);
  const copy = props.copy ?? t;

  return (
    <section className="sec wrap" id="contact" aria-labelledby="contact-heading">
      <Reveal className="cta-box">
        <Kicker>{copy.kicker}</Kicker>
        <h2 id="contact-heading">{copy.heading}</h2>
        <p>{copy.lead}</p>
        <div className="btns">
          <Button href={`mailto:${site.email}`}>{t.emailButton}</Button>
          {wa ? (
            <Button href={wa} variant="ghost" target="_blank" rel="noopener noreferrer">
              {UI[props.locale].whatsapp.label}
            </Button>
          ) : null}
          <Button href={`tel:${site.phone}`} variant="ghost">
            {t.call(phoneText(site))}
          </Button>
        </div>
        <div className="info">
          <div>
            <b>{t.studio}</b>
            {site.address.street}
            <br />
            {cityLine(site)}, {site.address.country}
          </div>
          <div>
            <b>{t.email}</b>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div>
            <b>{t.phone}</b>
            <a href={`tel:${site.phone}`}>{phoneText(site)}</a>
          </div>
          <div>
            <b>{t.follow}</b>
            <SocialList site={site} labels={followLabels.length ? followLabels : ["Facebook", "YouTube"]} />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
