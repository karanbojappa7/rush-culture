import type { Metadata } from "next";
import {
  absoluteSeoUrl,
  defaultSeoSettings,
  isSeoNoIndexPath,
  normalizeSeoSettings,
  organizationJsonLd as buildOrganizationJsonLd,
  parseSeoKeywords,
  productJsonLd as buildProductJsonLd,
  websiteJsonLd as buildWebsiteJsonLd,
  type SeoSettings,
} from "@linq/site-config";
import { apiGet } from "@/lib/api";

export async function fetchSeoSettings(): Promise<SeoSettings> {
  try {
    const res = await apiGet<SeoSettings>("/api/seo-settings");
    if (res.status_code === 200 && res.data) {
      return normalizeSeoSettings(res.data);
    }
  } catch {
  }
  return defaultSeoSettings();
}

function twitterAt(handle: string): string | undefined {
  const value = handle.replace(/^@/, "").trim();
  return value ? `@${value}` : undefined;
}

export function seoToRootMetadata(settings: SeoSettings): Metadata {
  const keywords = parseSeoKeywords(settings.keywords);
  const ogImage = absoluteSeoUrl(settings, settings.ogImageUrl);
  const twitterImage =
    absoluteSeoUrl(settings, settings.twitterImageUrl) || ogImage;
  const favicon = absoluteSeoUrl(settings, settings.faviconUrl);
  const apple = absoluteSeoUrl(settings, settings.appleTouchIconUrl);

  const other: Record<string, string> = {};
  if (settings.bingSiteVerification) {
    other["msvalidate.01"] = settings.bingSiteVerification;
  }
  if (settings.pinterestSiteVerification) {
    other["p:domain_verify"] = settings.pinterestSiteVerification;
  }
  if (settings.facebookAppId) {
    other["fb:app_id"] = settings.facebookAppId;
  }

  const verification: Metadata["verification"] = {};
  if (settings.googleSiteVerification) {
    verification.google = settings.googleSiteVerification;
  }
  if (settings.yandexSiteVerification) {
    verification.yandex = settings.yandexSiteVerification;
  }
  if (Object.keys(other).length > 0) {
    verification.other = other;
  }

  return {
    metadataBase: settings.canonicalBaseUrl
      ? new URL(settings.canonicalBaseUrl)
      : undefined,
    applicationName: settings.applicationName || undefined,
    title: {
      default: settings.homeTitle || settings.titleDefault,
      template: settings.titleTemplate,
    },
    description: settings.homeDescription || settings.description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots: {
      index: settings.robotsIndex,
      follow: settings.robotsFollow,
      noarchive: settings.robotsNoArchive || undefined,
      nosnippet: settings.robotsNoSnippet || undefined,
      noimageindex: settings.robotsNoImageIndex || undefined,
      googleBot: {
        index: settings.robotsIndex,
        follow: settings.robotsFollow,
        noarchive: settings.robotsNoArchive || undefined,
        nosnippet: settings.robotsNoSnippet || undefined,
        noimageindex: settings.robotsNoImageIndex || undefined,
        "max-image-preview": settings.maxImagePreview,
        ...(settings.maxSnippet >= 0
          ? { "max-snippet": settings.maxSnippet }
          : {}),
        ...(settings.maxVideoPreview >= 0
          ? { "max-video-preview": settings.maxVideoPreview }
          : {}),
      },
    },
    icons: {
      icon: favicon ? [{ url: favicon }] : undefined,
      apple: apple ? [{ url: apple }] : undefined,
    },
    openGraph: {
      type: (settings.ogType || "website") as
        | "website"
        | "article"
        | "book"
        | "profile",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.siteName || settings.organizationName,
      title: settings.ogTitle || settings.titleDefault,
      description: settings.ogDescription || settings.description,
      url: settings.canonicalBaseUrl || undefined,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: settings.ogImageAlt || settings.siteName || undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: settings.twitterCard,
      site: twitterAt(settings.twitterHandle),
      creator: twitterAt(settings.twitterCreator || settings.twitterHandle),
      title: settings.twitterTitle || settings.ogTitle || settings.titleDefault,
      description:
        settings.twitterDescription ||
        settings.ogDescription ||
        settings.description,
      images: twitterImage ? [twitterImage] : undefined,
    },
    verification:
      Object.keys(verification).length > 0 ? verification : undefined,
  };
}

export function seoToPageMetadata(
  settings: SeoSettings,
  options: {
    title?: string;
    description?: string;
    path?: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
    noIndex?: boolean;
  } = {},
): Metadata {
  const title = options.title;
  const description = options.description || settings.description;
  const path = options.path;
  const image =
    absoluteSeoUrl(settings, options.imageUrl) ||
    absoluteSeoUrl(settings, settings.ogImageUrl);
  const imageAlt =
    options.imageAlt || settings.ogImageAlt || settings.siteName || undefined;
  const canonical =
    settings.canonicalBaseUrl && path
      ? `${settings.canonicalBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
      : undefined;
  const noIndex =
    options.noIndex === true || isSeoNoIndexPath(settings, path);

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: settings.robotsIndex,
          follow: settings.robotsFollow,
          noarchive: settings.robotsNoArchive || undefined,
          nosnippet: settings.robotsNoSnippet || undefined,
          noimageindex: settings.robotsNoImageIndex || undefined,
        },
    openGraph: {
      title: title || settings.ogTitle || settings.titleDefault,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: imageAlt }] : undefined,
      type: (settings.ogType || "website") as
        | "website"
        | "article"
        | "book"
        | "profile",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.siteName || settings.organizationName,
    },
    twitter: {
      card: settings.twitterCard,
      title: title || settings.twitterTitle || settings.titleDefault,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function organizationJsonLd(settings: SeoSettings) {
  return buildOrganizationJsonLd(settings);
}

export function websiteJsonLd(settings: SeoSettings) {
  return buildWebsiteJsonLd(settings);
}

export function productJsonLd(
  settings: SeoSettings,
  product: Parameters<typeof buildProductJsonLd>[1],
) {
  return buildProductJsonLd(settings, product);
}
