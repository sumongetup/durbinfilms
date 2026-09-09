import Link from "next/link";
import { Logo } from "./ui/Logo";
import { whatsappUrl } from "@/lib/contact";
import { FOOTER_EXTRA_LINKS, PAGE_LINKS } from "@/lib/nav";
import type { Site } from "@/lib/types";

function Icon({ name }: { name: "facebook" | "youtube" | "whatsapp" }) {
  const paths = {
    facebook:
      "M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z",
    youtube:
      "M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z",
    whatsapp:
      "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-.9-1.1-1.2-1.7-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.7 1 2.5 1.1 1.6 2.5 2.8 4.2 3.6.5.2 1 .4 1.5.5.5.2 1 .1 1.5 0 .6-.2 1.1-.6 1.4-1.1.1-.3.2-.6.1-.9-.1-.1-.3-.2-.5-.3z",
  };
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d={paths[name]} />
    </svg>
  );
}

/**
 * Four-column footer: brand and address, site links, contact, social.
 * Year is stamped at build time; the site is static, so rebuild to roll it.
 */
export function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  const wa = whatsappUrl(site);
  const socials = site.social.filter((s) => s.href && !s.href.includes("["));

  return (
    <footer className="site-foot wrap">
      <div className="foot-grid">
        <div className="foot-brand">
          <Link className="logo" href="/" aria-label="Durbin Films, home">
            <Logo height={46} />
          </Link>
          <p>Television drama, web series and brand films. Script to final cut, in house.</p>
          <p className="foot-addr">
            {site.address.street}
            <br />
            {[site.address.city, site.address.postalCode].filter(Boolean).join(" ")}, {site.address.country}
          </p>
          {site.network && site.network.length > 0 ? (
            <p className="foot-network">
              Also from the group:{" "}
              {site.network.map((n, i) => (
                <span key={n.href}>
                  {i > 0 ? ", " : null}
                  <a href={n.href} target="_blank" rel="noopener noreferrer">
                    {n.label}
                  </a>
                  {n.note ? `, ${n.note}` : null}
                  {n.links?.map((l) => (
                    <span key={l.href}>
                      {" · "}
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    </span>
                  ))}
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <nav aria-label="Footer">
          <b>EXPLORE</b>
          <ul className="foot-links">
            {[...PAGE_LINKS, ...FOOTER_EXTRA_LINKS].map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <b>CONTACT</b>
          <ul>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a href={`tel:${site.phone}`}>{site.phoneDisplay || site.phone}</a>
            </li>
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp the studio
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <b>FOLLOW</b>
          <ul className="foot-social">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <Icon name={/facebook/i.test(s.label) ? "facebook" : "youtube"} />
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" />
                  <span>WhatsApp</span>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="foot">
        <span>
          {site.name} · {site.address.city}, {site.address.country}
          {site.founded ? ` · Since ${site.founded.slice(0, 4)}` : ""}
        </span>
        <span className="r">
          © {year} {site.name}
        </span>
      </div>
    </footer>
  );
}
