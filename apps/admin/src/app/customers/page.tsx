import { AdminShell } from "@/components/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/data-table";
import { ListToolbar } from "@/components/list-toolbar";
import { PaginationNav } from "@/components/pagination-nav";
import { apiGet } from "@/lib/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/lib/pagination";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Customer = {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string | null;
  createdAt: string;
};

type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const { page = "1", q } = await searchParams;
  const [user, customersRes] = await Promise.all([
    getSessionUser(),
    apiGet<PageResult<Customer>>(
      `/api/customers${pageQuery({ page, limit: 20, q })}`,
    ),
  ]);
  const data = customersRes.data ?? emptyPage<Customer>();

  return (
    <AdminShell
      title="Customers"
      userLabel={sessionLabel(user)}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Customers" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="customers"
        placeholder="Search name, email, phone…"
      />
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "email", header: "Email" },
          { key: "phone", header: "Phone" },
          { key: "joined", header: "Joined" },
        ]}
        empty={q ? "No customers match your search." : "No customers yet."}
        isEmpty={data.items.length === 0}
      >
        {data.items.map((customer) => (
          <DataTableRow key={customer.id}>
            <DataTableCell className="font-medium">
              {customer.name ?? "—"}
            </DataTableCell>
            <DataTableCell>{customer.email}</DataTableCell>
            <DataTableCell mute>{customer.phoneNumber ?? "—"}</DataTableCell>
            <DataTableCell mute>
              {new Date(customer.createdAt).toLocaleDateString("en-IN")}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/customers"
        searchParams={{ q }}
      />
    </AdminShell>
  );
}
