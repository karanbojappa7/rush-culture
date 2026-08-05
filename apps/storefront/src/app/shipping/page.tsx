import type { Metadata } from "next";
import { shippingPolicy } from "@linq/site-config";
import { PolicyPage } from "@/components/policy-page";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: shippingPolicy.title,
    description: shippingPolicy.intro,
    path: "/shipping",
  });
}

export default function ShippingPage() {
  return (
    <PolicyPage
      title={shippingPolicy.title}
      intro={shippingPolicy.intro}
      sections={[...shippingPolicy.sections]}
    />
  );
}
