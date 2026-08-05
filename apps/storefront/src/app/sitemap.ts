import type { MetadataRoute } from "next";
import { fetchCollections, fetchProducts } from "@/base/catalog";
import { fetchSeoSettings } from "@/base/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await fetchSeoSettings();
  const base = seo.canonicalBaseUrl;
  if (!base) return [];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  if (seo.sitemapIncludeStatic) {
    for (const path of seo.sitemapStaticPaths) {
      const normalized = path === "/" ? "" : path;
      entries.push({
        url: `${base}${normalized}`,
        lastModified: now,
        changeFrequency:
          normalized === "" || normalized === "/shop" ? "daily" : "monthly",
        priority: normalized === "" ? 1 : normalized === "/shop" ? 0.9 : 0.5,
      });
    }
  }

  for (const path of seo.sitemapAdditionalPaths) {
    const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
    entries.push({
      url: `${base}${normalized}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  const [products, collections] = await Promise.all([
    seo.sitemapIncludeProducts ? fetchProducts(200) : Promise.resolve([]),
    seo.sitemapIncludeCollections ? fetchCollections() : Promise.resolve([]),
  ]);

  if (seo.sitemapIncludeProducts) {
    for (const product of products) {
      entries.push({
        url: `${base}/products/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  if (seo.sitemapIncludeCollections) {
    for (const collection of collections) {
      entries.push({
        url: `${base}/collections/${collection.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
