import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { apiGet, formatInr } from "@/lib/api-server";
import { emptyPage, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Summary = {
  orders: number;
  pending: number;
  revenueInPaise: number;
};

type QuerySummary = {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
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

type CustomerQuery = {
  id: string;
  name: string;
  email: string;
  topic: string;
  subject: string;
  status: string;
  createdAt: string;
};

export default async function AdminHomePage() {
  const [user, summaryRes, ordersRes, querySummaryRes, queriesRes] =
    await Promise.all([
      getSessionUser(),
      apiGet<Summary>("/api/orders/summary"),
      apiGet<PageResult<Order>>("/api/orders?page=1&limit=8"),
      apiGet<QuerySummary>("/api/customer-queries/summary"),
      apiGet<PageResult<CustomerQuery>>(
        "/api/customer-queries?page=1&limit=5&status=OPEN",
      ),
    ]);

  const summary = summaryRes.data ?? {
    orders: 0,
    pending: 0,
    revenueInPaise: 0,
  };
  const querySummary = querySummaryRes.data ?? {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    total: 0,
  };
  const recent = ordersRes.data?.items ?? emptyPage<Order>(8).items;
  const openQueries =
    queriesRes.data?.items ?? emptyPage<CustomerQuery>(5).items;

  return (
    <AdminShell title="Overview" userLabel={sessionLabel(user)}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders" value={String(summary.orders)} />
        <Stat label="Pending payment" value={String(summary.pending)} />
        <Stat
          label="Revenue captured"
          value={formatInr(summary.revenueInPaise)}
        />
        <Stat
          label="Open queries"
          value={String(querySummary.open + querySummary.inProgress)}
          href="/queries?status=OPEN"
        />
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-2">
        <div>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Open queries</h2>
            <Link
              href="/queries"
              className="text-[12px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto border border-line bg-panel">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                </tr>
              </thead>
              <tbody>
                {openQueries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-mute">
                      No open customer queries.
                    </td>
                  </tr>
                ) : (
                  openQueries.map((query) => (
                    <tr
                      key={query.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/queries/${query.id}`}
                          className="hover:underline"
                        >
                          {query.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>{query.name}</div>
                        <div className="text-mute">{query.email}</div>
                      </td>
                      <td className="px-4 py-3 uppercase text-mute">
                        {query.topic}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-mute">
            {querySummary.open} open · {querySummary.inProgress} in progress ·{" "}
            {querySummary.resolved} resolved
          </p>
        </div>

        <div>
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
                    <tr
                      key={order.id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div>{order.shippingFullName}</div>
                        <div className="text-mute">{order.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 uppercase">
                        {order.paymentMethod ?? "—"} · {order.paymentStatus}
                      </td>
                      <td className="px-4 py-3">
                        {formatInr(order.totalInPaise)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="border border-line bg-panel p-5">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
        {value}
      </p>
    </div>
  );
  if (!href) return body;
  return (
    <Link href={href} className="block transition-opacity hover:opacity-90">
      {body}
    </Link>
  );
}
