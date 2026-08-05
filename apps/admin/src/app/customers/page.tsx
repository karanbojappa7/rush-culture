import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api";

type Order = {
  id: string;
  customerEmail: string | null;
  shippingFullName: string;
  shippingPhone: string;
  totalInPaise: number;
  createdAt: string;
  orderNumber: string;
};

export default async function CustomersPage() {
  const res = await apiGet<Order[]>("/api/orders");
  const orders = res.data ?? [];

  const byEmail = new Map<
    string,
    {
      name: string;
      email: string;
      phone: string;
      orders: number;
      spent: number;
      lastOrder: string;
    }
  >();

  for (const order of orders) {
    const key = (order.customerEmail ?? order.shippingPhone).toLowerCase();
    const existing = byEmail.get(key);
    if (existing) {
      existing.orders += 1;
      existing.spent += order.totalInPaise;
      if (order.createdAt > existing.lastOrder) {
        existing.lastOrder = order.createdAt;
        existing.name = order.shippingFullName;
      }
    } else {
      byEmail.set(key, {
        name: order.shippingFullName,
        email: order.customerEmail ?? "—",
        phone: order.shippingPhone,
        orders: 1,
        spent: order.totalInPaise,
        lastOrder: order.createdAt,
      });
    }
  }

  const customers = [...byEmail.values()].sort((a, b) =>
    b.lastOrder.localeCompare(a.lastOrder),
  );

  return (
    <AdminShell title="Customers">
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-mute">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spent</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-mute">
                  Customers appear after checkout.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.email + c.phone} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <div>{c.email}</div>
                    <div className="text-mute">{c.phone}</div>
                  </td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3">{formatInr(c.spent)}</td>
                  <td className="px-4 py-3">
                    {new Date(c.lastOrder).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
