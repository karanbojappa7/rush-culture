import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { QueryStatusForm } from "@/components/query-status-form";
import { apiGet } from "@/lib/api-server";
import { getSessionUser, sessionLabel } from "@/lib/session";

type CustomerQuery = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  subject: string;
  message: string;
  orderNumber: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

type Props = { params: Promise<{ id: string }> };

export default async function QueryDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, res] = await Promise.all([
    getSessionUser(),
    apiGet<CustomerQuery>(`/api/customer-queries/${id}`),
  ]);
  const query = res.data;
  if (!query) notFound();

  return (
    <AdminShell title="Query" userLabel={sessionLabel(user)}>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 border border-line bg-panel p-5 md:p-6">
          <div>
            <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
              {query.topic} · {query.status.replaceAll("_", " ")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
              {query.subject}
            </h2>
            <p className="mt-2 text-sm text-mute">
              {new Date(query.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
                Customer
              </p>
              <p className="mt-1 font-medium">{query.name}</p>
              <p className="text-mute">{query.email}</p>
              <p className="text-mute">{query.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
                Order
              </p>
              <p className="mt-1">{query.orderNumber ?? "—"}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[0.12em] uppercase text-mute">
              Message
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
              {query.message}
            </p>
          </div>
        </div>
        <QueryStatusForm
          id={query.id}
          status={query.status}
          adminNote={query.adminNote}
        />
      </div>
    </AdminShell>
  );
}
