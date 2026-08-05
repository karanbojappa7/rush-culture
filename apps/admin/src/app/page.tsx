import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/data-table";
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
        <Stat label="Orders" value={String(summary.orders)} href="/orders" />
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
              className="text-[12px] font-semibold tracking-[0.1em] uppercase text-mute transition-colors hover:text-ink"
            >
              View all
            </Link>
          </div>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: "subject", header: "Subject" },
                { key: "customer", header: "Customer" },
                { key: "topic", header: "Topic" },
              ]}
              empty="No open customer queries."
              isEmpty={openQueries.length === 0}
            >
              {openQueries.map((query) => (
                <DataTableRow key={query.id}>
                  <DataTableCell className="font-medium">
                    <Link
                      href={`/queries/${query.id}`}
                      className="hover:underline"
                    >
                      {query.subject}
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <div>{query.name}</div>
                    <div className="text-mute">{query.email}</div>
                  </DataTableCell>
                  <DataTableCell className="uppercase" mute>
                    {query.topic}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </div>
          <p className="mt-3 text-sm text-mute">
            {querySummary.open} open · {querySummary.inProgress} in progress ·{" "}
            {querySummary.resolved} resolved
          </p>
        </div>

        <div>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl font-bold">Recent orders</h2>
            <Link
              href="/orders"
              className="text-[12px] font-semibold tracking-[0.1em] uppercase text-mute transition-colors hover:text-ink"
            >
              View all
            </Link>
          </div>
          <div className="mt-4">
            <DataTable
              columns={[
                { key: "order", header: "Order" },
                { key: "customer", header: "Customer" },
                { key: "payment", header: "Payment" },
                { key: "total", header: "Total" },
              ]}
              empty="No orders yet."
              isEmpty={recent.length === 0}
            >
              {recent.map((order) => (
                <DataTableRow key={order.id}>
                  <DataTableCell className="font-medium">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </DataTableCell>
                  <DataTableCell>
                    <div>{order.shippingFullName}</div>
                    <div className="text-mute">{order.customerEmail}</div>
                  </DataTableCell>
                  <DataTableCell className="uppercase">
                    {order.paymentMethod ?? "—"} · {order.paymentStatus}
                  </DataTableCell>
                  <DataTableCell>
                    {formatInr(order.totalInPaise)}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
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
    <div className="border border-line bg-panel p-5 transition-colors hover:border-ink/20">
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
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
