import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { fetchProductBySlug, fetchProducts } from "@/lib/catalog";
import { fetchSeoSettings, seoToPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await fetchProducts(100);
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, seo] = await Promise.all([
    fetchProductBySlug(slug),
    fetchSeoSettings(),
  ]);
  if (!product) return { title: "Product" };
  return seoToPageMetadata(seo, {
    title: product.name,
    description: product.description || seo.description,
    path: `/products/${slug}`,
    imageUrl: product.images[0] ?? null,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, seo] = await Promise.all([
    fetchProductBySlug(slug),
    fetchSeoSettings(),
  ]);
  if (!product) notFound();
  const description = product.description?.trim();

  return (
    <div className="pt-20 md:pt-24">
      <ProductJsonLd settings={seo} product={product} />
      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="relative z-20 min-w-0">
            <ProductImageGallery images={product.images} alt={product.name} />
          </div>
          <div className="relative z-10 flex min-w-0 flex-col gap-10 md:sticky md:top-28 md:self-start">
            <ProductBuyBox product={product} />
            <section className="border-t border-line pt-8">
              <h2 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                About this piece
              </h2>
              {description ? (
                <p className="mt-4 max-w-xl text-base leading-relaxed text-mute whitespace-pre-wrap">
                  {description}
                </p>
              ) : (
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-mute">
                  Details for this style are being updated. Check fit notes on
                  the size guide, or reach out if you need fabric or length
                  help before you order.
                </p>
              )}
            </section>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  );
}
