import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Hind_Siliguri } from "next/font/google";
import { SiteRoot, VIEWPORT } from "@/app/SiteRoot";
import { defaultMetadata } from "@/lib/seo";

const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata("bn");

export const viewport: Viewport = VIEWPORT;

/** Root layout for the Bangla pages under /bn/, so <html lang> is right in the static HTML. */
export default function BanglaLayout({ children }: { children: ReactNode }) {
  return (
    <SiteRoot locale="bn" banglaFont={bangla.variable}>
      {children}
    </SiteRoot>
  );
}
