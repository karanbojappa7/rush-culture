"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/access", label: "Overview", exact: true },
  { href: "/access/permissions", label: "Permissions" },
  { href: "/access/roles", label: "Roles" },
  { href: "/access/users", label: "Users" },
];

export function AccessTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-line">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
              active
                ? "border-ink text-ink"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
