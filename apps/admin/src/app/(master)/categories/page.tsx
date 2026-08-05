import Link from "next/link";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { CategoryForm } from "@/components/master/categories/category-form";
import { DeleteActionButton } from "@/components/common/ui/delete-action-button";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { ListToolbar } from "@/components/common/ui/list-toolbar";
import { PaginationNav } from "@/components/common/ui/pagination-nav";
import { apiGet } from "@/base/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    edit?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function CategoriesPage({ searchParams }: Props) {
  const { page = "1", q, edit, from, to } = await searchParams;
  const [user, categoriesRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Category>>(
      `/api/categories${pageQuery({ page, limit: 20, q, from, to })}`,
    ),
  ]);
  const data = categoriesRes.data ?? emptyPage<Category>();
  let editing: Category | null =
    (edit && data.items.find((category) => category.id === edit)) || null;
  if (edit && !editing) {
    editing = (await apiGet<Category>(`/api/categories/${edit}`)).data ?? null;
  }

  const listQuery = new URLSearchParams();
  if (q) listQuery.set("q", q);
  if (from) listQuery.set("from", from);
  if (to) listQuery.set("to", to);
  if (page !== "1") listQuery.set("page", page);
  const listQs = listQuery.toString();
  const listHref = listQs ? `/categories?${listQs}` : "/categories";
  const hasFilters = Boolean(q || from || to);

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
              { key: "actions", header: "" },
            ]}
            empty={
              hasFilters
                ? "No categories match your filters."
                : "No categories yet."
            }
            isEmpty={data.items.length === 0}
          >
            {data.items.map((category) => {
              const editParams = new URLSearchParams();
              if (q) editParams.set("q", q);
              if (from) editParams.set("from", from);
              if (to) editParams.set("to", to);
              if (page !== "1") editParams.set("page", page);
              editParams.set("edit", category.id);
              return (
                <DataTableRow key={category.id}>
                  <DataTableCell className="font-medium">
                    {category.name}
                  </DataTableCell>
                  <DataTableCell mute>{category.slug}</DataTableCell>
                  <DataTableCell mute>
                    {category.description ?? "—"}
                  </DataTableCell>
                  <DataTableCell align="right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/categories?${editParams.toString()}`}
                        className="cursor-pointer text-[11px] font-semibold tracking-[0.1em] uppercase hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteActionButton
                        href={`/api/categories/${category.id}`}
                        confirmLabel={`Delete category “${category.name}”?`}
                      />
                    </div>
                  </DataTableCell>
                </DataTableRow>
              );
            })}
          </DataTable>
          <PaginationNav
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            basePath="/categories"
            searchParams={{ q, from, to }}
          />
        </div>
        <CategoryForm category={editing} cancelHref={listHref} />
      </div>
    </AdminShell>
  );
}
