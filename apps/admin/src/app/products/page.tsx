import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/data-table";
import { ListToolbar } from "@/components/list-toolbar";
import { PaginationNav } from "@/components/pagination-nav";
import { apiGet, formatInr } from "@/lib/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Product = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  category?: { name: string; slug: string } | null;
  variants: Array<{
    priceInPaise: number;
    stock: number;
  }>;
};

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const { page = "1", q } = await searchParams;
  const [user, productsRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Product>>(
      `/api/products${pageQuery({ page, limit: 20, q })}`,
    ),
  ]);
  const data = productsRes.data ?? emptyPage<Product>();

  return (
    <AdminShell
      title="Products"
      userLabel={sessionLabel(user)}
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
        empty={q ? "No products match your search." : "No products yet."}
        isEmpty={data.items.length === 0}
      >
        {data.items.map((product) => {
          const from = Math.min(
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
                {Number.isFinite(from) ? formatInr(from) : "—"}
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
        searchParams={{ q }}
      />
    </AdminShell>
  );
}
