import {
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import type { SeoSettings } from "@linq/site-config";
import { JsonLdScript } from "@/components/seo/json-ld-script";

export function SiteJsonLd({ settings }: { settings: SeoSettings }) {
  return (
    <>
      <JsonLdScript data={organizationJsonLd(settings)} />
      <JsonLdScript data={websiteJsonLd(settings)} />
    </>
  );
}
