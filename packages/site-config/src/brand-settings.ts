import { brand } from "./brand";

export type BrandSettings = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  shortDescription: string;
  footerBlurb: string;
  locale: string;
  currency: string;
  country: string;
  supportEmail: string;
  supportPhone: string;
};

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return fallback;
  return String(value).trim();
}

export function defaultBrandSettings(): BrandSettings {
  return {
    name: brand.name,
    legalName: brand.legalName,
    tagline: brand.tagline,
    description: brand.description,
    shortDescription: brand.shortDescription,
    footerBlurb: brand.footerBlurb,
    locale: brand.locale,
    currency: brand.currency,
    country: brand.country,
    supportEmail: brand.supportEmail,
    supportPhone: "",
  };
}

export function normalizeBrandSettings(
  input?: Partial<BrandSettings> | null,
): BrandSettings {
  const base = defaultBrandSettings();
  if (!input || typeof input !== "object") return base;
  return {
    name: asString(input.name, base.name) || base.name,
    legalName: asString(input.legalName, base.legalName) || base.legalName,
    tagline: asString(input.tagline, base.tagline) || base.tagline,
    description:
      asString(input.description, base.description) || base.description,
    shortDescription:
      asString(input.shortDescription, base.shortDescription) ||
      base.shortDescription,
    footerBlurb:
      asString(input.footerBlurb, base.footerBlurb) || base.footerBlurb,
    locale: asString(input.locale, base.locale) || base.locale,
    currency: asString(input.currency, base.currency) || base.currency,
    country: asString(input.country, base.country) || base.country,
    supportEmail:
      asString(input.supportEmail, base.supportEmail) || base.supportEmail,
    supportPhone: asString(input.supportPhone, base.supportPhone),
  };
}
