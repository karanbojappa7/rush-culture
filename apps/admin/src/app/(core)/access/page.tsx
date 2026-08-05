import Link from "next/link";
import { redirect } from "next/navigation";
import { AccessTabs } from "@/components/core/access/access-tabs";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { apiGet } from "@/base/api-server";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

type AccessDashboard = {
  roles: number;
  permissions: number;
  staffUsers: number;
  mappings: number;
  modules: Array<{ key: string; name: string }>;
};

export default async function AccessPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "access.dashboard")) {
    redirect("/");
  }

  const res = await apiGet<AccessDashboard>("/api/access/dashboard");
  const data = res.data;

  const cards = [
    {
      label: "Roles",
      value: data?.roles ?? "—",
      href: "/access/roles",
      hint: "System + custom",
    },
    {
      label: "Permissions",
      value: data?.permissions ?? "—",
      href: "/access/permissions",
      hint: "Matrix by role",
    },
    {
      label: "Staff users",
      value: data?.staffUsers ?? "—",
      href: "/access/users",
      hint: "SUPER_ADMIN / ADMIN / STAFF",
    },
    {
      label: "Mappings",
      value: data?.mappings ?? "—",
      href: "/access/permissions",
      hint: "Role ↔ permission rows",
    },
  ];

  return (
    <AdminShell
      title="Access control"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Access" },
      ]}
    >
      <AccessTabs />
      <p className="max-w-2xl text-sm text-mute">
        Super admins manage roles, the permission matrix, and staff assignment.
        Permission codes are defined in the API YAML catalog and synced on boot.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const tones = [
            "var(--accent)",
            "var(--ink)",
            "var(--mute)",
            "color-mix(in srgb, var(--mist) 25%, var(--ink))",
          ];
          const washes = [
            "color-mix(in srgb, var(--accent) 10%, var(--panel))",
            "color-mix(in srgb, var(--ink) 4%, var(--panel))",
            "color-mix(in srgb, var(--mute) 10%, var(--panel))",
            "color-mix(in srgb, var(--mist) 50%, var(--panel))",
          ];
          const tone = tones[index % tones.length];
          const wash = washes[index % washes.length];
          return (
            <Link
              key={card.label}
              href={card.href}
              className="relative overflow-hidden border border-line p-5 transition-colors hover:border-ink/30"
              style={{ background: wash }}
            >
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: tone }}
                aria-hidden
              />
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
                {card.label}
              </p>
              <p className="mt-2 font-display text-3xl font-extrabold">
                {card.value}
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-xs text-mute">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: tone }}
                  aria-hidden
                />
                {card.hint}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {hasPermission(user, "permissions.manage") ? (
          <Link
            href="/access/permissions"
            className="cursor-pointer bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white"
          >
            Permission matrix
          </Link>
        ) : null}
        {hasPermission(user, "roles.manage") ? (
          <Link
            href="/access/roles"
            className="cursor-pointer border border-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink"
          >
            Manage roles
          </Link>
        ) : null}
        {hasPermission(user, "users.manage") ? (
          <Link
            href="/access/users"
            className="cursor-pointer border border-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink"
          >
            Staff users
          </Link>
        ) : null}
      </div>
    </AdminShell>
  );
}
