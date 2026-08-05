import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";
import { apiGet } from "@/lib/api-server";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  categoryId: string | null;
  isActive: boolean;
  images: Array<{ url: string }>;
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    colorHex: string | null;
    priceInPaise: number;
    stock: number;
  }>;
};

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [user, productRes, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<Product>(`/api/products/id/${id}`),
    apiGet<Category[]>("/api/categories"),
  ]);
  const product = productRes.data;
  if (!product) notFound();

  return (
    <AdminShell title="Edit product" userLabel={sessionLabel(user)}>
      <ProductForm
        productId={product.id}
        categories={categoriesRes.data ?? []}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          brand: product.brand ?? "",
          categoryId: product.categoryId ?? "",
          isActive: product.isActive,
          imageUrls: product.images.map((image) => image.url).join("\n"),
          variantsText: product.variants
            .map(
              (variant) =>
                `${variant.sku},${variant.size},${variant.color},${variant.colorHex ?? ""},${variant.priceInPaise},${variant.stock}`,
            )
            .join("\n"),
        }}
      />
    </AdminShell>
  );
}
