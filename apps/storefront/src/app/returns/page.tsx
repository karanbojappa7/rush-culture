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
    title: policies.returns.title,
    description: policies.returns.intro,
    path: "/returns",
  });
}

export default async function ReturnsPage() {
  const [policies, storeBrand] = await Promise.all([
    fetchPoliciesSettings(),
    fetchBrandSettings(),
  ]);
  return (
    <PolicyPage
      title={policies.returns.title}
      intro={policies.returns.intro}
      sections={[...policies.returns.sections]}
      supportEmail={storeBrand.supportEmail}
    />
  );
}
