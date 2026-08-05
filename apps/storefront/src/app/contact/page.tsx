import { brand } from "@linq/site-config";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact",
  description: `Ask ${brand.name} about shipping, returns, orders, or products.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-28 pb-20 md:px-8">
      <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Help
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        Contact
      </h1>
      <p className="mt-4 max-w-lg text-mute">
        Shipping, returns, order issues — send a query and we track it on the
        admin dashboard until it is resolved.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  );
}
