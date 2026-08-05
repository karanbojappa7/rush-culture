export type CategoryOption = { id: string; name: string; slug: string };

export type VariantDraft = {
  key: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  priceInr: string;
  stock: string;
};

export type ImageDraft = {
  key: string;
  url: string;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  brand: string;
  categoryId: string;
  isActive: boolean;
  images: ImageDraft[];
  variants: VariantDraft[];
};
