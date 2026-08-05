"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/catalog";
import { apiGet } from "@/lib/api";
import { mapApiProduct, type ApiProduct } from "@/lib/catalog-map";
import { formatInr } from "@/lib/format";
import { useCart } from "./cart-provider";

type Props = {
  product: Product;
};

export function ProductBuyBox({ product: initial }: Props) {
  const router = useRouter();
  const { addItem, items, applyStock, updateQuantity } = useCart();
  const [product, setProduct] = useState(initial);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setProduct(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const res = await apiGet<ApiProduct>(`/api/products/${initial.slug}`);
      if (cancelled || res.status_code !== 200 || !res.data) return;
      const next = mapApiProduct(res.data);
      setProduct(next);
      applyStock(
        next.variants.map((variant) => ({
          variantId: variant.id,
          stock: variant.stock,
        })),
      );
    }

    void refresh();
    const timer = window.setInterval(refresh, 12000);
    function onVisible() {
      if (document.visibilityState === "visible") void refresh();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initial.slug, applyStock]);

  const colors = useMemo(() => {
    const map = new Map<string, { colorHex: string; stock: number }>();
    for (const v of product.variants) {
      const prev = map.get(v.color);
      map.set(v.color, {
        colorHex: v.colorHex,
        stock: (prev?.stock ?? 0) + v.stock,
      });
    }
    return [...map.entries()].map(([color, meta]) => ({
      color,
      colorHex: meta.colorHex,
      inStock: meta.stock > 0,
    }));
  }, [product.variants]);

  const productInStock = colors.some((c) => c.inStock);

  const firstAvailableColor =
    colors.find((c) => c.inStock)?.color ?? colors[0]?.color ?? "";

  const [color, setColor] = useState(firstAvailableColor);

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

  const [size, setSize] = useState(
    sizes.find((s) => s.stock > 0)?.size ?? sizes[0]?.size ?? "",
  );
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const forColor = product.variants.filter((v) => v.color === color);
    const next =
      forColor.find((v) => v.stock > 0) ?? forColor[0] ?? undefined;
    setSize(next?.size ?? "");
  }, [color, product.variants]);

  const activeSize = sizes.find((s) => s.size === size) ?? sizes[0];
  const cartLine = activeSize
    ? items.find((line) => line.variantId === activeSize.id)
    : undefined;
  const inCartQty = cartLine?.quantity ?? 0;
  const remaining = Math.max(0, (activeSize?.stock ?? 0) - inCartQty);
  const canBuy = Boolean(activeSize && remaining > 0 && productInStock);
  const addQty = Math.min(Math.max(1, qty), Math.max(1, remaining));

  useEffect(() => {
    setQty((prev) => {
      if (remaining <= 0) return 1;
      return Math.min(Math.max(1, prev), remaining);
    });
  }, [remaining, color, size]);

  async function handleAdd(quantity = addQty) {
    if (!activeSize || remaining <= 0 || quantity <= 0) return;
    const res = await apiGet<ApiProduct>(`/api/products/${product.slug}`);
    if (res.status_code === 200 && res.data) {
      const next = mapApiProduct(res.data);
      setProduct(next);
      const live = next.variants.find((variant) => variant.id === activeSize.id);
      applyStock(
        next.variants.map((variant) => ({
          variantId: variant.id,
          stock: variant.stock,
        })),
      );
      if (!live || live.stock <= inCartQty) return;
      const room = live.stock - inCartQty;
      addItem(
        {
          productId: next.id,
          productSlug: next.slug,
          productName: next.name,
          image: next.images[0],
          variantId: live.id,
          sku: live.sku,
          size: live.size,
          color: live.color,
          colorHex: live.colorHex,
          unitPriceInPaise: live.priceInPaise,
          maxStock: live.stock,
        },
        Math.min(quantity, room),
      );
    } else {
      addItem(
        {
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
          maxStock: activeSize.stock,
        },
        Math.min(quantity, remaining),
      );
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function bumpCart(delta: number) {
    if (!cartLine) return;
    updateQuantity(cartLine.key, cartLine.quantity + delta);
  }

  function selectColor(nextColor: string, inStock: boolean) {
    if (!inStock) return;
    setColor(nextColor);
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
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <p className="text-xl font-semibold text-ink">
            {formatInr(activeSize?.price ?? 0)}
          </p>
          {activeSize?.compare ? (
            <p className="text-sm text-mute line-through">
              {formatInr(activeSize.compare)}
            </p>
          ) : null}
          {!productInStock ? (
            <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-mute">
              Out of stock
            </span>
          ) : activeSize ? (
            <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-mute">
              {remaining} available
            </span>
          ) : null}
        </div>
        <p className="mt-5 max-w-md text-base leading-relaxed text-mute">
          {product.description}
        </p>
      </div>

      <div>
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Color — {color}
          {colors.find((c) => c.color === color) &&
          !colors.find((c) => c.color === color)?.inStock
            ? " · Out of stock"
            : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.map((c) => {
            const active = color === c.color;
            return (
              <button
                key={c.color}
                type="button"
                disabled={!c.inStock}
                aria-label={
                  c.inStock ? c.color : `${c.color} (out of stock)`
                }
                aria-disabled={!c.inStock}
                onClick={() => selectColor(c.color, c.inStock)}
                className={`relative h-9 w-9 border-2 transition-transform ${
                  !c.inStock
                    ? "cursor-not-allowed opacity-35 grayscale"
                    : active
                      ? "scale-105 cursor-pointer border-ink"
                      : "cursor-pointer border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c.colorHex }}
              >
                {!c.inStock ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-full rotate-45 bg-ink/70" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
            Size
          </p>
          {activeSize ? (
            <p className="text-[12px] text-mute">
              {activeSize.stock === 0
                ? "Out of stock"
                : remaining === 0
                  ? `In bag · ${activeSize.stock} in stock`
                  : `${remaining} of ${activeSize.stock} available`}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const disabled = s.stock === 0;
            const active = s.size === size;
            return (
              <button
                key={s.id}
                type="button"
                disabled={disabled}
                aria-label={
                  disabled
                    ? `${s.size} out of stock`
                    : `Size ${s.size}, ${s.stock} available`
                }
                onClick={() => {
                  if (disabled) return;
                  setSize(s.size);
                }}
                className={`min-w-14 px-3 py-2.5 text-sm font-medium transition-colors ${
                  disabled
                    ? "cursor-not-allowed bg-mist/60 text-mute/45 line-through"
                    : active
                      ? "cursor-pointer bg-ink text-paper"
                      : "cursor-pointer bg-mist text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                <span className="block">{s.size}</span>
                <span
                  className={`mt-0.5 block text-[10px] font-normal tracking-wide ${
                    active ? "text-paper/70" : "text-mute"
                  }`}
                >
                  {s.stock === 0 ? "0 left" : `${s.stock} left`}
                </span>
              </button>
            );
          })}
        </div>
        {sizes.length > 0 && sizes.every((s) => s.stock === 0) ? (
          <p className="mt-3 text-sm text-mute">
            Out of stock in {color}. Pick another color if available.
          </p>
        ) : activeSize && activeSize.stock === 0 ? (
          <p className="mt-3 text-sm text-mute">
            Size {activeSize.size} is out of stock.
          </p>
        ) : activeSize && remaining > 0 && remaining <= 3 ? (
          <p className="mt-3 text-sm text-mute">
            Low stock — only {remaining} left for this size/color.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {inCartQty > 0 ? (
          <div className="flex flex-1 items-stretch border border-ink">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="cursor-pointer px-4 text-lg font-medium text-ink transition-opacity hover:opacity-70"
              onClick={() => bumpCart(-1)}
            >
              −
            </button>
            <div className="flex flex-1 flex-col items-center justify-center bg-volt px-4 py-3 text-volt-ink">
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase">
                In bag
              </span>
              <span className="text-sm font-semibold tabular-nums">
                {inCartQty}
              </span>
            </div>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={remaining <= 0}
              className="cursor-pointer px-4 text-lg font-medium text-ink transition-opacity hover:enabled:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
              onClick={() => {
                if (remaining <= 0) return;
                void handleAdd(1);
              }}
            >
              +
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-stretch gap-0">
            <div className="flex items-stretch border border-ink">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={!canBuy || addQty <= 1}
                className="cursor-pointer px-3.5 text-lg font-medium text-ink transition-opacity hover:enabled:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              >
                −
              </button>
              <span className="flex min-w-10 items-center justify-center text-sm font-semibold tabular-nums text-ink">
                {canBuy ? addQty : 0}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={!canBuy || addQty >= remaining}
                className="cursor-pointer px-3.5 text-lg font-medium text-ink transition-opacity hover:enabled:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                onClick={() =>
                  setQty((prev) => Math.min(remaining, prev + 1))
                }
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => void handleAdd()}
              className="flex-1 bg-volt px-6 py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-volt-ink transition-opacity disabled:cursor-not-allowed disabled:bg-mist disabled:text-mute/60 disabled:opacity-100 hover:enabled:opacity-90"
            >
              {!productInStock || (activeSize?.stock ?? 0) === 0
                ? "Out of stock"
                : remaining === 0
                  ? "Out of stock"
                  : added
                    ? "Added"
                    : "Add to bag"}
            </button>
          </div>
        )}
        <button
          type="button"
          disabled={!canBuy && inCartQty === 0}
          onClick={() => {
            if (inCartQty > 0) {
              router.push("/cart");
              return;
            }
            void handleAdd().then(() => {
              if (remaining > 0) router.push("/cart");
            });
          }}
          className="flex-1 bg-ink px-6 py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-paper transition-opacity disabled:cursor-not-allowed disabled:bg-mist disabled:text-mute/60 disabled:opacity-100 hover:enabled:opacity-90"
        >
          {!canBuy && inCartQty === 0 ? "Unavailable" : "Buy now"}
        </button>
      </div>
    </div>
  );
}
