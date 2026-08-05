import { brand } from "./brand";

export type TwitterCardType = "summary" | "summary_large_image";

export type SeoSettings = {
  titleDefault: string;
  titleTemplate: string;
  description: string;
  shortDescription: string;
  shopDescription: string;
  keywords: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  canonicalBaseUrl: string;
  locale: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogType: string;
  twitterCard: TwitterCardType;
  twitterHandle: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  organizationName: string;
  organizationLogoUrl: string;
  organizationEmail: string;
  sameAs: string[];
  googleSiteVerification: string;
  bingSiteVerification: string;
  noIndexPaths: string[];
};

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

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter(Boolean);
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

export function defaultSeoSettings(): SeoSettings {
  return {
    titleDefault: brand.meta.titleDefault,
    titleTemplate: brand.meta.titleTemplate,
    description: brand.description,
    shortDescription: brand.shortDescription,
    shopDescription: brand.meta.shopDescription,
    keywords: "",
    robotsIndex: true,
    robotsFollow: true,
    canonicalBaseUrl: "",
    locale: brand.locale,
    ogTitle: brand.meta.titleDefault,
    ogDescription: brand.description,
    ogImageUrl: "",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterHandle: "",
    twitterTitle: brand.meta.titleDefault,
    twitterDescription: brand.description,
    twitterImageUrl: "",
    organizationName: brand.legalName,
    organizationLogoUrl: "",
    organizationEmail: brand.supportEmail,
    sameAs: [],
    googleSiteVerification: "",
    bingSiteVerification: "",
    noIndexPaths: ["/cart", "/checkout"],
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

  const canonical = asString(input.canonicalBaseUrl, base.canonicalBaseUrl);
  const noIndexPaths = asStringList(
    input.noIndexPaths != null ? input.noIndexPaths : base.noIndexPaths,
  );

  return {
    titleDefault: asString(input.titleDefault, base.titleDefault) || base.titleDefault,
    titleTemplate:
      asString(input.titleTemplate, base.titleTemplate) || base.titleTemplate,
    description: asString(input.description, base.description) || base.description,
    shortDescription:
      asString(input.shortDescription, base.shortDescription) ||
      base.shortDescription,
    shopDescription:
      asString(input.shopDescription, base.shopDescription) ||
      base.shopDescription,
    keywords: asString(input.keywords, base.keywords),
    robotsIndex: asBoolean(input.robotsIndex, base.robotsIndex),
    robotsFollow: asBoolean(input.robotsFollow, base.robotsFollow),
    canonicalBaseUrl: canonical ? stripTrailingSlash(canonical) : "",
    locale: asString(input.locale, base.locale) || base.locale,
    ogTitle: asString(input.ogTitle, base.ogTitle) || base.ogTitle,
    ogDescription:
      asString(input.ogDescription, base.ogDescription) || base.ogDescription,
    ogImageUrl: asString(input.ogImageUrl, base.ogImageUrl),
    ogType: asString(input.ogType, base.ogType) || base.ogType,
    twitterCard,
    twitterHandle: asString(input.twitterHandle, base.twitterHandle).replace(
      /^@/,
      "",
    ),
    twitterTitle:
      asString(input.twitterTitle, base.twitterTitle) || base.twitterTitle,
    twitterDescription:
      asString(input.twitterDescription, base.twitterDescription) ||
      base.twitterDescription,
    twitterImageUrl: asString(input.twitterImageUrl, base.twitterImageUrl),
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
    sameAs: asStringList(input.sameAs != null ? input.sameAs : base.sameAs),
    googleSiteVerification: asString(
      input.googleSiteVerification,
      base.googleSiteVerification,
    ),
    bingSiteVerification: asString(
      input.bingSiteVerification,
      base.bingSiteVerification,
    ),
    noIndexPaths:
      noIndexPaths.length > 0
        ? noIndexPaths.map((path) =>
            path.startsWith("/") ? path : `/${path}`,
          )
        : base.noIndexPaths,
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
