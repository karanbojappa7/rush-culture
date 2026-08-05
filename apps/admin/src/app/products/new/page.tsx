import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";
import { apiGet } from "@/lib/api-server";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Category = { id: string; name: string; slug: string };

export default async function NewProductPage() {
  const [user, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<Category[]>("/api/categories"),
  ]);

  return (
    <AdminShell title="New product" userLabel={sessionLabel(user)}>
      <ProductForm categories={categoriesRes.data ?? []} />
    </AdminShell>
  );
}
