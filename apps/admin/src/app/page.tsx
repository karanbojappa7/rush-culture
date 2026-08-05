import Link from "next/link";
import { Suspense } from "react";
import { AdminShell } from "@/components/common/layout/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { DateRangeFilter } from "@/components/common/ui/date-range-filter";
import { OverviewCharts } from "@/components/meta/overview/overview-charts";
import { apiGet, formatInr } from "@/base/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

type Summary = {
  orders: number;
  pending: number;
  revenueInPaise: number;
  from?: string | null;
  to?: string | null;
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

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

function groupPaymentStatus(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const order of orders) {
    const key = order.paymentStatus || "UNKNOWN";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({
      label: label.replaceAll("_", " "),
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

function recentRevenueBars(orders: Order[]) {
  return [...orders]
    .reverse()
    .slice(-8)
    .map((order) => ({
      label: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      value: order.totalInPaise,
      display: formatInr(order.totalInPaise),
    }));
}

function rangeHint(from?: string, to?: string) {
  if (!from && !to) return "All time";
  if (from && to) return `${from} → ${to}`;
  if (from) return `From ${from}`;
  return `Until ${to}`;
}

export default async function AdminHomePage({ searchParams }: Props) {
  const { from, to } = await searchParams;
  const filterQs = pageQuery({ from, to });
  const ordersListQs = pageQuery({ page: 1, limit: 12, from, to });

  const [user, summaryRes, ordersRes, querySummaryRes, queriesRes] =
    await Promise.all([
      getSessionUser(),
      apiGet<Summary>(`/api/orders/summary${filterQs}`),
      apiGet<PageResult<Order>>(`/api/orders${ordersListQs}`),
      apiGet<QuerySummary>("/api/customer-queries/summary"),
      apiGet<PageResult<CustomerQuery>>(
        `/api/customer-queries${pageQuery({ page: 1, limit: 5, status: "OPEN", from, to })}`,
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
  const recent = ordersRes.data?.items ?? emptyPage<Order>(12).items;
  const openQueries =
    queriesRes.data?.items ?? emptyPage<CustomerQuery>(5).items;
  const revenueBars = recentRevenueBars(recent);
  const revenueMax = Math.max(...revenueBars.map((bar) => bar.value), 0);
  const activeQueries = querySummary.open + querySummary.inProgress;
  const period = rangeHint(from, to);
  const ordersHref = `/orders${filterQs}`;

  return (
    <AdminShell
      title="Overview"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[{ label: "Overview" }]}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
            Period
          </p>
          <p className="mt-1 text-sm text-mute">{period}</p>
        </div>
        <Suspense
          fallback={
            <div className="h-[58px] w-[280px] animate-pulse border border-line bg-panel" />
          }
        >
          <DateRangeFilter />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Orders"
          value={String(summary.orders)}
          hint={period}
          href={ordersHref}
          tone="accent"
        />
        <Stat
          label="Pending payment"
          value={String(summary.pending)}
          hint="Needs follow-up"
          href={ordersHref}
          tone="warm"
        />
        <Stat
          label="Revenue captured"
          value={formatInr(summary.revenueInPaise)}
          hint={period}
          tone="mint"
        />
        <Stat
          label="Active queries"
          value={String(activeQueries)}
          hint={`${querySummary.open} open`}
          href="/queries?status=OPEN"
          tone="cool"
        />
      </div>

      <div className="mt-8">
        <OverviewCharts
          querySlices={[
            {
              key: "open",
              label: "Open",
              value: querySummary.open,
              color: "var(--ink)",
            },
            {
              key: "inProgress",
              label: "In progress",
              value: querySummary.inProgress,
              color: "var(--mute)",
            },
            {
              key: "resolved",
              label: "Resolved",
              value: querySummary.resolved,
              color: "var(--accent)",
            },
            {
              key: "closed",
              label: "Closed",
              value: querySummary.closed,
              color: "color-mix(in srgb, var(--mist) 35%, var(--ink))",
            },
          ]}
          paymentBars={groupPaymentStatus(recent)}
          revenueBars={revenueBars}
          revenueMax={revenueMax}
          ordersTotal={summary.orders}
          pendingPayments={summary.pending}
        />
      </div>
      <div className="mt-10 grid gap-10 xl:grid-cols-2">
        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Open queries</h2>
              <p className="mt-1 text-sm text-mute">Needs attention first</p>
            </div>
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
        </div>

        <div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Recent orders</h2>
              <p className="mt-1 text-sm text-mute">Latest checkout activity</p>
            </div>
            <Link
              href={ordersHref}
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
              {recent.slice(0, 8).map((order) => (
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
  hint,
  href,
  tone = "accent",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "accent" | "warm" | "mint" | "cool";
}) {
  const toneStyle: Record<
    "accent" | "warm" | "mint" | "cool",
    { border: string; wash: string; chip: string }
  > = {
    accent: {
      border: "var(--accent)",
      wash: "color-mix(in srgb, var(--accent) 12%, var(--panel))",
      chip: "var(--accent)",
    },
    warm: {
      border: "var(--mute)",
      wash: "color-mix(in srgb, var(--mute) 10%, var(--panel))",
      chip: "var(--mute)",
    },
    mint: {
      border: "var(--ink)",
      wash: "color-mix(in srgb, var(--ink) 5%, var(--panel))",
      chip: "var(--ink)",
    },
    cool: {
      border: "color-mix(in srgb, var(--mist) 20%, var(--ink))",
      wash: "color-mix(in srgb, var(--mist) 45%, var(--panel))",
      chip: "color-mix(in srgb, var(--mist) 15%, var(--ink))",
    },
  };
  const colors = toneStyle[tone];

  const body = (
    <div
      className="relative overflow-hidden border border-line p-5 transition-colors hover:border-ink/25"
      style={{ background: colors.wash }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: colors.border }}
        aria-hidden
      />
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-mute">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-mute">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: colors.chip }}
            aria-hidden
          />
          {hint}
        </p>
      ) : null}
    </div>
  );
  if (!href) return body;
  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}
