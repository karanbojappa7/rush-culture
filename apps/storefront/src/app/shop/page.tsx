import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop-catalog";
import { fetchCollections } from "@/lib/catalog";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Shop",
    description: seo.shopDescription,
    path: "/shop",
  });
}

export default async function ShopPage() {
  const collections = await fetchCollections();

  return (
    <div className="pt-20 md:pt-24">
      <ShopCatalog collections={collections} />
    </div>
  );
}
