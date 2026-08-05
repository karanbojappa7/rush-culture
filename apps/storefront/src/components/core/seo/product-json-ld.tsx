import { productJsonLd } from "@/base/seo";
import type { SeoSettings } from "@linq/site-config";
import { JsonLdScript } from "@/components/core/seo/json-ld-script";

export function ProductJsonLd({
  settings,
  product,
}: {
  settings: SeoSettings;
  product: Parameters<typeof productJsonLd>[1];
}) {
  return <JsonLdScript data={productJsonLd(settings, product)} />;
}
