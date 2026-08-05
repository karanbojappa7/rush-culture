import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { PaginationNav } from "@/components/pagination-nav";
import { apiGet } from "@/lib/api-server";
import { emptyPage, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

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
  searchParams: Promise<{ page?: string; status?: string }>;
};

export default async function QueriesPage({ searchParams }: Props) {
  const { page = "1", status } = await searchParams;
  const qs = new URLSearchParams({ page, limit: "20" });
  if (status) qs.set("status", status);

  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<CustomerQuery>>(`/api/customer-queries?${qs}`),
  ]);
  const data = res.data ?? emptyPage<CustomerQuery>();

  const filters = [
    { label: "All", value: undefined },
    { label: "Open", value: "OPEN" },
    { label: "In progress", value: "IN_PROGRESS" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "Closed", value: "CLOSED" },
  ];

  return (
    <AdminShell title="Customer queries" userLabel={sessionLabel(user)}>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = (status ?? undefined) === filter.value;
          const href = filter.value
            ? `/queries?status=${filter.value}`
            : "/queries";
          return (
            <Link
              key={filter.label}
              href={href}
              className={`cursor-pointer px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase ${
                active
                  ? "bg-ink text-white"
                  : "border border-line text-mute hover:text-ink"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {data.items.map((query) => (
              <tr key={query.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">
                  {query.subject}
                  {query.orderNumber ? (
                    <span className="mt-1 block text-xs text-mute">
                      Order {query.orderNumber}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div>{query.name}</div>
                  <div className="text-mute">{query.email}</div>
                </td>
                <td className="px-4 py-3 uppercase text-mute">{query.topic}</td>
                <td className="px-4 py-3 uppercase">
                  {query.status.replaceAll("_", " ")}
                </td>
                <td className="px-4 py-3 text-mute">
                  {new Date(query.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/queries/${query.id}`}
                    className="cursor-pointer text-xs tracking-[0.1em] uppercase hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-mute">
                  No queries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/queries"
        searchParams={{ status }}
      />
    </AdminShell>
  );
}
