import type { Metadata } from "next";
import { FounderView } from "@/components/views/FounderView";
import { founderMetadata } from "@/lib/seo";

export const metadata: Metadata = founderMetadata("en");

export default function FounderPage() {
  return <FounderView locale="en" />;
}
