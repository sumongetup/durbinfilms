import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SiteRoot, VIEWPORT } from "@/app/SiteRoot";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { getSite } from "@/lib/content";
import { pageLinks } from "@/lib/nav";
import { defaultMetadata } from "@/lib/seo";

const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "600"],
  variable: "--font-bangla",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  ...defaultMetadata("en"),
  title: "Page not found | Durbin Films",
  alternates: {},
  robots: { index: false },
};

export const viewport: Viewport = VIEWPORT;

/**
 * The site has two root layouts (English and Bangla), so the 404 page brings
 * its own document. It is the English one, with a way into the Bangla site.
 */
export default function GlobalNotFound() {
  const site = getSite();
  return (
    <SiteRoot locale="en" banglaFont={bangla.variable}>
      <div className="page" data-page="not-found">
        <Nav links={pageLinks("en")} cta={{ label: "Start a project", href: "/#contact" }} switchHref="/bn/" />
        <main id="main" className="wrap pt-[160px] min-h-[70svh]">
          <Kicker>404</Kicker>
          <h1 className="mt-3 text-[clamp(32px,5vw,64px)]">That page is not in the slate.</h1>
          <p className="body mt-4">The link may be old, or the production may have moved.</p>
          <div className="btns">
            <Button href="/">Back to the home page</Button>
            <Button href="/work/" variant="ghost">
              Browse all work
            </Button>
          </div>
        </main>
        <Footer site={site} locale="en" />
      </div>
    </SiteRoot>
  );
}
