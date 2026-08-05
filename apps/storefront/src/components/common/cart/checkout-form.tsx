"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/common/cart/cart-provider";
import { apiPost } from "@/base/api";
import { formatInr } from "@/base/format";
import {
  checkCartStock,
  stockIssueMessage,
  type StockCheckResult,
} from "@/base/stock";

type PlacedOrder = {
  id: string;
  orderNumber: string;
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotalInPaise, clear, applyStock, ready } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [stockNotice, setStockNotice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentDetails, setPaymentDetails] = useState("");

  const shippingInPaise =
    subtotalInPaise >= 199900 || subtotalInPaise === 0 ? 0 : 9900;
  const total = subtotalInPaise + shippingInPaise;

  const paymentHint = useMemo(() => {
    if (paymentMethod === "upi") return "UPI ID (e.g. name@okaxis)";
    if (paymentMethod === "card") return "Card last 4 digits";
    if (paymentMethod === "netbanking") return "Bank name";
    return "Notes for cash on delivery";
  }, [paymentMethod]);

  async function verifyStock(): Promise<StockCheckResult | null> {
    if (!items.length) return { ok: true, items: [] };
    setChecking(true);
    const result = await checkCartStock(
      items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    );
    setChecking(false);
    if (!result) {
      setError("Could not verify stock. Try again.");
      return null;
    }
    applyStock(
      result.items.map((item) => ({
        variantId: item.variantId,
        stock: item.stock,
      })),
    );
    if (!result.ok) {
      const message = stockIssueMessage(result);
      setStockNotice(message);
      setError(message);
      return null;
    }
    setStockNotice("");
    setError("");
    return result;
  }

  useEffect(() => {
    if (!ready || !items.length) return;
    let cancelled = false;
    (async () => {
      const result = await checkCartStock(
        items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
      if (cancelled || !result) return;
      applyStock(
        result.items.map((item) => ({
          variantId: item.variantId,
          stock: item.stock,
        })),
      );
      if (!result.ok) setStockNotice(stockIssueMessage(result));
      else setStockNotice("");
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") void verifyStock();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-20 md:px-8">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          Checkout
        </h1>
        <p className="mt-4 text-mute">Your bag is empty.</p>
        {stockNotice ? (
          <p className="mt-2 text-sm text-mute">{stockNotice}</p>
        ) : null}
        <Link href="/shop" className="mt-6 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setSubmitting(true);
    setError("");

    const verified = await verifyStock();
    if (!verified) {
      setSubmitting(false);
      return;
    }

    const orderItems = items
      .map((item) => {
        const checked = verified.items.find(
          (row) => row.variantId === item.variantId,
        );
        if (!checked || checked.status !== "ok") return null;
        return {
          variantId: item.variantId,
          productSlug: item.productSlug,
          productName: item.productName,
          variantSku: item.sku,
          size: item.size,
          color: item.color,
          unitPriceInPaise: item.unitPriceInPaise,
          quantity: checked.requested,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (!orderItems.length) {
      setError("Nothing left in stock to purchase.");
      setSubmitting(false);
      return;
    }

    const payload = {
      customerEmail: String(form.get("email")),
      shippingFullName: String(form.get("fullName")),
      shippingPhone: String(form.get("phone")),
      shippingLine1: String(form.get("line1")),
      shippingLine2: String(form.get("line2") || "") || undefined,
      shippingCity: String(form.get("city")),
      shippingState: String(form.get("state")),
      shippingPostalCode: String(form.get("postalCode")),
      shippingCountry: "IN",
      paymentMethod,
      paymentDetails: paymentDetails || undefined,
      idempotencyKey: crypto.randomUUID(),
      items: orderItems,
    };

    try {
      const res = await apiPost<PlacedOrder>("/api/orders", payload);
      if (res.status_code !== 200 || !res.data) {
        const result = await checkCartStock(
          items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        );
        if (result) {
          applyStock(
            result.items.map((item) => ({
              variantId: item.variantId,
              stock: item.stock,
            })),
          );
          throw new Error(
            res.message || stockIssueMessage(result) || "Could not place order",
          );
        }
        throw new Error(res.message || "Could not place order");
      }
      clear();
      router.push(`/checkout/success?order=${res.data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-20 md:px-8">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        Checkout
      </h1>
      <p className="mt-3 max-w-lg text-mute">
        Stock is verified before you place the order.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Contact</h2>
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" type="tel" required />
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Shipping</h2>
            <Field name="fullName" label="Full name" required />
            <Field name="line1" label="Address line 1" required />
            <Field name="line2" label="Address line 2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="city" label="City" required />
              <Field name="state" label="State" required />
            </div>
            <Field name="postalCode" label="PIN code" required />
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Payment details</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "upi", label: "UPI" },
                { id: "card", label: "Card" },
                { id: "netbanking", label: "Netbanking" },
                { id: "cod", label: "Cash on delivery" },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(method.id);
                    setPaymentDetails("");
                  }}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium ${
                    paymentMethod === method.id
                      ? "bg-ink text-paper"
                      : "bg-mist text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            <div>
              <label
                htmlFor="paymentDetails"
                className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
              >
                {paymentHint}
              </label>
              <input
                id="paymentDetails"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
                required={paymentMethod !== "cod"}
              />
            </div>
          </section>
        </div>

        <aside className="h-fit border border-line bg-mist/40 p-6 md:sticky md:top-28">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-2xl font-bold">Order</p>
            <button
              type="button"
              onClick={() => void verifyStock()}
              disabled={checking}
              className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute hover:text-ink disabled:opacity-50"
            >
              {checking ? "Checking…" : "Refresh stock"}
            </button>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => {
              const soldOut =
                typeof item.maxStock === "number" && item.maxStock <= 0;
              const low =
                typeof item.maxStock === "number" &&
                item.maxStock > 0 &&
                item.quantity >= item.maxStock;
              return (
                <li key={item.key} className="flex justify-between gap-3">
                  <span className={soldOut ? "text-mute line-through" : "text-mute"}>
                    {item.productName} × {item.quantity}
                    {soldOut
                      ? " · Out of stock"
                      : low
                        ? ` · ${item.maxStock} left`
                        : ""}
                  </span>
                  <span>
                    {formatInr(item.unitPriceInPaise * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{formatInr(subtotalInPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Shipping</dt>
              <dd>
                {shippingInPaise === 0 ? "Free" : formatInr(shippingInPaise)}
              </dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatInr(total)}</dd>
            </div>
          </dl>

          {stockNotice ? (
            <p className="mt-4 text-sm text-mute">{stockNotice}</p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || checking}
            className="mt-8 w-full cursor-pointer bg-volt py-4 text-[13px] font-bold tracking-[0.14em] uppercase text-volt-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Placing…" : checking ? "Checking stock…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
      />
    </div>
  );
}
