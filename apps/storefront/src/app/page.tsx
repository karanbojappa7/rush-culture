import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { fetchCollections, fetchProducts } from "@/lib/catalog";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  return seoToPageMetadata(seo, {
    title: seo.homeTitle || undefined,
    description: seo.homeDescription || seo.description,
    path: "/",
  });
}

export default async function HomePage() {
  const [collections, products] = await Promise.all([
    fetchCollections(),
    fetchProducts(4),
  ]);

  return (
    <>
      <Hero firstCollectionSlug={collections[0]?.slug} />

      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Collections
            </h2>
            <p className="hidden max-w-xs text-right text-sm text-mute md:block">
              Pick a lane and go.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {collections.map((collection, index) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group relative block min-h-[280px] cursor-pointer overflow-hidden md:min-h-[380px]"
              >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  priority={index === 0}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-3xl font-extrabold text-paper">
                    {collection.name}
                  </p>
                  <p className="mt-1 text-sm text-paper/75">
                    {collection.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductGrid
        products={products}
        title="Fresh in"
        subtitle="Pieces shipping now — sizes move quick."
      />
    </>
  );
}
