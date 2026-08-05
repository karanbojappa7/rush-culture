import { redirect } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { PoliciesControlPanel } from "@/components/core/policies/policies-control-panel";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

export default async function PoliciesPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "policies.manage")) {
    redirect("/");
  }

  return (
    <AdminShell
      title="Policies"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Policies" },
      ]}
    >
      <p className="mb-6 max-w-2xl text-sm text-mute">
        Super Admin CMS for storefront shipping, returns, size guide, and
        contact form topics.
      </p>
      <PoliciesControlPanel />
    </AdminShell>
  );
}
