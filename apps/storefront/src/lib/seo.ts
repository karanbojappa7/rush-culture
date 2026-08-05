import type { Metadata } from "next";
import {
  absoluteSeoUrl,
  defaultSeoSettings,
  normalizeSeoSettings,
  parseSeoKeywords,
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

export function seoToRootMetadata(settings: SeoSettings): Metadata {
  const keywords = parseSeoKeywords(settings.keywords);
  const ogImage = absoluteSeoUrl(settings, settings.ogImageUrl);
  const twitterImage =
    absoluteSeoUrl(settings, settings.twitterImageUrl) || ogImage;
  const verification: Metadata["verification"] = {};
  if (settings.googleSiteVerification) {
    verification.google = settings.googleSiteVerification;
  }
  if (settings.bingSiteVerification) {
    verification.other = {
      "msvalidate.01": settings.bingSiteVerification,
    };
  }

  return {
    metadataBase: settings.canonicalBaseUrl
      ? new URL(settings.canonicalBaseUrl)
      : undefined,
    title: {
      default: settings.titleDefault,
      template: settings.titleTemplate,
    },
    description: settings.description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots: {
      index: settings.robotsIndex,
      follow: settings.robotsFollow,
      googleBot: {
        index: settings.robotsIndex,
        follow: settings.robotsFollow,
      },
    },
    openGraph: {
      type: settings.ogType || "website",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.organizationName,
      title: settings.ogTitle || settings.titleDefault,
      description: settings.ogDescription || settings.description,
      url: settings.canonicalBaseUrl || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: settings.twitterCard,
      site: settings.twitterHandle
        ? `@${settings.twitterHandle.replace(/^@/, "")}`
        : undefined,
      creator: settings.twitterHandle
        ? `@${settings.twitterHandle.replace(/^@/, "")}`
        : undefined,
      title: settings.twitterTitle || settings.ogTitle || settings.titleDefault,
      description:
        settings.twitterDescription ||
        settings.ogDescription ||
        settings.description,
      images: twitterImage ? [twitterImage] : undefined,
    },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
  };
}

export function seoToPageMetadata(
  settings: SeoSettings,
  options: {
    title?: string;
    description?: string;
    path?: string;
    imageUrl?: string | null;
    noIndex?: boolean;
  } = {},
): Metadata {
  const title = options.title;
  const description = options.description || settings.description;
  const path = options.path;
  const image =
    absoluteSeoUrl(settings, options.imageUrl) ||
    absoluteSeoUrl(settings, settings.ogImageUrl);
  const canonical =
    settings.canonicalBaseUrl && path
      ? `${settings.canonicalBaseUrl}${path.startsWith("/") ? path : `/${path}`}`
      : undefined;
  const noIndex = options.noIndex === true;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: settings.robotsIndex,
          follow: settings.robotsFollow,
        },
    openGraph: {
      title: title || settings.ogTitle || settings.titleDefault,
      description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
      type: settings.ogType || "website",
      locale: settings.locale.replace("-", "_"),
      siteName: settings.organizationName,
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
  const logo = absoluteSeoUrl(settings, settings.organizationLogoUrl);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.organizationName,
    email: settings.organizationEmail || undefined,
    url: settings.canonicalBaseUrl || undefined,
    logo: logo || undefined,
    sameAs: settings.sameAs.length > 0 ? settings.sameAs : undefined,
    description: settings.shortDescription || settings.description,
  };
  return data;
}
