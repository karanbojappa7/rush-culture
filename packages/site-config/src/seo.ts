import { brand } from "./brand";

export type TwitterCardType = "summary" | "summary_large_image";
export type MaxImagePreview = "none" | "standard" | "large";
export type OrganizationSchemaType =
  | "Organization"
  | "OnlineStore"
  | "ClothingStore"
  | "Store";

export type SeoSettings = {
  titleDefault: string;
  titleTemplate: string;
  description: string;
  shortDescription: string;
  shopDescription: string;
  contactDescription: string;
  homeTitle: string;
  homeDescription: string;
  keywords: string;
  siteName: string;
  applicationName: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsNoArchive: boolean;
  robotsNoSnippet: boolean;
  robotsNoImageIndex: boolean;
  maxImagePreview: MaxImagePreview;
  maxSnippet: number;
  maxVideoPreview: number;
  canonicalBaseUrl: string;
  robotsSitemapUrl: string;
  locale: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogImageAlt: string;
  ogType: string;
  twitterCard: TwitterCardType;
  twitterHandle: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  enableOrganizationSchema: boolean;
  organizationType: OrganizationSchemaType;
  organizationName: string;
  organizationLogoUrl: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationUrl: string;
  sameAs: string[];
  enableWebsiteSchema: boolean;
  siteSearchUrlTemplate: string;
  enableProductSchema: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  yandexSiteVerification: string;
  pinterestSiteVerification: string;
  facebookAppId: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  noIndexPaths: string[];
  sitemapIncludeStatic: boolean;
  sitemapIncludeProducts: boolean;
  sitemapIncludeCollections: boolean;
  sitemapStaticPaths: string[];
  sitemapAdditionalPaths: string[];
};

const ORG_TYPES = new Set<OrganizationSchemaType>([
  "Organization",
  "OnlineStore",
  "ClothingStore",
  "Store",
]);

const IMAGE_PREVIEW = new Set<MaxImagePreview>([
  "none",
  "standard",
  "large",
]);

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return fallback;
  return String(value).trim();
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  const raw = asString(value);
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function normalizePathList(paths: string[]): string[] {
  return paths.map((path) => (path.startsWith("/") ? path : `/${path}`));
}

export function defaultSeoSettings(): SeoSettings {
  return {
    titleDefault: brand.meta.titleDefault,
    titleTemplate: brand.meta.titleTemplate,
    description: brand.description,
    shortDescription: brand.shortDescription,
    shopDescription: brand.meta.shopDescription,
    contactDescription: `Ask ${brand.name} about shipping, returns, orders, or products.`,
    homeTitle: "",
    homeDescription: "",
    keywords: "",
    siteName: brand.name,
    applicationName: brand.name,
    robotsIndex: true,
    robotsFollow: true,
    robotsNoArchive: false,
    robotsNoSnippet: false,
    robotsNoImageIndex: false,
    maxImagePreview: "large",
    maxSnippet: -1,
    maxVideoPreview: -1,
    canonicalBaseUrl: "",
    robotsSitemapUrl: "",
    locale: brand.locale,
    ogTitle: brand.meta.titleDefault,
    ogDescription: brand.description,
    ogImageUrl: "",
    ogImageAlt: brand.name,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterHandle: "",
    twitterCreator: "",
    twitterTitle: brand.meta.titleDefault,
    twitterDescription: brand.description,
    twitterImageUrl: "",
    enableOrganizationSchema: true,
    organizationType: "OnlineStore",
    organizationName: brand.legalName,
    organizationLogoUrl: "",
    organizationEmail: brand.supportEmail,
    organizationPhone: "",
    organizationUrl: "",
    sameAs: [],
    enableWebsiteSchema: true,
    siteSearchUrlTemplate: "/shop?q={search_term_string}",
    enableProductSchema: true,
    googleSiteVerification: "",
    bingSiteVerification: "",
    yandexSiteVerification: "",
    pinterestSiteVerification: "",
    facebookAppId: "",
    faviconUrl: "",
    appleTouchIconUrl: "",
    noIndexPaths: ["/cart", "/checkout"],
    sitemapIncludeStatic: true,
    sitemapIncludeProducts: true,
    sitemapIncludeCollections: true,
    sitemapStaticPaths: [
      "",
      "/shop",
      "/contact",
      "/shipping",
      "/returns",
      "/size-guide",
    ],
    sitemapAdditionalPaths: [],
  };
}

export function normalizeSeoSettings(
  input?: Partial<SeoSettings> | null,
): SeoSettings {
  const base = defaultSeoSettings();
  if (!input || typeof input !== "object") return base;

  const twitterCard =
    input.twitterCard === "summary" ||
    input.twitterCard === "summary_large_image"
      ? input.twitterCard
      : base.twitterCard;

  const organizationType = ORG_TYPES.has(
    input.organizationType as OrganizationSchemaType,
  )
    ? (input.organizationType as OrganizationSchemaType)
    : base.organizationType;

  const maxImagePreview = IMAGE_PREVIEW.has(
    input.maxImagePreview as MaxImagePreview,
  )
    ? (input.maxImagePreview as MaxImagePreview)
    : base.maxImagePreview;

  const canonical = asString(input.canonicalBaseUrl, base.canonicalBaseUrl);
  const noIndexRaw =
    input.noIndexPaths !== undefined
      ? asStringList(input.noIndexPaths)
      : base.noIndexPaths;
  const staticRaw =
    input.sitemapStaticPaths !== undefined
      ? asStringList(input.sitemapStaticPaths)
      : base.sitemapStaticPaths;
  const additionalRaw =
    input.sitemapAdditionalPaths !== undefined
      ? asStringList(input.sitemapAdditionalPaths)
      : base.sitemapAdditionalPaths;

  return {
    titleDefault:
      asString(input.titleDefault, base.titleDefault) || base.titleDefault,
    titleTemplate:
      asString(input.titleTemplate, base.titleTemplate) || base.titleTemplate,
    description:
      asString(input.description, base.description) || base.description,
    shortDescription:
      asString(input.shortDescription, base.shortDescription) ||
      base.shortDescription,
    shopDescription:
      asString(input.shopDescription, base.shopDescription) ||
      base.shopDescription,
    contactDescription:
      asString(input.contactDescription, base.contactDescription) ||
      base.contactDescription,
    homeTitle: asString(input.homeTitle, base.homeTitle),
    homeDescription: asString(input.homeDescription, base.homeDescription),
    keywords: asString(input.keywords, base.keywords),
    siteName: asString(input.siteName, base.siteName) || base.siteName,
    applicationName:
      asString(input.applicationName, base.applicationName) ||
      base.applicationName,
    robotsIndex: asBoolean(input.robotsIndex, base.robotsIndex),
    robotsFollow: asBoolean(input.robotsFollow, base.robotsFollow),
    robotsNoArchive: asBoolean(input.robotsNoArchive, base.robotsNoArchive),
    robotsNoSnippet: asBoolean(input.robotsNoSnippet, base.robotsNoSnippet),
    robotsNoImageIndex: asBoolean(
      input.robotsNoImageIndex,
      base.robotsNoImageIndex,
    ),
    maxImagePreview,
    maxSnippet: Math.max(-1, Math.round(asNumber(input.maxSnippet, base.maxSnippet))),
    maxVideoPreview: Math.max(
      -1,
      Math.round(asNumber(input.maxVideoPreview, base.maxVideoPreview)),
    ),
    canonicalBaseUrl: canonical ? stripTrailingSlash(canonical) : "",
    robotsSitemapUrl: asString(input.robotsSitemapUrl, base.robotsSitemapUrl),
    locale: asString(input.locale, base.locale) || base.locale,
    ogTitle: asString(input.ogTitle, base.ogTitle) || base.ogTitle,
    ogDescription:
      asString(input.ogDescription, base.ogDescription) || base.ogDescription,
    ogImageUrl: asString(input.ogImageUrl, base.ogImageUrl),
    ogImageAlt: asString(input.ogImageAlt, base.ogImageAlt),
    ogType: asString(input.ogType, base.ogType) || base.ogType,
    twitterCard,
    twitterHandle: asString(input.twitterHandle, base.twitterHandle).replace(
      /^@/,
      "",
    ),
    twitterCreator: asString(input.twitterCreator, base.twitterCreator).replace(
      /^@/,
      "",
    ),
    twitterTitle:
      asString(input.twitterTitle, base.twitterTitle) || base.twitterTitle,
    twitterDescription:
      asString(input.twitterDescription, base.twitterDescription) ||
      base.twitterDescription,
    twitterImageUrl: asString(input.twitterImageUrl, base.twitterImageUrl),
    enableOrganizationSchema: asBoolean(
      input.enableOrganizationSchema,
      base.enableOrganizationSchema,
    ),
    organizationType,
    organizationName:
      asString(input.organizationName, base.organizationName) ||
      base.organizationName,
    organizationLogoUrl: asString(
      input.organizationLogoUrl,
      base.organizationLogoUrl,
    ),
    organizationEmail:
      asString(input.organizationEmail, base.organizationEmail) ||
      base.organizationEmail,
    organizationPhone: asString(
      input.organizationPhone,
      base.organizationPhone,
    ),
    organizationUrl: asString(input.organizationUrl, base.organizationUrl),
    sameAs: asStringList(input.sameAs !== undefined ? input.sameAs : base.sameAs),
    enableWebsiteSchema: asBoolean(
      input.enableWebsiteSchema,
      base.enableWebsiteSchema,
    ),
    siteSearchUrlTemplate: asString(
      input.siteSearchUrlTemplate,
      base.siteSearchUrlTemplate,
    ),
    enableProductSchema: asBoolean(
      input.enableProductSchema,
      base.enableProductSchema,
    ),
    googleSiteVerification: asString(
      input.googleSiteVerification,
      base.googleSiteVerification,
    ),
    bingSiteVerification: asString(
      input.bingSiteVerification,
      base.bingSiteVerification,
    ),
    yandexSiteVerification: asString(
      input.yandexSiteVerification,
      base.yandexSiteVerification,
    ),
    pinterestSiteVerification: asString(
      input.pinterestSiteVerification,
      base.pinterestSiteVerification,
    ),
    facebookAppId: asString(input.facebookAppId, base.facebookAppId),
    faviconUrl: asString(input.faviconUrl, base.faviconUrl),
    appleTouchIconUrl: asString(
      input.appleTouchIconUrl,
      base.appleTouchIconUrl,
    ),
    noIndexPaths: normalizePathList(noIndexRaw),
    sitemapIncludeStatic: asBoolean(
      input.sitemapIncludeStatic,
      base.sitemapIncludeStatic,
    ),
    sitemapIncludeProducts: asBoolean(
      input.sitemapIncludeProducts,
      base.sitemapIncludeProducts,
    ),
    sitemapIncludeCollections: asBoolean(
      input.sitemapIncludeCollections,
      base.sitemapIncludeCollections,
    ),
    sitemapStaticPaths: normalizePathList(
      staticRaw.length > 0 ? staticRaw : base.sitemapStaticPaths,
    ).map((p) => (p === "/" ? "" : p)),
    sitemapAdditionalPaths: normalizePathList(additionalRaw),
  };
}

export function absoluteSeoUrl(
  settings: SeoSettings,
  pathOrUrl?: string | null,
): string | undefined {
  if (!pathOrUrl) return undefined;
  const value = pathOrUrl.trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  const base = settings.canonicalBaseUrl;
  if (!base) return value.startsWith("/") ? undefined : value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${stripTrailingSlash(base)}${path}`;
}

export function parseSeoKeywords(keywords: string): string[] {
  return keywords
    .split(/[,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isSeoNoIndexPath(
  settings: SeoSettings,
  path?: string | null,
): boolean {
  if (!path) return false;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return settings.noIndexPaths.some((entry) => {
    const target = entry.startsWith("/") ? entry : `/${entry}`;
    if (target === "/") return normalized === "/";
    return normalized === target || normalized.startsWith(`${target}/`);
  });
}

export function resolveSiteSearchUrlTemplate(
  settings: SeoSettings,
): string | undefined {
  const template = settings.siteSearchUrlTemplate.trim();
  if (!template) return undefined;
  if (/^https?:\/\//i.test(template)) return template;
  const base = settings.canonicalBaseUrl;
  if (!base) return undefined;
  const path = template.startsWith("/") ? template : `/${template}`;
  return `${stripTrailingSlash(base)}${path}`;
}

export function organizationJsonLd(settings: SeoSettings) {
  if (!settings.enableOrganizationSchema) return null;
  const logo = absoluteSeoUrl(settings, settings.organizationLogoUrl);
  const url =
    absoluteSeoUrl(settings, settings.organizationUrl) ||
    settings.canonicalBaseUrl ||
    undefined;
  return {
    "@context": "https://schema.org",
    "@type": settings.organizationType,
    name: settings.organizationName,
    email: settings.organizationEmail || undefined,
    telephone: settings.organizationPhone || undefined,
    url,
    logo: logo || undefined,
    sameAs: settings.sameAs.length > 0 ? settings.sameAs : undefined,
    description: settings.shortDescription || settings.description,
  };
}

export function websiteJsonLd(settings: SeoSettings) {
  if (!settings.enableWebsiteSchema) return null;
  const searchTemplate = resolveSiteSearchUrlTemplate(settings);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName || settings.organizationName,
    url: settings.canonicalBaseUrl || undefined,
    description: settings.shortDescription || settings.description,
    inLanguage: settings.locale,
  };
  if (searchTemplate) {
    data.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchTemplate,
      },
      "query-input": "required name=search_term_string",
    };
  }
  return data;
}

export function productJsonLd(
  settings: SeoSettings,
  product: {
    name: string;
    slug: string;
    description?: string | null;
    brand?: string | null;
    images?: string[];
    variants?: Array<{
      priceInPaise: number;
      stock: number;
      sku?: string;
    }>;
  },
) {
  if (!settings.enableProductSchema) return null;
  const variants = product.variants ?? [];
  const prices = variants.map((v) => v.priceInPaise).filter((n) => n >= 0);
  const images = (product.images ?? [])
    .map((src) => absoluteSeoUrl(settings, src))
    .filter((src): src is string => Boolean(src));
  const url = absoluteSeoUrl(settings, `/products/${product.slug}`);
  const inStock = variants.some((v) => v.stock > 0);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || settings.description,
    image: images.length > 0 ? images : undefined,
    brand: {
      "@type": "Brand",
      name: product.brand || settings.organizationName || brand.name,
    },
    sku: variants[0]?.sku || undefined,
    url: url || undefined,
  };
  if (prices.length > 0) {
    const low = Math.min(...prices) / 100;
    const high = Math.max(...prices) / 100;
    data.offers = {
      "@type": "AggregateOffer",
      priceCurrency: brand.currency,
      lowPrice: low.toFixed(2),
      highPrice: high.toFixed(2),
      offerCount: variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: url || undefined,
    };
  }
  return data;
}
