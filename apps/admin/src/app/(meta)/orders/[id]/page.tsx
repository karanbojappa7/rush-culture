import { notFound } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { apiGet, formatInr } from "@/base/api-server";
import { getSessionUser, sessionLabel } from "@/base/session";

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
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  createdAt: string;
  items: Array<{
    productName: string;
    variantSku: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
  }>;
};

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<Order>(`/api/orders/${id}`),
  ]);
  if (!res.data) notFound();
  const order = res.data;

  return (
    <AdminShell
      title={order.orderNumber}
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      backHref="/orders"
      backLabel="Back to orders"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: order.orderNumber },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-panel p-5">
          <h2 className="font-display text-lg font-bold">Customer & shipping</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Name" value={order.shippingFullName} />
            <Row label="Email" value={order.customerEmail ?? "—"} />
            <Row label="Phone" value={order.shippingPhone} />
            <Row
              label="Address"
              value={`${order.shippingLine1}${order.shippingLine2 ? `, ${order.shippingLine2}` : ""}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}`}
            />
          </dl>
        </section>

        <section className="border border-line bg-panel p-5">
          <h2 className="font-display text-lg font-bold">Payment</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Method" value={(order.paymentMethod ?? "—").toUpperCase()} />
            <Row label="Details" value={order.paymentDetails || "—"} />
            <Row label="Status" value={order.paymentStatus} />
            <Row label="Order status" value={order.status} />
            <Row label="Subtotal" value={formatInr(order.subtotalInPaise)} />
            <Row label="Shipping" value={formatInr(order.shippingInPaise)} />
            <Row label="Total" value={formatInr(order.totalInPaise)} />
          </dl>
        </section>
      </div>

      <section className="mt-6 border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-mute">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Line</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  {item.productName}
                  <div className="text-mute">
                    {item.color} / {item.size}
                  </div>
                </td>
                <td className="px-4 py-3">{item.variantSku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatInr(item.lineTotalInPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-mute">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
