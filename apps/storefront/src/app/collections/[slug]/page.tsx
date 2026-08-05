import { ShopCatalog } from "@/components/shop-catalog";
import { getCollectionBySlug } from "@/lib/catalog";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: collection.name,
    description: collection.tagline,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  return (
    <div className="pt-20 md:pt-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Collection
        </p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
          {collection.name}
        </h1>
        <p className="mt-3 max-w-lg text-mute">{collection.tagline}</p>
      </div>
      <ShopCatalog initialCollection={slug} title="Browse" />
    </div>
  );
}
