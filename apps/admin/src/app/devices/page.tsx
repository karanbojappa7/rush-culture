import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { apiGet } from "@/lib/api-server";
import { emptyPage, pageQuery, type PageResult } from "@/lib/pagination";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/lib/session";

type ClientDevice = {
  id: string;
  fingerprint: string;
  ip: string;
  userAgent: string;
  deviceType: string;
  os: string | null;
  browser: string | null;
  path: string | null;
  method: string | null;
  hitCount: number;
  blockedCount: number;
  lastSeenAt: string;
  createdAt: string;
};

type Props = {
  searchParams: Promise<{ page?: string; q?: string; deviceType?: string }>;
};

export default async function DevicesAdminPage({ searchParams }: Props) {
  const { page = "1", q, deviceType } = await searchParams;
  const user = await getSessionUser();
  if (!hasPermission(user, "devices.read")) {
    redirect("/");
  }

  const res = await apiGet<PageResult<ClientDevice>>(
    `/api/client-devices${pageQuery({ page, limit: 20, q, deviceType })}`,
  );
  const data = res.data ?? emptyPage<ClientDevice>();

  const filters = [
    { label: "All", value: undefined },
    { label: "Desktop", value: "DESKTOP" },
    { label: "Mobile", value: "MOBILE" },
    { label: "Tablet", value: "TABLET" },
    { label: "Bot", value: "BOT" },
  ];

  return (
    <AdminShell
      title="Devices"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Devices" },
      ]}
    >
      <ListToolbar
        total={data.total}
        noun="devices"
        placeholder="Search IP, browser, path…"
        filters={
          <div className="flex flex-wrap gap-1.5">
            {filters.map((filter) => {
              const active = (deviceType ?? undefined) === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={`/devices${pageQuery({
                    deviceType: filter.value,
                    q,
                  })}`}
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
          { key: "device", header: "Device" },
          { key: "ip", header: "IP" },
          { key: "client", header: "Client" },
          { key: "activity", header: "Last activity" },
          { key: "hits", header: "Hits" },
          { key: "blocked", header: "Blocked" },
        ]}
        empty={
          q || deviceType
            ? "No devices match your filters."
            : "No device traffic logged yet."
        }
        isEmpty={data.items.length === 0}
      >
        {data.items.map((device) => (
          <DataTableRow key={device.id}>
            <DataTableCell>
              <div className="font-medium uppercase">{device.deviceType}</div>
              <div className="text-xs text-mute">
                {[device.os, device.browser].filter(Boolean).join(" · ") || "—"}
              </div>
            </DataTableCell>
            <DataTableCell className="font-mono text-xs">
              {device.ip}
            </DataTableCell>
            <DataTableCell className="max-w-sm">
              <div className="line-clamp-2 text-xs text-mute">
                {device.userAgent}
              </div>
            </DataTableCell>
            <DataTableCell>
              <div className="text-sm">
                {device.method || "—"} {device.path || ""}
              </div>
              <div className="text-xs text-mute">
                {new Date(device.lastSeenAt).toLocaleString("en-IN")}
              </div>
            </DataTableCell>
            <DataTableCell className="tabular-nums">
              {device.hitCount}
            </DataTableCell>
            <DataTableCell className="tabular-nums">
              {device.blockedCount > 0 ? (
                <span className="font-medium text-ink">
                  {device.blockedCount}
                </span>
              ) : (
                <span className="text-mute">0</span>
              )}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
      <PaginationNav
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
        basePath="/devices"
        searchParams={{ q, deviceType }}
      />
    </AdminShell>
  );
}
