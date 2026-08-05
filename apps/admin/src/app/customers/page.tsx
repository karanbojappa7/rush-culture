import { AdminShell } from "@/components/admin-shell";
import { PaginationNav } from "@/components/pagination-nav";
import { apiGet } from "@/lib/api-server";
import { emptyPage, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Customer = {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string | null;
  createdAt: string;
};

type Props = { searchParams: Promise<{ page?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const { page = "1" } = await searchParams;
  const [user, customersRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Customer>>(`/api/customers?page=${page}&limit=20`),
  ]);
  const data = customersRes.data ?? emptyPage<Customer>();

  return (
    <AdminShell title="Customers" userLabel={sessionLabel(user)}>
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-line last:border-0"
              >
                <td className="px-4 py-3 font-medium">
                  {customer.name ?? "—"}
                </td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3 text-mute">
                  {customer.phoneNumber ?? "—"}
                </td>
                <td className="px-4 py-3 text-mute">
                  {new Date(customer.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {data.items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-mute" colSpan={4}>
                  No customers yet.
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
        basePath="/customers"
      />
    </AdminShell>
  );
}
