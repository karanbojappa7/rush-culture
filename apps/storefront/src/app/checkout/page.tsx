import type { Metadata } from "next";
import { CheckoutForm } from "@/components/common/cart/checkout-form";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Checkout",
    path: "/checkout",
  });
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
