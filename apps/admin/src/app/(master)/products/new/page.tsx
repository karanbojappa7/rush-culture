import { AdminShell } from "@/components/common/layout/admin-shell";
import { ProductForm } from "@/components/master/products/product-form";
import { apiGet } from "@/base/api-server";
import { type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

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
      roleCode={user?.roleCode}
      permissions={user?.permissions}
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
