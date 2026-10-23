import type { Metadata } from "next";
import { WorkIndexView } from "@/components/views/WorkIndexView";
import { workIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = workIndexMetadata("bn");

export default function BanglaAllWorkPage() {
  return <WorkIndexView locale="bn" />;
}
