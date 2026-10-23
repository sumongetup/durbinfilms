import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkView } from "@/components/views/WorkView";
import { getWork, getWorks } from "@/lib/content";
import { workMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getWorks("bn").map((w) => ({ slug: w.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug, "bn");
  return work ? workMetadata(work, "bn") : {};
}

export default async function BanglaWorkPage({ params }: Params) {
  const { slug } = await params;
  const work = getWork(slug, "bn");
  if (!work) notFound();
  return <WorkView work={work} locale="bn" />;
}
