"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brand } from "@linq/site-config";
import { apiPost } from "@/lib/api";
import { BackButton } from "@/components/layout/back-button";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { hasPermission } from "@/lib/session-shared";

const nav = [
  { href: "/", label: "Overview", permission: "overview.read" },
  { href: "/orders", label: "Orders", permission: "orders.read" },
  { href: "/products", label: "Products", permission: "products.manage" },
  { href: "/categories", label: "Categories", permission: "categories.manage" },
  { href: "/customers", label: "Customers", permission: "customers.read" },
  { href: "/queries", label: "Queries", permission: "queries.manage" },
  { href: "/reviews", label: "Reviews", permission: "reviews.manage" },
  { href: "/devices", label: "Devices", permission: "devices.read" },
  { href: "/theming", label: "Theming", permission: "theming.manage" },
  { href: "/seo", label: "SEO", permission: "seo.manage" },
  { href: "/access", label: "Access", permission: "access.dashboard" },
  { href: "/cache", label: "Cache", permission: "cache.flush" },
];

const SESSION_KEY = "admin-session-v1";

type StickySession = {
  roleCode: string;
  permissions: string[];
  userLabel?: string;
};

function readStoredSession(): StickySession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StickySession;
    if (!parsed?.roleCode) return null;
    return {
      roleCode: parsed.roleCode,
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      userLabel: parsed.userLabel,
    };
  } catch {
    return null;
  }
}

function writeStoredSession(session: StickySession) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
  }
}

function clearStoredSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
  }
}

function permissionsEqual(a: string[], b: string[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function sessionsEqual(a: StickySession, b: StickySession) {
  return (
    a.roleCode === b.roleCode &&
    a.userLabel === b.userLabel &&
    permissionsEqual(a.permissions, b.permissions)
  );
}

export function AdminShell({
  children,
  title,
  userLabel,
  roleCode,
  permissions = [],
  breadcrumbs,
  backHref,
  backLabel = "Back",
}: {
  children: React.ReactNode;
  title: string;
  userLabel?: string;
  roleCode?: string;
  permissions?: string[];
  breadcrumbs?: Crumb[];
  backHref?: string;
  backLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = Boolean(backHref) || (breadcrumbs?.length ?? 0) > 1;
  const permissionList = Array.isArray(permissions) ? permissions : [];
  const permissionsKey = permissionList.join("\0");

  const [session, setSession] = useState<StickySession>(() => {
    if (roleCode) {
      const next: StickySession = {
        roleCode,
        permissions: permissionList,
        userLabel,
      };
      writeStoredSession(next);
      return next;
    }
    return (
      readStoredSession() ?? {
        roleCode: "",
        permissions: [],
        userLabel,
      }
    );
  });

  useEffect(() => {
    if (roleCode) {
      const next: StickySession = {
        roleCode,
        permissions: permissionsKey ? permissionsKey.split("\0") : [],
        userLabel,
      };
      setSession((prev) => {
        if (sessionsEqual(prev, next)) return prev;
        writeStoredSession(next);
        return next;
      });
      return;
    }
    const stored = readStoredSession();
    if (!stored) return;
    setSession((prev) => (sessionsEqual(prev, stored) ? prev : stored));
  }, [roleCode, userLabel, permissionsKey]);

  const items = nav.filter((item) => hasPermission(session, item.permission));
  const label = session.userLabel || userLabel;

  async function logout() {
    clearStoredSession();
    await apiPost("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="admin-shell min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="flex flex-col border-b border-white/10 bg-[#101010] text-white md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:border-white/10">
        <div className="shrink-0 px-5 py-6">
          <Link href="/" className="block">
            <p className="font-display text-2xl font-extrabold tracking-tight">
              {brand.name}
            </p>
            <p className="mt-1 text-[11px] tracking-[0.16em] uppercase text-white/50">
              {brand.adminLabel}
            </p>
          </Link>
          {label ? (
            <p className="mt-3 truncate text-xs text-white/65">{label}</p>
          ) : null}
        </div>
        <nav className="flex min-h-0 flex-1 gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-y-auto md:pb-4">
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
        <div className="shrink-0 border-t border-white/10 px-3 py-4">
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
