import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { ThemingControlPanel } from "@/components/theme/theming-control-panel";
import {
  getSessionUser,
  hasPermission,
  sessionLabel,
} from "@/lib/session";

export default async function ThemingPage() {
  const user = await getSessionUser();
  if (!hasPermission(user, "theming.manage")) {
    redirect("/");
  }

  return (
    <AdminShell
      title="Theming"
      userLabel={sessionLabel(user)}
      roleCode={user?.roleCode}
      permissions={user?.permissions}
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Theming" },
      ]}
    >
      <p className="mb-6 max-w-2xl text-sm text-mute">
        Super Admin controls for presets, custom colors, day/night mode, and
        base font size. Toggle between Storefront and Admin — each has its own
        palette.
      </p>
      <ThemingControlPanel />
    </AdminShell>
  );
}
