import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ScrollProgress } from "@/components/ScrollProgress";
import { JsonLd } from "@/components/ui/JsonLd";
import { defaultMetadata, organizationJsonLd } from "@/lib/seo";

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

export const metadata: Metadata = defaultMetadata();

export const viewport: Viewport = {
  themeColor: "#07060b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/* Without JavaScript the entrance animations never fire, so undo their hidden start states. */
const NOSCRIPT_CSS =
  ".word b{transform:none!important}.loader,.curtain{display:none!important}.shot,.frame{clip-path:none!important}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable}`}>
      <head>
        {/* Artwork is served from this domain; only the trailer embed is third party. */}
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      </head>
      <body>
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <MotionProvider>
          <ScrollProgress />
          {children}
        </MotionProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
