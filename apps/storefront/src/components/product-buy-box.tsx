"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/catalog";
import { formatInr } from "@/lib/format";
import { useCart } from "./cart-provider";

type Props = {
  product: Product;
};

export function ProductBuyBox({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const colors = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of product.variants) {
      map.set(v.color, v.colorHex);
    }
    return [...map.entries()].map(([color, colorHex]) => ({ color, colorHex }));
  }, [product.variants]);

  const [color, setColor] = useState(colors[0]?.color ?? "");
  const sizes = useMemo(
    () =>
      product.variants
        .filter((v) => v.color === color)
        .map((v) => ({
          size: v.size,
          stock: v.stock,
          id: v.id,
          price: v.priceInPaise,
          compare: v.compareAtPriceInPaise,
          sku: v.sku,
          colorHex: v.colorHex,
        })),
    [product.variants, color],
  );
  const [size, setSize] = useState(sizes[0]?.size ?? "");
  const [added, setAdded] = useState(false);

  const activeSize = sizes.find((s) => s.size === size) ?? sizes[0];

  function handleAdd() {
    if (!activeSize || activeSize.stock === 0) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0],
      variantId: activeSize.id,
      sku: activeSize.sku,
      size: activeSize.size,
      color,
      colorHex: activeSize.colorHex,
      unitPriceInPaise: activeSize.price,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          {product.collection}
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-3">
          <p className="text-xl font-semibold text-ink">
            {formatInr(activeSize?.price ?? 0)}
          </p>
          {activeSize?.compare ? (
            <p className="text-sm text-mute line-through">
              {formatInr(activeSize.compare)}
            </p>
          ) : null}
        </div>
        <p className="mt-5 max-w-md text-base leading-relaxed text-mute">
          {product.description}
        </p>
      </div>

      <div>
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Color — {color}
        </p>
        <div className="mt-3 flex gap-2">
          {colors.map((c) => (
            <button
              key={c.color}
              type="button"
              aria-label={c.color}
              onClick={() => {
                setColor(c.color);
                const next = product.variants.find((v) => v.color === c.color);
                if (next) setSize(next.size);
              }}
              className={`h-9 w-9 cursor-pointer border-2 transition-transform ${
                color === c.color
                  ? "border-ink scale-105"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c.colorHex }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Size
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const disabled = s.stock === 0;
            const active = s.size === size;
            return (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                onClick={() => setSize(s.size)}
                className={`min-w-12 cursor-pointer px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : disabled
                      ? "cursor-not-allowed bg-mist text-mute/50 line-through"
                      : "bg-mist text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!activeSize || activeSize.stock === 0}
          onClick={handleAdd}
          className="flex-1 cursor-pointer bg-volt px-6 py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-volt-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
        >
          {(activeSize?.stock ?? 0) === 0
            ? "Sold out"
            : added
              ? "Added"
              : "Add to bag"}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
          disabled={!activeSize || activeSize.stock === 0}
          className="flex-1 cursor-pointer bg-ink px-6 py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
