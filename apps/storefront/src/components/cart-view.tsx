"use client";

import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/format";
import { useCart } from "@/components/cart-provider";

export function CartView() {
  const { items, subtotalInPaise, updateQuantity, removeItem } = useCart();
  const shippingInPaise = subtotalInPaise >= 199900 || subtotalInPaise === 0 ? 0 : 9900;
  const total = subtotalInPaise + shippingInPaise;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-start justify-center px-5 pt-28 pb-20 md:px-8">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink md:text-7xl">
          Cart
        </h1>
        <p className="mt-4 max-w-md text-base text-mute">
          Your bag is empty.
        </p>
        <Link href="/shop" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-20 md:px-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        Cart
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-6 md:gap-6">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-mist md:h-36 md:w-28">
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-display text-lg font-bold tracking-tight hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-mute">
                      {item.color} / {item.size}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatInr(item.unitPriceInPaise * item.quantity)}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="cursor-pointer text-xs tracking-[0.1em] uppercase text-mute hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-line bg-mist/40 p-6 md:sticky md:top-28">
          <p className="font-display text-2xl font-bold tracking-tight">
            Summary
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{formatInr(subtotalInPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Shipping</dt>
              <dd>{shippingInPaise === 0 ? "Free" : formatInr(shippingInPaise)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatInr(total)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-8 flex w-full cursor-pointer items-center justify-center bg-volt py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-volt-ink hover:opacity-90"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
