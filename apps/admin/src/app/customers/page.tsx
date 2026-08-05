import { AdminShell } from "@/components/admin-shell";
import { apiGet } from "@/lib/api-server";
import { getSessionUser, sessionLabel } from "@/lib/session";

type Customer = {
  id: string;
  email: string;
  phoneNumber: string | null;
  name: string | null;
  createdAt: string;
};

export default async function CustomersPage() {
  const [user, customersRes] = await Promise.all([
    getSessionUser(),
    apiGet<Customer[]>("/api/customers"),
  ]);
  const customers = customersRes.data ?? [];

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
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-line last:border-0">
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
            {customers.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-mute" colSpan={4}>
                  No customers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
