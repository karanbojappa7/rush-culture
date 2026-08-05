import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api";

type OrderItem = {
  productName: string;
  size: string;
  color: string;
  quantity: number;
  lineTotalInPaise: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
  paymentStatus: string;
  status: string;
  totalInPaise: number;
  createdAt: string;
  items: OrderItem[];
};

export default async function OrdersPage() {
  const res = await apiGet<Order[]>("/api/orders");
  const orders = res.data ?? [];

  return (
    <AdminShell title="Orders">
      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-mute">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="border border-line bg-panel p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-display text-xl font-bold hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-1 text-sm text-mute">
                    {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
                    {order.status} · {order.paymentStatus}
                  </p>
                </div>
                <p className="font-semibold">{formatInr(order.totalInPaise)}</p>
              </div>

              <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
                    Customer
                  </p>
                  <p className="mt-1 font-medium">{order.shippingFullName}</p>
                  <p className="text-mute">{order.customerEmail}</p>
                  <p className="text-mute">{order.shippingPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
                    Ship to
                  </p>
                  <p className="mt-1">
                    {order.shippingLine1}
                    {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
                  </p>
                  <p>
                    {order.shippingCity}, {order.shippingState}{" "}
                    {order.shippingPostalCode}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
                    Payment captured
                  </p>
                  <p className="mt-1 uppercase font-medium">
                    {order.paymentMethod ?? "—"}
                  </p>
                  <p className="text-mute">{order.paymentDetails || "—"}</p>
                </div>
              </div>

              <ul className="mt-4 border-t border-line pt-4 text-sm">
                {order.items.map((item, i) => (
                  <li
                    key={`${order.id}-${i}`}
                    className="flex justify-between gap-3 py-1"
                  >
                    <span>
                      {item.productName} · {item.color}/{item.size} ×{" "}
                      {item.quantity}
                    </span>
                    <span>{formatInr(item.lineTotalInPaise)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </div>
    </AdminShell>
  );
}
