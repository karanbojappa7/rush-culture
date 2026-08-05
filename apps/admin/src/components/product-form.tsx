"use client";

import { FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { formatInr, sku as buildSku } from "@linq/site-config";
import { apiPatch, apiPost } from "@/lib/api";
import {
  emptyImage,
  emptyProductFormValues,
  emptyVariant,
  newKey,
  suggestSku,
} from "@/lib/product-form-initial";
import type {
  CategoryOption,
  ImageDraft,
  ProductFormValues,
  VariantDraft,
} from "@/components/product-form-types";

export type {
  CategoryOption,
  ImageDraft,
  ProductFormValues,
  VariantDraft,
} from "@/components/product-form-types";

const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "28",
  "30",
  "32",
  "34",
  "36",
];

const COLOR_PRESETS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Grey", hex: "#6B6B6B" },
  { name: "Beige", hex: "#D4C4A8" },
  { name: "Red", hex: "#C41E3A" },
  { name: "Blue", hex: "#2E5AAC" },
  { name: "Brown", hex: "#6B4423" },
  { name: "Pink", hex: "#E8A0BF" },
];

const fieldClass =
  "mt-1.5 w-full border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

const compactFieldClass =
  "w-full border border-line bg-bg px-2.5 py-2 text-sm text-ink outline-none focus:border-ink";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inrToPaise(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

export function ProductForm({
  categories,
  initial,
  productId,
}: {
  categories: CategoryOption[];
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const formId = useId();
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyProductFormValues,
    ...initial,
    images: initial?.images?.length
      ? initial.images
      : emptyProductFormValues.images,
    variants: initial?.variants?.length
      ? initial.variants
      : emptyProductFormValues.variants,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setValues((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.key === key ? { ...variant, ...patch } : variant,
      ),
    }));
  }

  function addVariant() {
    setValues((prev) => {
      const last = prev.variants[prev.variants.length - 1];
      return {
        ...prev,
        variants: [
          ...prev.variants,
          emptyVariant({
            size: last?.size ?? "M",
            color: last?.color ?? "Black",
            colorHex: last?.colorHex ?? "#111111",
            priceInr: last?.priceInr ?? "1999",
            stock: last?.stock ?? "10",
            sku: suggestSku(
              prev.name,
              last?.size ?? "M",
              last?.color ?? "Black",
            ),
          }),
        ],
      };
    });
  }

  function duplicateVariant(key: string) {
    setValues((prev) => {
      const source = prev.variants.find((variant) => variant.key === key);
      if (!source) return prev;
      const copy = emptyVariant({
        ...source,
        key: newKey(),
        sku: source.sku ? `${source.sku}-COPY` : "",
      });
      const index = prev.variants.findIndex((variant) => variant.key === key);
      const next = [...prev.variants];
      next.splice(index + 1, 0, copy);
      return { ...prev, variants: next };
    });
  }

  function removeVariant(key: string) {
    setValues((prev) => ({
      ...prev,
      variants:
        prev.variants.length <= 1
          ? prev.variants
          : prev.variants.filter((variant) => variant.key !== key),
    }));
  }

  function updateImage(key: string, url: string) {
    setValues((prev) => ({
      ...prev,
      images: prev.images.map((image) =>
        image.key === key ? { ...image, url } : image,
      ),
    }));
  }

  function addImage() {
    setValues((prev) => ({
      ...prev,
      images: [...prev.images, emptyImage()],
    }));
  }

  function removeImage(key: string) {
    setValues((prev) => ({
      ...prev,
      images:
        prev.images.length <= 1
          ? prev.images
          : prev.images.filter((image) => image.key !== key),
    }));
  }

  function applyColorPreset(key: string, preset: (typeof COLOR_PRESETS)[number]) {
    updateVariant(key, { color: preset.name, colorHex: preset.hex });
  }

  function fillSku(key: string) {
    const variant = values.variants.find((item) => item.key === key);
    if (!variant) return;
    updateVariant(key, {
      sku: suggestSku(values.name, variant.size, variant.color),
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const variants = values.variants.map((variant) => {
      const priceInPaise = inrToPaise(variant.priceInr);
      return {
        sku: variant.sku.trim(),
        size: variant.size.trim(),
        color: variant.color.trim(),
        colorHex: variant.colorHex.trim() || undefined,
        priceInPaise,
        stock: Number(variant.stock || 0),
      };
    });

    if (
      variants.some(
        (variant) =>
          !variant.sku ||
          !variant.size ||
          !variant.color ||
          !Number.isFinite(variant.priceInPaise),
      )
    ) {
      setSaving(false);
      setError("Each variant needs SKU, size, color, and a valid price.");
      return;
    }

    const images = values.images
      .map((image) => image.url.trim())
      .filter(Boolean)
      .map((url, sortOrder) => ({
        url,
        alt: values.name,
        sortOrder,
        isPrimary: sortOrder === 0,
      }));

    const payload = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      brand: values.brand || undefined,
      categoryId: values.categoryId || undefined,
      isActive: values.isActive,
      variants: productId ? undefined : variants,
      images: productId ? undefined : images,
    };

    const res = productId
      ? await apiPatch(`/api/products/${productId}`, payload)
      : await apiPost("/api/products", payload);

    if (res.status_code !== 200) {
      setSaving(false);
      setError(res.message || "Save failed");
      return;
    }

    if (productId) {
      const [variantsRes, imagesRes] = await Promise.all([
        apiPatch(`/api/products/${productId}/variants`, { variants }),
        apiPatch(`/api/products/${productId}/images`, { images }),
      ]);
      if (variantsRes.status_code !== 200 || imagesRes.status_code !== 200) {
        setSaving(false);
        setError(variantsRes.message || imagesRes.message || "Details failed");
        return;
      }
    }

    setSaving(false);
    router.push("/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-5xl space-y-8">
      <section className="space-y-5 border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
          Basics
        </h2>
        <Field label="Name" htmlFor={`${formId}-name`}>
          <input
            id={`${formId}-name`}
            required
            value={values.name}
            onChange={(e) => {
              const name = e.target.value;
              setValues((prev) => ({
                ...prev,
                name,
                slug: prev.slug ? prev.slug : slugify(name),
              }));
            }}
            className={fieldClass}
          />
        </Field>
        <Field label="Slug" htmlFor={`${formId}-slug`}>
          <input
            id={`${formId}-slug`}
            value={values.slug}
            onChange={(e) => setField("slug", e.target.value)}
            className={fieldClass}
            placeholder="auto from name"
          />
        </Field>
        <Field label="Description" htmlFor={`${formId}-description`}>
          <textarea
            id={`${formId}-description`}
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            className={`${fieldClass} min-h-28`}
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Brand" htmlFor={`${formId}-brand`}>
            <input
              id={`${formId}-brand`}
              value={values.brand}
              onChange={(e) => setField("brand", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Category" htmlFor={`${formId}-category`}>
            <select
              id={`${formId}-category`}
              value={values.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              className={fieldClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setField("isActive", e.target.checked)}
          />
          Active on storefront
        </label>
      </section>

      <section className="space-y-4 border border-line bg-panel p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Images
            </h2>
            <p className="mt-1 text-sm text-mute">
              First image is primary. Paste a URL to preview.
            </p>
          </div>
          <button
            type="button"
            onClick={addImage}
            className="cursor-pointer border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink hover:bg-bg"
          >
            Add image
          </button>
        </div>
        <ul className="space-y-3">
          {values.images.map((image, index) => (
            <li
              key={image.key}
              className="grid gap-3 border border-line bg-bg p-3 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <div className="relative aspect-[3/4] overflow-hidden border border-line bg-panel">
                {image.url ? (
                  <img
                    src={image.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-wider text-mute">
                    Preview
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                  {index === 0 ? "Primary URL" : `Image ${index + 1}`}
                  <input
                    value={image.url}
                    onChange={(e) => updateImage(image.key, e.target.value)}
                    className={fieldClass}
                    placeholder="https://"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeImage(image.key)}
                disabled={values.images.length <= 1}
                className="cursor-pointer px-2 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border border-line bg-panel p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Variants
            </h2>
            <p className="mt-1 text-sm text-mute">
              Price in rupees. Color picker + presets. SKU can auto-fill from
              name, size, and color.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="cursor-pointer bg-ink px-3 py-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-white"
          >
            Add variant
          </button>
        </div>

        <div className="space-y-4">
          {values.variants.map((variant, index) => {
            const pricePaise = inrToPaise(variant.priceInr);
            const sizeIsCustom = !SIZE_OPTIONS.includes(variant.size);
            return (
              <article
                key={variant.key}
                className="border border-line bg-bg p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-mute">
                    Variant {index + 1}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateVariant(variant.key)}
                      className="cursor-pointer px-2 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.key)}
                      disabled={values.variants.length <= 1}
                      className="cursor-pointer px-2 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                  <label className="lg:col-span-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                      SKU
                      <span className="group relative inline-flex">
                        <button
                          type="button"
                          className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-line text-[10px] font-semibold normal-case tracking-normal text-mute hover:border-ink hover:text-ink"
                          aria-label="What is SKU?"
                        >
                          ?
                        </button>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 border border-line bg-panel px-3 py-2 text-[11px] font-normal normal-case tracking-normal text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                        >
                          Stock Keeping Unit — unique code for this size/color
                          variant (e.g. RC-TEE-M-BLK). Used for inventory and
                          orders.
                        </span>
                      </span>
                    </span>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.key, { sku: e.target.value })
                        }
                        className={compactFieldClass}
                        placeholder={buildSku("TEE-M-BLK")}
                      />
                      <button
                        type="button"
                        onClick={() => fillSku(variant.key)}
                        className="shrink-0 cursor-pointer border border-line px-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-mute hover:border-ink hover:text-ink"
                        title="Generate SKU from name, size, and color"
                      >
                        Auto
                      </button>
                    </div>
                  </label>

                  <label className="lg:col-span-2">
                    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                      Size
                    </span>
                    <select
                      value={sizeIsCustom ? "__custom" : variant.size}
                      onChange={(e) => {
                        if (e.target.value === "__custom") {
                          updateVariant(variant.key, { size: "" });
                          return;
                        }
                        updateVariant(variant.key, { size: e.target.value });
                      }}
                      className={`${compactFieldClass} mt-1.5`}
                    >
                      {SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                      <option value="__custom">Custom…</option>
                    </select>
                    {sizeIsCustom || variant.size === "" ? (
                      <input
                        required
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(variant.key, { size: e.target.value })
                        }
                        className={`${compactFieldClass} mt-2`}
                        placeholder="Custom size"
                      />
                    ) : null}
                  </label>

                  <div className="lg:col-span-4">
                    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                      Color
                    </span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(variant.colorHex)
                            ? variant.colorHex
                            : "#111111"
                        }
                        onChange={(e) =>
                          updateVariant(variant.key, {
                            colorHex: e.target.value.toUpperCase(),
                          })
                        }
                        className="h-10 w-12 cursor-pointer border border-line bg-panel p-1"
                        aria-label="Pick color"
                      />
                      <input
                        value={variant.colorHex}
                        onChange={(e) =>
                          updateVariant(variant.key, {
                            colorHex: e.target.value,
                          })
                        }
                        className={`${compactFieldClass} w-28 font-mono`}
                        placeholder="#111111"
                        pattern="^#([0-9A-Fa-f]{6})$"
                        title="Hex like #111111"
                      />
                      <input
                        required
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(variant.key, { color: e.target.value })
                        }
                        className={`${compactFieldClass} min-w-[8rem] flex-1`}
                        placeholder="Color name"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            applyColorPreset(variant.key, preset)
                          }
                          className="inline-flex cursor-pointer items-center gap-1.5 border border-line bg-panel px-2 py-1 text-[11px] text-ink hover:border-ink"
                          title={preset.name}
                        >
                          <span
                            className="inline-block h-3 w-3 border border-line"
                            style={{ backgroundColor: preset.hex }}
                          />
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="lg:col-span-2">
                    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                      Price (₹)
                    </span>
                    <input
                      required
                      inputMode="decimal"
                      value={variant.priceInr}
                      onChange={(e) =>
                        updateVariant(variant.key, {
                          priceInr: e.target.value,
                        })
                      }
                      className={`${compactFieldClass} mt-1.5`}
                      placeholder="1999"
                    />
                    <p className="mt-1 text-[11px] text-mute">
                      {Number.isFinite(pricePaise)
                        ? `${formatInr(pricePaise)} · ${pricePaise} paise`
                        : "Enter amount in rupees"}
                    </p>
                  </label>

                  <label className="lg:col-span-1">
                    <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
                      Stock
                    </span>
                    <input
                      required
                      inputMode="numeric"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(variant.key, { stock: e.target.value })
                      }
                      className={`${compactFieldClass} mt-1.5`}
                      min={0}
                    />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer bg-ink px-6 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : productId ? "Update product" : "Create product"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
    >
      {label}
      {children}
    </label>
  );
}
