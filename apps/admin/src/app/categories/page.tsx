import { AdminShell } from "@/components/admin-shell";
import { CategoryForm } from "@/components/category-form";
import { apiGet } from "@/lib/api-server";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export default async function CategoriesPage() {
  const [user, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<Category[]>("/api/categories"),
  ]);
  const categories = categoriesRes.data ?? [];

  return (
    <AdminShell title="Categories" userLabel={sessionLabel(user)}>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="overflow-x-auto border border-line bg-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-mute">{category.slug}</td>
                  <td className="px-4 py-3 text-mute">
                    {category.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CategoryForm />
      </div>
    </AdminShell>
  );
}
