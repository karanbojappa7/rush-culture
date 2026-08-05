export declare const brand: {
    readonly name: "LINQ";
    readonly legalName: "LINQ";
    readonly skuPrefix: "LINQ";
    readonly tagline: "Wear the drop. Skip the noise.";
    readonly description: "Street-ready youth clothing. Oversized tees, cargos, and limited drops.";
    readonly shortDescription: "Street-ready fits for Gen Z — oversized tees, cargos, and limited drops that move fast.";
    readonly footerBlurb: "Youth clothing built for the drop cycle — sharp cuts, loud seasons, zero filler.";
    readonly locale: "en-IN";
    readonly currency: "INR";
    readonly country: "IN";
    readonly supportEmail: "support@linq.example";
    readonly meta: {
        readonly titleDefault: "LINQ — Youth clothing";
        readonly titleTemplate: "%s · LINQ";
        readonly shopDescription: "Browse all LINQ clothing — search and filter by size, color, price.";
        readonly adminTitleDefault: "LINQ Admin";
        readonly adminTitleTemplate: "%s · LINQ Admin";
        readonly adminDescription: "Orders, products, and customers for LINQ storefront.";
    };
    readonly adminLabel: "Admin";
    readonly cartStorageKey: "linq-cart-v1";
    readonly orderPrefix: "LQ";
};
export type BrandConfig = typeof brand;
export declare function sku(code: string): string;
export declare function withBrandName(template: string): string;
