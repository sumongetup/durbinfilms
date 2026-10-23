import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ScrollProgress } from "@/components/ScrollProgress";
import { JsonLd } from "@/components/ui/JsonLd";
import { HTML_LANG, UI, type Locale } from "@/lib/i18n";
import { organizationJsonLd } from "@/lib/seo";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

/** Re-exported as `viewport` by each root layout and the 404 page. */
export const VIEWPORT: Viewport = {
  themeColor: "#07060b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* Without JavaScript the entrance animations never fire, so undo their hidden start states. */
const NOSCRIPT_CSS =
  ".word b{transform:none!important}.loader,.curtain{display:none!important}.shot,.frame{clip-path:none!important}";

/**
 * The <html> document shared by both root layouts. Each layout passes its
 * language and the class of its Bangla font (preloaded only where Bangla is
 * the page language; elsewhere it loads on the first Bangla glyph).
 */
export function SiteRoot({ locale, banglaFont, children }: { locale: Locale; banglaFont: string; children: ReactNode }) {
  return (
    <html lang={HTML_LANG[locale]} className={`${sora.variable} ${jakarta.variable} ${banglaFont}`}>
      <head>
        {/* Artwork is served from this domain; only the trailer embed is third party. */}
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      </head>
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <a className="skip" href="#main">
          {UI[locale].skip}
        </a>
        <LocaleProvider locale={locale}>
          <MotionProvider>
            <ScrollProgress />
            {children}
          </MotionProvider>
        </LocaleProvider>
        <JsonLd data={organizationJsonLd(locale)} />
      </body>
    </html>
  );
}
