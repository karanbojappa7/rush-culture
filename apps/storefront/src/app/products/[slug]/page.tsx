import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductBuyBox } from "@/components/product-buy-box";
import { getProductBySlug, products } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="pt-20 md:pt-24">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 md:grid-cols-2 md:gap-14 md:px-8 md:py-16">
        <div className="space-y-3">
          {product.images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-[3/4] overflow-hidden bg-mist"
            >
              <Image
                src={src}
                alt={`${product.name} ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
        <div className="md:sticky md:top-28 md:self-start">
          <ProductBuyBox product={product} />
        </div>
      </div>
    </div>
  );
}
