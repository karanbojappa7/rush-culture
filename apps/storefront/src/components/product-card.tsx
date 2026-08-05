import Image from "next/image";
import Link from "next/link";
import { Product, getLowestPrice } from "@/lib/catalog";
import { formatInr } from "@/lib/format";

type Props = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const price = getLowestPrice(product);

  return (
    <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          loading={priority ? "eager" : undefined}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
            {product.collection}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight text-ink">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 pt-5 text-sm font-medium text-ink">
          {formatInr(price)}
        </p>
      </div>
    </Link>
  );
}
