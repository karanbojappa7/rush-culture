import type { Metadata } from "next";
import { PolicyPage } from "@/components/common/site/policy-page";
import { fetchBrandSettings } from "@/base/brand";
import { fetchPoliciesSettings } from "@/base/policies";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, policies] = await Promise.all([
    fetchSeoSettings(),
    fetchPoliciesSettings(),
  ]);
  return seoToPageMetadata(seo, {
    title: policies.shipping.title,
    description: policies.shipping.intro,
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const [policies, storeBrand] = await Promise.all([
    fetchPoliciesSettings(),
    fetchBrandSettings(),
  ]);
  return (
    <PolicyPage
      title={policies.shipping.title}
      intro={policies.shipping.intro}
      sections={[...policies.shipping.sections]}
      supportEmail={storeBrand.supportEmail}
    />
  );
}
