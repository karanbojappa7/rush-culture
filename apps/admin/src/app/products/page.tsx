import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  slug: string;
  collection: string;
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    priceInPaise: number;
    stock: number;
  }>;
};

export default async function ProductsPage() {
  const res = await apiGet<Product[]>("/api/products");
  const products = res.data ?? [];

  return (
    <AdminShell title="Products">
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-mute">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = product.variants.reduce((s, v) => s + v.stock, 0);
              const from = Math.min(
                ...product.variants.map((v) => v.priceInPaise),
              );
              return (
                <tr key={product.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 uppercase text-mute">
                    {product.collection}
                  </td>
                  <td className="px-4 py-3">{product.variants.length}</td>
                  <td className="px-4 py-3">{formatInr(from)}</td>
                  <td className="px-4 py-3">{stock}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
