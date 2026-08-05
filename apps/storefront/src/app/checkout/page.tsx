import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: "Checkout",
    path: "/checkout",
    noIndex: true,
  });
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
