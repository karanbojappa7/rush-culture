import { redirect } from "next/navigation";
import { AccessTabs } from "@/components/core/access/access-tabs";
import { AdminShell } from "@/components/common/layout/admin-shell";
import {
  PermissionsMatrix,
  type PermissionMatrixData,
} from "@/components/core/access/permissions-matrix";
import { apiGet } from "@/base/api-server";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

export default async function AccessPermissionsPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "permissions.manage")) {
    redirect("/access");
  }

  const res = await apiGet<PermissionMatrixData>("/api/access/matrix");
  const matrix = res.data;

  return (
    <AdminShell
      title="Permissions"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Access", href: "/access" },
        { label: "Permissions" },
      ]}
      backHref="/access"
    >
      <AccessTabs />
      {matrix ? (
        <PermissionsMatrix initial={matrix} />
      ) : (
        <p className="text-sm text-mute">
          {res.message || "Could not load permission matrix."}
        </p>
      )}
    </AdminShell>
  );
}
