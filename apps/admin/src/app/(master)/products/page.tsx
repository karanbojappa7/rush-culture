import Link from "next/link";
import { AdminShell } from "@/components/common/layout/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { ListToolbar } from "@/components/common/ui/list-toolbar";
import { PaginationNav } from "@/components/common/ui/pagination-nav";
import { formatInr } from "@/base/api-server";
import { emptyPage } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";
import { ProductController } from "@/module/master/product/product.controller";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const { page = "1", q, from, to } = await searchParams;
  const products = await ProductController.server();
  const [user, productsRes] = await Promise.all([
    getSessionUser(),
    products.listPage({ page, limit: 20, q, from, to }),
  ]);
  const data = productsRes.data ?? emptyPage();
  const hasFilters = Boolean(q || from || to);

  return (
    <AdminShell
      title="Products"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Products" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="products"
        placeholder="Search products…"
        actions={
          <Link
            href="/products/new"
            className="cursor-pointer bg-ink px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white transition-opacity hover:opacity-90"
          >
            New product
          </Link>
        }
      />
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "category", header: "Category" },
          { key: "variants", header: "Variants" },
          { key: "from", header: "From" },
          { key: "stock", header: "Stock" },
          { key: "actions", header: "" },
        ]}
        empty={
          hasFilters
            ? "No products match your filters."
            : "No products yet."
        }
        isEmpty={data.items.length === 0}
      >
        {data.items.map((product) => {
          const priceFrom = Math.min(
            ...product.variants.map((v) => v.priceInPaise),
            Number.POSITIVE_INFINITY,
          );
          const stock = product.variants.reduce((s, v) => s + v.stock, 0);
          return (
            <DataTableRow key={product.id}>
              <DataTableCell className="font-medium">
                {product.name}
                {!product.isActive ? (
                  <span className="ml-2 text-xs text-mute">inactive</span>
                ) : null}
              </DataTableCell>
              <DataTableCell mute>
                {product.category?.name ?? "—"}
              </DataTableCell>
              <DataTableCell>{product.variants.length}</DataTableCell>
              <DataTableCell>
                {Number.isFinite(priceFrom) ? formatInr(priceFrom) : "—"}
              </DataTableCell>
              <DataTableCell>{stock}</DataTableCell>
              <DataTableCell align="right">
                <Link
                  href={`/products/${product.id}`}
                  className="cursor-pointer text-xs tracking-[0.1em] uppercase hover:underline"
                >
                  Edit
                </Link>
              </DataTableCell>
            </DataTableRow>
          );
        })}
      </DataTable>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/products"
        searchParams={{ q, from, to }}
      />
    </AdminShell>
  );
}
