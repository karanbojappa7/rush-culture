import { redirect } from "next/navigation";
import { AdminShell } from "@/components/common/layout/admin-shell";
import { SeoControlPanel } from "@/components/core/seo/seo-control-panel";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/base/session";

export default async function SeoPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "seo.manage")) {
    redirect("/");
  }

  return (
    <AdminShell
      title="SEO"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "SEO" },
      ]}
    >
      <p className="mb-6 max-w-2xl text-sm text-mute">
        Super Admin controls for storefront SEO: titles, robots/sitemap, Open
        Graph, Twitter, verification, icons, Organization / WebSite / Product
        structured data.
      </p>
      <SeoControlPanel />
    </AdminShell>
  );
}
