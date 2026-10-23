import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Hind_Siliguri } from "next/font/google";
import { SiteRoot, VIEWPORT } from "@/app/SiteRoot";
import { defaultMetadata } from "@/lib/seo";

/* English pages only show Bangla in production titles, so this face loads on demand. */
const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = defaultMetadata("en");

export const viewport: Viewport = VIEWPORT;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SiteRoot locale="en" banglaFont={bangla.variable}>
      {children}
    </SiteRoot>
  );
}
