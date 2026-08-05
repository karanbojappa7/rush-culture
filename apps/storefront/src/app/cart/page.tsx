import type { Metadata } from "next";
import { CartView } from "@/components/common/cart/cart-view";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Cart",
    path: "/cart",
  });
}

export default function CartPage() {
  return <CartView />;
}
