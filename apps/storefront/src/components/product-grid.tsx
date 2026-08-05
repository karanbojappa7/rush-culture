import { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";

type Props = {
  products: Product[];
  title?: string;
  subtitle?: string;
};

export function ProductGrid({ products, title, subtitle }: Props) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
      {(title || subtitle) && (
        <div className="mb-10 max-w-2xl md:mb-14">
          {title && (
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-3 text-base text-mute md:text-lg">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
