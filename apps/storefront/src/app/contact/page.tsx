import type { Metadata } from "next";
import { ContactForm } from "@/components/common/site/contact-form";
import { fetchPoliciesSettings } from "@/base/policies";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Contact",
    description: seo.contactDescription,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const policies = await fetchPoliciesSettings();

  return (
    <div className="mx-auto max-w-2xl px-5 pt-28 pb-20 md:px-8">
      <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Help
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        Contact
      </h1>
      <p className="mt-3 text-mute">{policies.contactIntro}</p>
      <div className="mt-10">
        <ContactForm topics={[...policies.contactTopics]} />
      </div>
    </div>
  );
}
