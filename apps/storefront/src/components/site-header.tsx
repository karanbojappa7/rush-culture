"use client";

import Link from "next/link";
import { brand } from "@linq/site-config";
import { useCart } from "@/components/cart-provider";

type NavLink = { href: string; label: string };

export function SiteHeader({ collectionLinks = [] }: { collectionLinks?: NavLink[] }) {
  const { count } = useCart();
  const links: NavLink[] = [
    { href: "/shop", label: "Shop" },
    ...collectionLinks.slice(0, 2),
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-8">
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer text-[13px] font-medium tracking-[0.08em] uppercase text-ink/80 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="font-display cursor-pointer text-lg font-extrabold tracking-tight text-ink md:absolute md:left-1/2 md:-translate-x-1/2 md:text-2xl"
        >
          {brand.name}
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/shop"
            className="cursor-pointer text-[13px] font-medium tracking-[0.08em] uppercase text-ink/80 transition-colors hover:text-ink md:hidden"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="cursor-pointer text-[13px] font-medium tracking-[0.08em] uppercase text-ink/80 transition-colors hover:text-ink"
          >
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
