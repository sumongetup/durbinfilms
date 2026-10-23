import type { Metadata } from "next";
import { WorkIndexView } from "@/components/views/WorkIndexView";
import { workIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = workIndexMetadata("en");

export default function AllWorkPage() {
  return <WorkIndexView locale="en" />;
}
