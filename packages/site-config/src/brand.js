"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brand = void 0;
exports.sku = sku;
exports.withBrandName = withBrandName;
exports.brand = {
    name: "LINQ",
    legalName: "LINQ",
    skuPrefix: "LINQ",
    tagline: "Wear the drop. Skip the noise.",
    description: "Street-ready youth clothing. Oversized tees, cargos, and limited drops.",
    shortDescription: "Street-ready fits for Gen Z — oversized tees, cargos, and limited drops that move fast.",
    footerBlurb: "Youth clothing built for the drop cycle — sharp cuts, loud seasons, zero filler.",
    locale: "en-IN",
    currency: "INR",
    country: "IN",
    supportEmail: "support@linq.example",
    meta: {
        titleDefault: "LINQ — Youth clothing",
        titleTemplate: "%s · LINQ",
        shopDescription: "Browse all LINQ clothing — search and filter by size, color, price.",
        adminTitleDefault: "LINQ Admin",
        adminTitleTemplate: "%s · LINQ Admin",
        adminDescription: "Orders, products, and customers for LINQ storefront.",
    },
    adminLabel: "Admin",
    cartStorageKey: "linq-cart-v1",
    orderPrefix: "LQ",
};
function sku(code) {
    return `${exports.brand.skuPrefix}-${code}`;
}
function withBrandName(template) {
    return template.replaceAll("{brand}", exports.brand.name);
}
//# sourceMappingURL=brand.js.map