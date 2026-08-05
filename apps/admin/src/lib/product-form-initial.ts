import { brand, sku as buildSku } from "@linq/site-config";
import type {
  ImageDraft,
  ProductFormValues,
  VariantDraft,
} from "@/components/product-form-types";

export function newKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyVariant(partial?: Partial<VariantDraft>): VariantDraft {
  return {
    key: newKey(),
    sku: "",
    size: "M",
    color: "Black",
    colorHex: "#111111",
    priceInr: "1999",
    stock: "10",
    ...partial,
  };
}

export function emptyImage(url = ""): ImageDraft {
  return { key: newKey(), url };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function suggestSku(productName: string, size: string, color: string) {
  const base = slugify(productName || "item")
    .split("-")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("");
  const sizePart = size.replace(/\s+/g, "").toUpperCase().slice(0, 4) || "OS";
  const colorPart = color.replace(/\s+/g, "").toUpperCase().slice(0, 3) || "CLR";
  return buildSku(`${base || "PRD"}-${sizePart}-${colorPart}`);
}

function paiseToInrInput(paise: number) {
  return String(Math.round(paise) / 100);
}

export function variantsFromProduct(
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    colorHex: string | null;
    priceInPaise: number;
    stock: number;
  }>,
): VariantDraft[] {
  if (!variants.length) return [emptyVariant()];
  return variants.map((variant) =>
    emptyVariant({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex || "#111111",
      priceInr: paiseToInrInput(variant.priceInPaise),
      stock: String(variant.stock),
    }),
  );
}

export function imagesFromUrls(urls: string[]): ImageDraft[] {
  if (!urls.length) return [emptyImage()];
  return urls.map((url) => emptyImage(url));
}

export const emptyProductFormValues: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  brand: brand.name,
  categoryId: "",
  isActive: true,
  images: [emptyImage()],
  variants: [emptyVariant()],
};
