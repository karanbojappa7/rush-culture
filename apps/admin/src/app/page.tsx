import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api";

type Summary = {
  orders: number;
  pending: number;
  revenueInPaise: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  totalInPaise: number;
  paymentMethod: string | null;
  paymentStatus: string;
  createdAt: string;
  shippingFullName: string;
};

export default async function AdminHomePage() {
  const [summaryRes, ordersRes] = await Promise.all([
    apiGet<Summary>("/api/orders/summary"),
    apiGet<Order[]>("/api/orders"),
  ]);

  const summary = summaryRes.data ?? { orders: 0, pending: 0, revenueInPaise: 0 };
  const recent = (ordersRes.data ?? []).slice(0, 8);

  return (
    <AdminShell title="Overview">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(summary.orders)} />
        <Stat label="Pending payment" value={String(summary.pending)} />
        <Stat label="Revenue captured" value={formatInr(summary.revenueInPaise)} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">Recent orders</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-mute">
                    No orders yet. Place one from the storefront checkout.
                  </td>
                </tr>
              ) : (
                recent.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div>{order.shippingFullName}</div>
                      <div className="text-mute">{order.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 uppercase">
                      {order.paymentMethod ?? "—"} · {order.paymentStatus}
                    </td>
                    <td className="px-4 py-3">{formatInr(order.totalInPaise)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-panel p-5">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
        {value}
      </p>
    </div>
  );
}
