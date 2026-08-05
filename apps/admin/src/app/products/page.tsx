import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api-server";
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

export default async function ProductsPage() {
  const [user, productsRes] = await Promise.all([
    getSessionUser(),
    apiGet<Product[]>("/api/products"),
  ]);
  const products = productsRes.data ?? [];

  return (
    <AdminShell title="Products" userLabel={sessionLabel(user)}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-mute">{products.length} products</p>
        <Link
          href="/products/new"
          className="cursor-pointer bg-ink px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white"
        >
          New product
        </Link>
      </div>
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Variants</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const from = Math.min(
                ...product.variants.map((v) => v.priceInPaise),
                Number.POSITIVE_INFINITY,
              );
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {product.name}
                    {!product.isActive ? (
                      <span className="ml-2 text-xs text-mute">inactive</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-mute">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{product.variants.length}</td>
                  <td className="px-4 py-3">
                    {Number.isFinite(from) ? formatInr(from) : "—"}
                  </td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${product.id}`}
                      className="cursor-pointer text-xs tracking-[0.1em] uppercase hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
