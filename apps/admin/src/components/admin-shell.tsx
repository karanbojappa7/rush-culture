"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brand } from "@linq/site-config";
import { apiPost } from "@/lib/api";
import { BackButton } from "@/components/back-button";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/customers", label: "Customers" },
  { href: "/queries", label: "Queries" },
  { href: "/reviews", label: "Reviews" },
  { href: "/devices", label: "Devices", adminOnly: true },
];

export function AdminShell({
  children,
  title,
  userLabel,
  roleCode,
  breadcrumbs,
  backHref,
  backLabel = "Back",
}: {
  children: React.ReactNode;
  title: string;
  userLabel?: string;
  roleCode?: string;
  breadcrumbs?: Crumb[];
  backHref?: string;
  backLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = Boolean(backHref) || (breadcrumbs?.length ?? 0) > 1;
  const items = nav.filter(
    (item) => !item.adminOnly || roleCode === "ADMIN",
  );

  async function logout() {
    await apiPost("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="admin-shell min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="relative border-b border-white/10 bg-ink text-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:border-white/10">
        <div className="px-5 py-6">
          <Link href="/" className="block">
            <p className="font-display text-2xl font-extrabold tracking-tight">
              {brand.name}
            </p>
            <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-white/50">
              {brand.adminLabel}
            </p>
          </Link>
          {userLabel ? (
            <p className="mt-3 truncate text-xs text-white/65">{userLabel}</p>
          ) : null}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:pb-8">
          {items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative cursor-pointer whitespace-nowrap px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-white/12 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:bg-accent md:before:block"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-6 md:absolute md:inset-x-0 md:bottom-0">
          <button
            type="button"
            onClick={logout}
            className="w-full cursor-pointer px-3 py-2.5 text-left text-sm text-white/55 transition-colors hover:bg-white/8 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="admin-main px-5 py-8 md:px-10 md:py-10">
        <header className="border-b border-line pb-6">
          {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
          {showBack ? (
            <div className="mb-3">
              <BackButton
                href={backHref ?? breadcrumbs?.[breadcrumbs.length - 2]?.href}
                label={backLabel}
              />
            </div>
          ) : null}
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
          </h1>
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
