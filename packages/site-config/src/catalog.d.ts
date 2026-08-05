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
export declare const collections: Collection[];
export declare const products: Product[];
export declare function getProductBySlug(slug: string): Product | undefined;
export declare function getCollectionBySlug(slug: string): Collection | undefined;
export declare function getProductsByCollection(slug: string): Product[];
export declare function getLowestPrice(product: Product): number;
