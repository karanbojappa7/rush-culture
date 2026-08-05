import type { MetadataRoute } from "next";
import { fetchCollections, fetchProducts } from "@/lib/catalog";
import { fetchSeoSettings } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seo = await fetchSeoSettings();
  const base = seo.canonicalBaseUrl;
  if (!base) return [];

  const [products, collections] = await Promise.all([
    fetchProducts(200),
    fetchCollections(),
  ]);

  const staticPaths = ["", "/shop", "/contact", "/shipping", "/returns", "/size-guide"];
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/shop" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.5,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionEntries: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: `${base}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
