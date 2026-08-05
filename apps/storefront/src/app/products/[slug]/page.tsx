import { notFound } from "next/navigation";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { fetchProductBySlug, fetchProducts } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await fetchProducts(100);
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="pt-20 md:pt-24">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-10 md:grid-cols-2 md:gap-14 md:px-8 md:py-16">
        <div className="relative z-20 min-w-0">
          <ProductImageGallery images={product.images} alt={product.name} />
        </div>
        <div className="relative z-10 md:sticky md:top-28 md:self-start">
          <ProductBuyBox product={product} />
        </div>
      </div>
    </div>
  );
}
