import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Cart",
    path: "/cart",
    noIndex: true,
  });
}

export default function CartPage() {
  return <CartView />;
}
