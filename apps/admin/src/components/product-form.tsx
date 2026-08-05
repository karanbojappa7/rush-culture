"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPatch, apiPost } from "@/lib/api";

export type CategoryOption = { id: string; name: string; slug: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  isActive: boolean;
  imageUrls: string;
  variantsText: string;
};

const emptyValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  categoryId: "",
  isActive: true,
  imageUrls: "",
  variantsText: "SKU,M,Black,#111111,199900,10",
};

const fieldClass =
  "mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink";

function parseVariants(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [sku, size, color, colorHex, priceInPaise, stock] = line
        .split(",")
        .map((part) => part.trim());
      return {
        sku,
        size,
        color,
        colorHex: colorHex || undefined,
        priceInPaise: Number(priceInPaise),
        stock: Number(stock || 0),
      };
    });
}

function parseImages(text: string, productName: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url, sortOrder) => ({
      url,
      alt: productName,
      sortOrder,
      isPrimary: sortOrder === 0,
    }));
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
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const variants = parseVariants(values.variantsText);
    const images = parseImages(values.imageUrls, values.name);
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
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      <Field label="Name">
        <input
          required
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          className={fieldClass}
        />
      </Field>
      <Field label="Slug">
        <input
          value={values.slug}
          onChange={(e) => setField("slug", e.target.value)}
          className={fieldClass}
          placeholder="auto from name"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          className={`${fieldClass} min-h-28`}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Brand">
          <input
            value={values.brand}
            onChange={(e) => setField("brand", e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Category">
          <select
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
        Active
      </label>
      <Field label="Image URLs (one per line)">
        <textarea
          value={values.imageUrls}
          onChange={(e) => setField("imageUrls", e.target.value)}
          className={`${fieldClass} min-h-24 font-mono text-xs`}
        />
      </Field>
      <Field label="Variants (sku,size,color,hex,pricePaise,stock)">
        <textarea
          value={values.variantsText}
          onChange={(e) => setField("variantsText", e.target.value)}
          className={`${fieldClass} min-h-32 font-mono text-xs`}
          required
        />
      </Field>
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
      {label}
      {children}
    </label>
  );
}
