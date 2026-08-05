import { redirect } from "next/navigation";
import { AccessTabs } from "@/components/core/access/access-tabs";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { AssignRoleForm } from "@/components/core/access/assign-role-form";
import { DeleteActionButton } from "@/components/common/ui/delete-action-button";
import { StaffUserForm } from "@/components/core/access/staff-user-form";
import {
  DataTable,
  DataTableCell,
  DataTableRow,
} from "@/components/common/ui/data-table";
import { apiGet } from "@/base/api-server";
import { emptyPage, type PageResult } from "@/base/pagination";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

type Role = {
  id: string;
  code: string;
  name: string;
};

type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role?: { code: string; name: string };
};

const STAFF_CODES = new Set(["SUPER_ADMIN", "ADMIN", "STAFF"]);

export default async function AccessUsersPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "users.manage")) {
    redirect("/access");
  }

  const canDelete = hasPermission(user, "users.delete");
  const [usersRes, rolesRes] = await Promise.all([
    apiGet<PageResult<StaffUser>>("/api/users?page=1&limit=100"),
    apiGet<PageResult<Role>>("/api/roles?page=1&limit=100"),
  ]);

  const allUsers = usersRes.data?.items ?? [];
  const staff = allUsers.filter((item) =>
    STAFF_CODES.has(item.role?.code ?? ""),
  );
  const assignable = (rolesRes.data ?? emptyPage<Role>()).items.filter(
    (role) => role.code !== "CUSTOMER",
  );

  return (
    <AdminShell
      title="Staff users"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Access", href: "/access" },
        { label: "Users" },
      ]}
      backHref="/access"
    >
      <AccessTabs />
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
          Add staff
        </p>
        <StaffUserForm roles={assignable} />
      </div>

      <DataTable
        columns={[
          { key: "user", header: "User" },
          { key: "role", header: "Role" },
          { key: "assign", header: "Assign" },
          ...(canDelete ? [{ key: "actions", header: "" }] : []),
        ]}
        empty="No staff users"
        isEmpty={staff.length === 0}
      >
        {staff.map((row) => {
          const isSelf = row.id === user?.id;
          return (
            <DataTableRow key={row.id}>
              <DataTableCell>
                <div>
                  <p className="font-medium">{row.name || "—"}</p>
                  <p className="mt-0.5 text-xs text-mute">{row.email}</p>
                </div>
              </DataTableCell>
              <DataTableCell>
                <span className="font-mono text-xs font-semibold">
                  {row.role?.code ?? "—"}
                </span>
              </DataTableCell>
              <DataTableCell>
                <AssignRoleForm
                  userId={row.id}
                  roleCode={row.role?.code ?? "STAFF"}
                  roles={assignable}
                />
              </DataTableCell>
              {canDelete ? (
                <DataTableCell align="right">
                  <DeleteActionButton
                    href={`/api/users/${row.id}`}
                    confirmLabel={`Delete user ${row.email}?`}
                    disabled={isSelf}
                    disabledHint="You cannot delete your own account"
                  />
                </DataTableCell>
              ) : null}
            </DataTableRow>
          );
        })}
      </DataTable>
    </AdminShell>
  );
}
