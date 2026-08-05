"use client";

import { useMemo, useState } from "react";
import {
  Product,
  collections,
  getLowestPrice,
  products,
} from "@/lib/catalog";
import { ProductCard } from "./product-card";

const ALL_SIZES = Array.from(
  new Set(products.flatMap((p) => p.variants.map((v) => v.size))),
).sort();

const ALL_COLORS = Array.from(
  new Set(products.flatMap((p) => p.variants.map((v) => v.color))),
).sort();

type Props = {
  initialCollection?: string;
  title?: string;
};

export function ShopCatalog({ initialCollection, title = "Shop" }: Props) {
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState(initialCollection ?? "all");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [maxPrice, setMaxPrice] = useState(500000);

  const filtered = useMemo(() => {
    return products.filter((product: Product) => {
      if (collection !== "all" && product.collection !== collection) return false;

      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay = `${product.name} ${product.description} ${product.collection}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      if (size !== "all") {
        const ok = product.variants.some((v) => v.size === size && v.stock > 0);
        if (!ok) return false;
      }

      if (color !== "all") {
        const ok = product.variants.some((v) => v.color === color);
        if (!ok) return false;
      }

      if (getLowestPrice(product) > maxPrice) return false;

      return true;
    });
  }, [q, collection, size, color, maxPrice]);

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
            <Chip active={size === "all"} onClick={() => setSize("all")} label="All" />
            {ALL_SIZES.map((s) => (
              <Chip key={s} active={size === s} onClick={() => setSize(s)} label={s} />
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
            {ALL_COLORS.map((c) => (
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
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
            Max price — ₹{(maxPrice / 100).toLocaleString("en-IN")}
          </p>
          <input
            type="range"
            min={99900}
            max={500000}
            step={10000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-3 w-full accent-ink"
          />
        </div>
      </aside>

      <div>
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-mute">
              {filtered.length} piece{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-20 text-mute">No pieces match those filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
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
        active ? "bg-ink text-paper" : "bg-mist text-ink hover:bg-ink hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}
