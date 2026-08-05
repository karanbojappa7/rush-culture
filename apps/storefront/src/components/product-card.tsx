import Image from "next/image";
import Link from "next/link";
import { Product, getLowestPrice } from "@/lib/catalog";
import { formatInr } from "@/lib/format";

type Props = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const availableQty = product.variants.reduce(
    (sum, variant) => sum + Math.max(0, variant.stock),
    0,
  );
  const price = getLowestPrice(product);
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group block ${inStock ? "cursor-pointer" : "cursor-default"}`}
      aria-label={
        inStock
          ? `${product.name}, ${availableQty} available`
          : `${product.name} (out of stock)`
      }
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            loading={priority ? "eager" : undefined}
            className={`object-cover transition-transform duration-700 ease-out ${
              inStock
                ? "group-hover:scale-[1.04]"
                : "grayscale opacity-55"
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : null}
        {!inStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
            <span className="bg-paper/95 px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-mute">
              Out of stock
            </span>
          </div>
        ) : availableQty <= 5 ? (
          <div className="absolute bottom-3 left-3">
            <span className="bg-paper/95 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-ink">
              {availableQty} left
            </span>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
            {product.collection}
          </p>
          <h3
            className={`mt-1 font-display text-lg font-bold tracking-tight ${
              inStock ? "text-ink" : "text-mute"
            }`}
          >
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-mute">
            {inStock ? `${availableQty} available` : "Out of stock"}
          </p>
        </div>
        <p
          className={`shrink-0 pt-5 text-sm font-medium ${
            inStock ? "text-ink" : "text-mute"
          }`}
        >
          {inStock ? formatInr(price) : "—"}
        </p>
      </div>
    </Link>
  );
}
