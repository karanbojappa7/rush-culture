import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { ListToolbar } from "@/components/list-toolbar";
import { PaginationNav } from "@/components/pagination-nav";
import { apiGet, formatInr } from "@/lib/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

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

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { page = "1", q } = await searchParams;
  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Order>>(
      `/api/orders${pageQuery({ page, limit: 10, q })}`,
    ),
  ]);
  const data = res.data ?? emptyPage<Order>(10);

  return (
    <AdminShell
      title="Orders"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Orders" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="orders"
        placeholder="Search order #, customer, phone…"
      />
      <div className="space-y-4">
        {data.items.length === 0 ? (
          <p className="border border-line bg-panel px-4 py-12 text-center text-mute">
            {q ? "No orders match your search." : "No orders yet."}
          </p>
        ) : (
          data.items.map((order) => (
            <article
              key={order.id}
              className="border border-line bg-panel p-5 transition-colors hover:border-ink/25 md:p-6"
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
                  <p className="mt-1 font-medium uppercase">
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
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/orders"
        searchParams={{ q }}
      />
    </AdminShell>
  );
}
