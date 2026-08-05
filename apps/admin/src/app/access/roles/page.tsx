import Link from "next/link";
import { redirect } from "next/navigation";
import { AccessTabs } from "@/components/access/access-tabs";
import { AdminShell } from "@/components/layout/admin-shell";
import { CreateRoleForm } from "@/components/access/create-role-form";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/ui/data-table";
import { apiGet } from "@/lib/api-server";
import { emptyPage, type PageResult } from "@/lib/pagination";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/lib/session";

type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
};

export default async function AccessRolesPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "roles.manage")) {
    redirect("/access");
  }

  const canDelete = hasPermission(user, "roles.delete");
  const res = await apiGet<PageResult<Role>>("/api/roles?page=1&limit=100");
  const data = res.data ?? emptyPage<Role>();

  return (
    <AdminShell
      title="Roles"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Access", href: "/access" },
        { label: "Roles" },
      ]}
      backHref="/access"
    >
      <AccessTabs />
      {hasPermission(user, "roles.manage") ? (
        <div className="mb-8">
          <CreateRoleForm />
        </div>
      ) : null}

      <DataTable
        columns={[
          { key: "code", header: "Code" },
          { key: "name", header: "Name" },
          { key: "type", header: "Type" },
          ...(canDelete ? [{ key: "actions", header: "" }] : []),
        ]}
        empty="No roles found"
        isEmpty={data.items.length === 0}
      >
        {data.items.map((role) => (
          <DataTableRow key={role.id}>
            <DataTableCell>
              <span className="font-mono text-xs font-semibold">
                {role.code}
              </span>
            </DataTableCell>
            <DataTableCell>
              <div>
                <p className="font-medium">{role.name}</p>
                {role.description ? (
                  <p className="mt-0.5 text-xs text-mute">{role.description}</p>
                ) : null}
              </div>
            </DataTableCell>
            <DataTableCell>
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-mute">
                {role.isSystem ? "System" : "Custom"}
              </span>
            </DataTableCell>
            {canDelete ? (
              <DataTableCell align="right">
                <DeleteActionButton
                  href={`/api/roles/${role.id}`}
                  confirmLabel={`Delete role ${role.code}?`}
                  disabled={role.isSystem}
                  disabledHint="System roles cannot be deleted"
                />
              </DataTableCell>
            ) : null}
          </DataTableRow>
        ))}
      </DataTable>
      {hasPermission(user, "permissions.manage") ? (
        <p className="mt-4 text-sm text-mute">
          Assign capabilities on the{" "}
          <Link
            href="/access/permissions"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Permissions
          </Link>{" "}
          matrix.
        </p>
      ) : null}
    </AdminShell>
  );
}
