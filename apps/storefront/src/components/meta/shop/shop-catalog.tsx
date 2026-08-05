"use client";

import { useEffect, useState } from "react";
import {
  Collection,
  Product,
  fetchProductsPage,
  type PageResult,
} from "@/base/catalog";
import { ProductCard } from "./product-card";

type Props = {
  collections: Collection[];
  initialCollection?: string;
  title?: string;
};

const PAGE_SIZE = 12;
const PRICE_FILTER_MAX = 2_000_000;

export function ShopCatalog({
  collections,
  initialCollection,
  title = "Shop",
}: Props) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [collection, setCollection] = useState(initialCollection ?? "all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [maxPrice, setMaxPrice] = useState(PRICE_FILTER_MAX);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PageResult<Product>>({
    items: [],
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [facetSizes, setFacetSizes] = useState<string[]>([]);
  const [facetColors, setFacetColors] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, collection, size, color, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const categoryId =
        collection === "all"
          ? undefined
          : collections.find((item) => item.slug === collection)?.id;
      const data = await fetchProductsPage({
        page,
        limit: PAGE_SIZE,
        q: debouncedQ || undefined,
        categoryId,
        size: size === "all" ? undefined : size,
        color: color === "all" ? undefined : color,
        maxPrice: maxPrice < PRICE_FILTER_MAX ? maxPrice : undefined,
        isActive: true,
      });
      if (cancelled) return;
      setResult(data);
      setFacetSizes((prev) => {
        const next = Array.from(
          new Set([
            ...prev,
            ...data.items.flatMap((product) =>
              product.variants.map((variant) => variant.size),
            ),
          ]),
        ).sort();
        return next.length ? next : prev;
      });
      setFacetColors((prev) => {
        const next = Array.from(
          new Set([
            ...prev,
            ...data.items.flatMap((product) =>
              product.variants.map((variant) => variant.color),
            ),
          ]),
        ).sort();
        return next.length ? next : prev;
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedQ, collection, size, color, maxPrice, collections]);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 md:grid-cols-[220px_1fr] md:gap-12 md:px-8 md:py-14">
      <aside className="space-y-8 md:sticky md:top-28 md:self-start">
        <div>
          <label
            htmlFor="shop-search"
            className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
          >
            Search
          </label>
          <input
            id="shop-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tee, cargo, hoodie…"
            className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
            Collection
          </p>
          <div className="mt-3 flex flex-col gap-1">
            <FilterButton
              active={collection === "all"}
              onClick={() => setCollection("all")}
              label="All"
            />
            {collections.map((c) => (
              <FilterButton
                key={c.slug}
                active={collection === c.slug}
                onClick={() => setCollection(c.slug)}
                label={c.name}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
            Size
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              active={size === "all"}
              onClick={() => setSize("all")}
              label="All"
            />
            {facetSizes.map((s) => (
              <Chip
                key={s}
                active={size === s}
                onClick={() => setSize(s)}
                label={s}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
            Color
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              active={color === "all"}
              onClick={() => setColor("all")}
              label="All"
            />
            {facetColors.map((c) => (
              <Chip
                key={c}
                active={color === c}
                onClick={() => setColor(c)}
                label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="max-price"
            className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
          >
            Max price
          </label>
          <input
            id="max-price"
            type="range"
            min={50000}
            max={PRICE_FILTER_MAX}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <p className="mt-1 text-sm text-mute">
            {maxPrice >= PRICE_FILTER_MAX
              ? "Any price"
              : `Up to ₹${Math.round(maxPrice / 100).toLocaleString("en-IN")}`}
          </p>
        </div>
      </aside>

      <div>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-mute">
              {loading
                ? "Loading…"
                : `${result.total} piece${result.total === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {!loading && result.items.length === 0 ? (
          <p className="py-20 text-mute">No pieces match those filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            {result.items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        {result.totalPages > 1 ? (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-mute">
              Page {result.page} of {result.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= result.totalPages || loading}
                onClick={() =>
                  setPage((prev) => Math.min(result.totalPages, prev + 1))
                }
                className="border border-line bg-ink px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer px-2 py-1.5 text-left text-sm transition-colors ${
        active ? "bg-ink text-paper" : "text-ink hover:bg-mist"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
        active
          ? "bg-ink text-paper"
          : "bg-mist text-ink hover:bg-ink hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}
