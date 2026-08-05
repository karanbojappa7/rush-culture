import { brand } from "@linq/site-config";
import { ShopCatalog } from "@/components/shop-catalog";
import { fetchCollections } from "@/lib/catalog";

export const metadata = {
  title: "Shop",
  description: brand.meta.shopDescription,
};

export default async function ShopPage() {
  const collections = await fetchCollections();

  return (
    <div className="pt-20 md:pt-24">
      <ShopCatalog collections={collections} />
    </div>
  );
}
