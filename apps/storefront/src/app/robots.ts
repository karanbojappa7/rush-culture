import type { MetadataRoute } from "next";
import { fetchSeoSettings } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await fetchSeoSettings();
  const sitemap = seo.canonicalBaseUrl
    ? `${seo.canonicalBaseUrl}/sitemap.xml`
    : undefined;

  if (!seo.robotsIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: seo.noIndexPaths.length > 0 ? seo.noIndexPaths : undefined,
    },
    sitemap,
  };
}
