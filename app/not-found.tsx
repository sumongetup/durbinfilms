import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { getSite } from "@/lib/content";
import { PAGE_LINKS } from "@/lib/nav";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  const site = getSite();
  return (
    <div className="page" data-page="not-found">
      <Nav links={PAGE_LINKS} cta={{ label: "Start a project", href: "/#contact" }} />
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
      <Footer site={site} />
    </div>
  );
}
