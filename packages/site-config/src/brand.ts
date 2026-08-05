export const brand = {
  name: "Rush Culture",
  legalName: "Rush Culture",
  skuPrefix: "RC",
  tagline: "Move fast. Dress louder.",
  description:
    "Street-ready youth clothing. Oversized tees, cargos, and limited drops.",
  shortDescription:
    "Street-ready fits for Gen Z — oversized tees, cargos, and limited drops that move fast.",
  footerBlurb:
    "Youth clothing built for the drop cycle — sharp cuts, loud seasons, zero filler.",
  locale: "en-IN",
  currency: "INR",
  country: "IN",
  supportEmail: "support@rushculture.example",
  themeId: "rush-volt",
  meta: {
    titleDefault: "Rush Culture — Youth clothing",
    titleTemplate: "%s · Rush Culture",
    shopDescription:
      "Browse all Rush Culture clothing — search and filter by size, color, price.",
    adminTitleDefault: "Rush Culture Admin",
    adminTitleTemplate: "%s · Rush Culture Admin",
    adminDescription:
      "Orders, products, and customers for Rush Culture storefront.",
  },
  adminLabel: "Admin",
  cartStorageKey: "rush-culture-cart-v1",
  adminAuthCookie: "rc_admin_token",
  orderPrefix: "RC",
} as const;

export type BrandConfig = typeof brand;

export function sku(code: string) {
  return `${brand.skuPrefix}-${code}`;
}

export function withBrandName(template: string) {
  return template.replaceAll("{brand}", brand.name);
}

export function formatInr(paise: number) {
  return new Intl.NumberFormat(brand.locale, {
    style: "currency",
    currency: brand.currency,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
