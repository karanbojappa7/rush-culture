import Link from "next/link";
import { brand } from "@linq/site-config";
import type { Collection } from "@/lib/catalog";

export function SiteFooter({ collections = [] }: { collections?: Collection[] }) {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-4xl font-extrabold tracking-tight">
            {brand.name}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/65">
            {brand.footerBlurb}
          </p>
        </div>
        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-paper/45">
            Shop
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:text-volt">
                All clothing
              </Link>
            </li>
            {collections.map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="hover:text-volt"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-paper/45">
            Help
          </p>
          <ul className="mt-4 space-y-2 text-sm text-paper/80">
            <li>Shipping</li>
            <li>Returns</li>
            <li>Size guide</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10 px-5 py-5 text-center text-xs tracking-[0.12em] uppercase text-paper/40 md:px-8">
        © {new Date().getFullYear()} {brand.legalName}
      </div>
    </footer>
  );
}
