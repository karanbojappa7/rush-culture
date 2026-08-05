import { redirect } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { BrandControlPanel } from "@/components/core/brand/brand-control-panel";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

export default async function BrandPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "brand.manage")) {
    redirect("/");
  }

  return (
    <AdminShell
      title="Brand"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Brand" },
      ]}
    >
      <p className="mb-6 max-w-2xl text-sm text-mute">
        Super Admin controls for storefront brand identity and support contact.
        SKU prefix, cart key, and auth cookie remain deploy-time in site-config.
        Organization schema and social URLs stay under SEO.
      </p>
      <BrandControlPanel />
    </AdminShell>
  );
}
