import Link from "next/link";
import { AdminShell } from "@/components/common/layout/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { ListToolbar } from "@/components/common/ui/list-toolbar";
import { PaginationNav } from "@/components/common/ui/pagination-nav";
import { apiGet } from "@/base/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/base/pagination";
import { getSessionUser, sessionLabel } from "@/base/session";

type CustomerQuery = {
  id: string;
  name: string;
  email: string;
  topic: string;
  subject: string;
  status: string;
  orderNumber: string | null;
  createdAt: string;
};

type Props = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function QueriesPage({ searchParams }: Props) {
  const { page = "1", status, q, from, to } = await searchParams;
  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<CustomerQuery>>(
      `/api/customer-queries${pageQuery({ page, limit: 20, status, q, from, to })}`,
    ),
  ]);
  const data = res.data ?? emptyPage<CustomerQuery>();
  const hasFilters = Boolean(q || status || from || to);

  const filters = [
    { label: "All", value: undefined },
    { label: "Open", value: "OPEN" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Closed", value: "CLOSED" },
  ];

  return (
    <AdminShell
      title="Customer queries"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Queries" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="queries"
        placeholder="Search subject, customer, order…"
        filters={
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => {
              const active = (status ?? undefined) === filter.value;
              const href = pageQuery({
                status: filter.value,
                q,
                from,
                to,
              });
              return (
                <Link
                  key={filter.label}
                  href={`/queries${href}`}
                  className={`cursor-pointer px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
                    active
                      ? "bg-ink text-white"
                      : "border border-line text-mute hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        }
      />

      <DataTable
        columns={[
          { key: "subject", header: "Subject" },
          { key: "customer", header: "Customer" },
          { key: "topic", header: "Topic" },
          { key: "status", header: "Status" },
          { key: "when", header: "When" },
          { key: "actions", header: "" },
        ]}
        empty={
          hasFilters ? "No queries match your filters." : "No queries yet."
        }
        isEmpty={data.items.length === 0}
      >
        {data.items.map((query) => (
          <DataTableRow key={query.id}>
            <DataTableCell className="font-medium">
              {query.subject}
              {query.orderNumber ? (
                <span className="mt-1 block text-xs text-mute">
                  Order {query.orderNumber}
                </span>
              ) : null}
            </DataTableCell>
            <DataTableCell>
              <div>{query.name}</div>
              <div className="text-mute">{query.email}</div>
            </DataTableCell>
            <DataTableCell className="uppercase" mute>
              {query.topic}
            </DataTableCell>
            <DataTableCell className="uppercase">
              {query.status.replaceAll("_", " ")}
            </DataTableCell>
            <DataTableCell mute>
              {new Date(query.createdAt).toLocaleString("en-IN")}
            </DataTableCell>
            <DataTableCell align="right">
              <Link
                href={`/queries/${query.id}`}
                className="cursor-pointer text-xs tracking-[0.1em] uppercase hover:underline"
              >
                Open
              </Link>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/queries"
        searchParams={{ status, q, from, to }}
      />
    </AdminShell>
  );
}
