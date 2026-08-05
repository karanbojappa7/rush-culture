import { brand, sku } from "./brand";

export type ProductVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  priceInPaise: number;
  compareAtPriceInPaise?: number;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  collection: string;
  images: string[];
  variants: ProductVariant[];
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export const collections: Collection[] = [
  {
    slug: "streetwear",
    name: "Streetwear",
    tagline: "Oversized cuts. Loud graphics.",
    image:
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "essentials",
    name: "Essentials",
    tagline: "Daily layers that hold up.",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "drops",
    name: "Drops",
    tagline: "Limited runs. No restocks.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Oversized Graphic Tee",
    slug: "oversized-graphic-tee",
    description:
      "Heavyweight cotton with a boxy drape. Front print hits hard without cracking after washes.",
    brand: brand.name,
    collection: "streetwear",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v1",
        sku: sku("TEE-BLK-M"),
        size: "M",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 149900,
        compareAtPriceInPaise: 189900,
        stock: 12,
      },
      {
        id: "v2",
        sku: sku("TEE-BLK-L"),
        size: "L",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 149900,
        compareAtPriceInPaise: 189900,
        stock: 8,
      },
      {
        id: "v3",
        sku: sku("TEE-WHT-M"),
        size: "M",
        color: "Bone",
        colorHex: "#E8E2D9",
        priceInPaise: 149900,
        stock: 5,
      },
      {
        id: "v4",
        sku: sku("TEE-WHT-L"),
        size: "L",
        color: "Bone",
        colorHex: "#E8E2D9",
        priceInPaise: 149900,
        stock: 0,
      },
    ],
  },
  {
    id: "p2",
    name: "Utility Cargo Pants",
    slug: "utility-cargo-pants",
    description:
      "Relaxed straight fit with taped seams and six pockets. Built for all-day wear.",
    brand: brand.name,
    collection: "essentials",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v5",
        sku: sku("CRG-OLV-30"),
        size: "30",
        color: "Olive",
        colorHex: "#556B2F",
        priceInPaise: 249900,
        stock: 10,
      },
      {
        id: "v6",
        sku: sku("CRG-OLV-32"),
        size: "32",
        color: "Olive",
        colorHex: "#556B2F",
        priceInPaise: 249900,
        stock: 14,
      },
      {
        id: "v7",
        sku: sku("CRG-BLK-32"),
        size: "32",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 249900,
        stock: 6,
      },
    ],
  },
  {
    id: "p3",
    name: "Cropped Hoodie",
    slug: "cropped-hoodie",
    description:
      "Brushed fleece, cropped length, raw hem. Pair with cargos or bike shorts.",
    brand: brand.name,
    collection: "drops",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v8",
        sku: sku("HDY-ASH-S"),
        size: "S",
        color: "Ash",
        colorHex: "#9A9A9A",
        priceInPaise: 279900,
        stock: 4,
      },
      {
        id: "v9",
        sku: sku("HDY-ASH-M"),
        size: "M",
        color: "Ash",
        colorHex: "#9A9A9A",
        priceInPaise: 279900,
        stock: 9,
      },
      {
        id: "v10",
        sku: sku("HDY-LME-M"),
        size: "M",
        color: "Volt",
        colorHex: "#C8F542",
        priceInPaise: 279900,
        stock: 3,
      },
    ],
  },
  {
    id: "p4",
    name: "Washed Denim Jacket",
    slug: "washed-denim-jacket",
    description:
      "Mid-wash denim with a soft break-in. Metal buttons, clean collar.",
    brand: brand.name,
    collection: "essentials",
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v11",
        sku: sku("DNM-BLU-M"),
        size: "M",
        color: "Wash",
        colorHex: "#4A6FA5",
        priceInPaise: 399900,
        stock: 7,
      },
      {
        id: "v12",
        sku: sku("DNM-BLU-L"),
        size: "L",
        color: "Wash",
        colorHex: "#4A6FA5",
        priceInPaise: 399900,
        stock: 11,
      },
    ],
  },
  {
    id: "p5",
    name: "Mesh Running Shorts",
    slug: "mesh-running-shorts",
    description:
      "Lightweight mesh with an inner brief. Reflective tape on the side seam.",
    brand: brand.name,
    collection: "streetwear",
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v13",
        sku: sku("SHT-BLK-M"),
        size: "M",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 129900,
        stock: 20,
      },
      {
        id: "v14",
        sku: sku("SHT-BLK-L"),
        size: "L",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 129900,
        stock: 15,
      },
    ],
  },
  {
    id: "p6",
    name: "Boxy Knit Polo",
    slug: "boxy-knit-polo",
    description:
      "Open-knit cotton polo with a short boxy cut. Soft collar, no fuss.",
    brand: brand.name,
    collection: "drops",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v15",
        sku: sku("PLO-NVY-M"),
        size: "M",
        color: "Navy",
        colorHex: "#1B2A4A",
        priceInPaise: 219900,
        stock: 6,
      },
      {
        id: "v16",
        sku: sku("PLO-NVY-L"),
        size: "L",
        color: "Navy",
        colorHex: "#1B2A4A",
        priceInPaise: 219900,
        stock: 8,
      },
    ],
  },
  {
    id: "p7",
    name: "Relaxed Cord Shirt",
    slug: "relaxed-cord-shirt",
    description:
      "Soft corduroy overshirt with a roomy fit. Works open over tees or buttoned solo.",
    brand: brand.name,
    collection: "essentials",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v17",
        sku: sku("CRD-BRN-M"),
        size: "M",
        color: "Cocoa",
        colorHex: "#6B4423",
        priceInPaise: 289900,
        stock: 9,
      },
      {
        id: "v18",
        sku: sku("CRD-BRN-L"),
        size: "L",
        color: "Cocoa",
        colorHex: "#6B4423",
        priceInPaise: 289900,
        stock: 7,
      },
    ],
  },
  {
    id: "p8",
    name: "Wide Leg Trousers",
    slug: "wide-leg-trousers",
    description:
      "High-rise wide legs in a matte weave. Belt loops, clean front, deep pockets.",
    brand: brand.name,
    collection: "streetwear",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v19",
        sku: sku("TRW-CHR-28"),
        size: "28",
        color: "Charcoal",
        colorHex: "#36454F",
        priceInPaise: 269900,
        stock: 5,
      },
      {
        id: "v20",
        sku: sku("TRW-CHR-30"),
        size: "30",
        color: "Charcoal",
        colorHex: "#36454F",
        priceInPaise: 269900,
        stock: 12,
      },
      {
        id: "v21",
        sku: sku("TRW-CHR-32"),
        size: "32",
        color: "Charcoal",
        colorHex: "#36454F",
        priceInPaise: 269900,
        stock: 8,
      },
    ],
  },
  {
    id: "p9",
    name: "Ribbed Tank",
    slug: "ribbed-tank",
    description:
      "Stretch rib tank with a squared neck. Layer it or wear it alone in heat.",
    brand: brand.name,
    collection: "drops",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v22",
        sku: sku("TNK-WHT-S"),
        size: "S",
        color: "Bone",
        colorHex: "#E8E2D9",
        priceInPaise: 99900,
        stock: 18,
      },
      {
        id: "v23",
        sku: sku("TNK-WHT-M"),
        size: "M",
        color: "Bone",
        colorHex: "#E8E2D9",
        priceInPaise: 99900,
        stock: 22,
      },
      {
        id: "v24",
        sku: sku("TNK-BLK-M"),
        size: "M",
        color: "Black",
        colorHex: "#111111",
        priceInPaise: 99900,
        stock: 14,
      },
    ],
  },
  {
    id: "p10",
    name: "Nylon Windbreaker",
    slug: "nylon-windbreaker",
    description:
      "Packable shell with a stand collar and elastic hem. Light rain, heavy style.",
    brand: brand.name,
    collection: "streetwear",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
    ],
    variants: [
      {
        id: "v25",
        sku: sku("WND-SLV-M"),
        size: "M",
        color: "Silver",
        colorHex: "#A8A9AD",
        priceInPaise: 349900,
        stock: 6,
      },
      {
        id: "v26",
        sku: sku("WND-SLV-L"),
        size: "L",
        color: "Silver",
        colorHex: "#A8A9AD",
        priceInPaise: 349900,
        stock: 4,
      },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getProductsByCollection(slug: string) {
  return products.filter((p) => p.collection === slug);
}

export function getLowestPrice(product: Product) {
  return Math.min(...product.variants.map((v) => v.priceInPaise));
}
