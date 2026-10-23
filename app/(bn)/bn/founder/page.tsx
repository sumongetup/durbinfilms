import type { Metadata } from "next";
import { FounderView } from "@/components/views/FounderView";
import { founderMetadata } from "@/lib/seo";

export const metadata: Metadata = founderMetadata("bn");

export default function BanglaFounderPage() {
  return <FounderView locale="bn" />;
}
