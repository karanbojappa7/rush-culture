import { AdminShell } from "@/components/layout/admin-shell";
import { CategoryForm } from "@/components/categories/category-form";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { apiGet } from "@/lib/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function CategoriesPage({ searchParams }: Props) {
  const { page = "1", q } = await searchParams;
  const [user, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Category>>(
      `/api/categories${pageQuery({ page, limit: 20, q })}`,
    ),
  ]);
  const data = categoriesRes.data ?? emptyPage<Category>();

  return (
    <AdminShell
      title="Categories"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Categories" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <ListToolbar
            total={data.total}
            noun="categories"
            placeholder="Search categories…"
          />
          <DataTable
            columns={[
              { key: "name", header: "Name" },
              { key: "slug", header: "Slug" },
              { key: "description", header: "Description" },
            ]}
            empty={
              q ? "No categories match your search." : "No categories yet."
            }
            isEmpty={data.items.length === 0}
          >
            {data.items.map((category) => (
              <DataTableRow key={category.id}>
                <DataTableCell className="font-medium">
                  {category.name}
                </DataTableCell>
                <DataTableCell mute>{category.slug}</DataTableCell>
                <DataTableCell mute>
                  {category.description ?? "—"}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
          <PaginationNav
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            basePath="/categories"
            searchParams={{ q }}
          />
        </div>
        <CategoryForm />
      </div>
    </AdminShell>
  );
}
