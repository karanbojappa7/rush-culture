import type { Metadata } from "next";
import { returnsPolicy } from "@linq/site-config";
import { PolicyPage } from "@/components/common/site/policy-page";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: returnsPolicy.title,
    description: returnsPolicy.intro,
    path: "/returns",
  });
}

export default function ReturnsPage() {
  return (
    <PolicyPage
      title={returnsPolicy.title}
      intro={returnsPolicy.intro}
      sections={[...returnsPolicy.sections]}
    />
  );
}
