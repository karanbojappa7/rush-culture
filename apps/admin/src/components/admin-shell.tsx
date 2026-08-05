"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brand } from "@linq/site-config";
import { apiPost } from "@/lib/api";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/customers", label: "Customers" },
  { href: "/queries", label: "Queries" },
];

export function AdminShell({
  children,
  title,
  userLabel,
}: {
  children: React.ReactNode;
  title: string;
  userLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await apiPost("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-line bg-ink text-white md:border-b-0 md:border-r md:border-line">
        <div className="px-5 py-6">
          <p className="font-display text-2xl font-extrabold tracking-tight">
            {brand.name}
          </p>
          <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-white/50">
            {brand.adminLabel}
          </p>
          {userLabel ? (
            <p className="mt-3 truncate text-xs text-white/65">{userLabel}</p>
          ) : null}
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:pb-8">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`cursor-pointer whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={logout}
            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-white/60 hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="px-5 py-8 md:px-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
