import Link from "next/link";
import { brand } from "@linq/site-config";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/customers", label: "Customers" },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
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
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:pb-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
