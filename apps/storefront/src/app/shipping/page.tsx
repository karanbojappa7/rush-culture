import { shippingPolicy } from "@linq/site-config";
import { PolicyPage } from "@/components/policy-page";

export const metadata = {
  title: shippingPolicy.title,
  description: shippingPolicy.intro,
};

export default function ShippingPage() {
  return (
    <PolicyPage
      title={shippingPolicy.title}
      intro={shippingPolicy.intro}
      sections={[...shippingPolicy.sections]}
    />
  );
}
