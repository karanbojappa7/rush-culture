import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { FlushCacheButton } from "@/components/cache/flush-cache-button";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { apiGet } from "@/lib/api-server";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/lib/session";

type CacheService = {
  name: string;
  cache?: boolean;
  ttl?: number;
};

type CacheStatus = {
  enabled: boolean;
  type: string;
  defaultTtl: number;
  prefix: string;
  services: CacheService[];
};

export default async function CacheAdminPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "cache.flush")) {
    redirect("/");
  }

  const res = await apiGet<CacheStatus>("/api/cache");
  const status = res.data;
  const services = status?.services ?? [];
  const cacheOff = status?.enabled === false;

  return (
    <AdminShell
      title="Cache"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Cache" },
      ]}
    >
      <p className="max-w-2xl text-sm text-mute">
        Flush API response cache (Redis when enabled). Keys are rebuilt on the
        next cacheable request. Requires permission{" "}
        <span className="font-mono text-ink">cache.flush</span>.
      </p>

      <div className="mt-8 grid gap-4 border border-line bg-panel p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Meta
          label="Caching"
          value={
            status
              ? status.enabled
                ? "Enabled"
                : "Disabled"
              : res.message || "Unavailable"
          }
        />
        <Meta label="Store" value={status?.type ?? "—"} />
        <Meta
          label="Default TTL"
          value={status ? `${status.defaultTtl}s` : "—"}
        />
        <Meta label="Key prefix" value={status?.prefix ?? "—"} />
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border border-line bg-panel p-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
            Full clear
          </p>
          <p className="mt-1 max-w-md text-sm text-mute">
            Removes all keys under the API cache prefix.
          </p>
        </div>
        <FlushCacheButton disabled={cacheOff} />
      </div>

      {cacheOff ? (
        <p className="mt-4 text-sm text-mute">
          Caching is off (`ENABLE_CACHING=false`). Flush is unavailable until
          caching is enabled.
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Module caches
        </h2>
        <p className="mt-1 text-sm text-mute">
          Flush one service (e.g. product, category) when listed by the config
          loader.
        </p>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "name", header: "Service" },
              { key: "cache", header: "Cache" },
              { key: "ttl", header: "TTL" },
              { key: "action", header: "" },
            ]}
            empty="No module services registered."
            isEmpty={services.length === 0}
          >
            {services.map((service) => (
              <DataTableRow key={service.name}>
                <DataTableCell>
                  <span className="font-mono text-xs font-semibold">
                    {service.name}
                  </span>
                </DataTableCell>
                <DataTableCell mute>
                  {service.cache === false ? "off" : "on"}
                </DataTableCell>
                <DataTableCell mute>
                  {service.ttl != null ? `${service.ttl}s` : "default"}
                </DataTableCell>
                <DataTableCell align="right">
                  <FlushCacheButton
                    service={service.name}
                    disabled={cacheOff}
                    compact
                  />
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </div>
      </section>
    </AdminShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
        {label}
      </p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}
