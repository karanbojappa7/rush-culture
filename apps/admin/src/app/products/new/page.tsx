import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";
import { apiGet } from "@/lib/api-server";
import { type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Category = { id: string; name: string; slug: string };

export default async function NewProductPage() {
  const [user, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Category>>("/api/categories?page=1&limit=100"),
  ]);

  return (
    <AdminShell
      title="New product"
      userLabel={sessionLabel(user)}
      backHref="/products"
      backLabel="Back to products"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Products", href: "/products" },
        { label: "New" },
      ]}
    >
      <ProductForm categories={categoriesRes.data?.items ?? []} />
    </AdminShell>
  );
}
