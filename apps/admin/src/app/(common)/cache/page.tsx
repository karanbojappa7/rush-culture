import { redirect } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { FlushCacheButton } from "@/components/common/cache/flush-cache-button";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { apiGet } from "@/base/api-server";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

type CacheService = {
  name: string;
  prefix?: string;
  cache?: boolean;
  ttl?: number;
  cachedActions?: string[];
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
  const services = (status?.services ?? []).filter(
    (service) => (service.cachedActions?.length ?? 0) > 0 || service.cache,
  );
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
        next cacheable GET. Writes clear the module (and linked modules) so the
        next read re-warms Redis. Requires permission{" "}
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
          tone={status?.enabled ? "ok" : "warn"}
        />
        <Meta label="Store" value={status?.type ?? "—"} tone="accent" />
        <Meta
          label="Default TTL"
          value={status ? `${status.defaultTtl}s` : "—"}
          tone="cool"
        />
        <Meta label="Key prefix" value={status?.prefix ?? "—"} tone="mute" />
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
          GET-only Redis entries per service. Flush one service after catalog or
          data changes if you need an immediate rebuild.
        </p>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "name", header: "Service" },
              { key: "actions", header: "Cached GETs" },
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
                  {service.prefix ? (
                    <span className="mt-0.5 block font-mono text-[10px] text-mute">
                      {service.prefix}
                    </span>
                  ) : null}
                </DataTableCell>
                <DataTableCell mute>
                  {(service.cachedActions ?? []).length > 0
                    ? service.cachedActions!.join(", ")
                    : "—"}
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

function Meta({
  label,
  value,
  tone = "accent",
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "accent" | "cool" | "mute";
}) {
  const chip =
    tone === "ok"
      ? "var(--accent)"
      : tone === "warn"
        ? "color-mix(in srgb, var(--mute) 55%, var(--accent))"
        : tone === "cool"
          ? "color-mix(in srgb, var(--ink) 40%, var(--accent))"
          : tone === "mute"
            ? "var(--mute)"
            : "var(--accent)";
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
        {label}
      </p>
      <p className="mt-1 inline-flex items-center gap-2 font-medium text-ink">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: chip }}
          aria-hidden
        />
        {value}
      </p>
    </div>
  );
}
