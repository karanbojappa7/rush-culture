import {
  organizationJsonLd,
} from "@/lib/seo";
import type { SeoSettings } from "@linq/site-config";

export function OrganizationJsonLd({ settings }: { settings: SeoSettings }) {
  const data = organizationJsonLd(settings);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
