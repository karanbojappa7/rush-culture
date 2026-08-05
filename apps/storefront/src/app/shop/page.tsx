import { brand } from "@linq/site-config";
import { ShopCatalog } from "@/components/shop-catalog";

export const metadata = {
  title: "Shop",
  description: brand.meta.shopDescription,
};

export default function ShopPage() {
  return (
    <div className="pt-20 md:pt-24">
      <ShopCatalog />
    </div>
  );
}
