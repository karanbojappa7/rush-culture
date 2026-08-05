import { notFound } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { ProductForm } from "@/components/master/products/product-form";
import { apiGet } from "@/base/api-server";
import {
  imagesFromUrls,
  variantsFromProduct,
} from "@/base/product-form-initial";
import { type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

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
    apiGet<PageResult<Category>>("/api/categories?page=1&limit=100"),
  ]);
  const product = productRes.data;
  if (!product) notFound();

  return (
    <AdminShell
      title="Edit product"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      backHref="/products"
      backLabel="Back to products"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Products", href: "/products" },
        { label: product.name },
      ]}
    >
      <ProductForm
        productId={product.id}
        categories={categoriesRes.data?.items ?? []}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          brand: product.brand ?? "",
          categoryId: product.categoryId ?? "",
          isActive: product.isActive,
          images: imagesFromUrls(product.images.map((image) => image.url)),
          variants: variantsFromProduct(product.variants),
        }}
      />
    </AdminShell>
  );
}
