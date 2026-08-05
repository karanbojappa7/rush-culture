"use client";

import { useEffect, useState } from "react";
import {
  defaultSeoSettings,
  normalizeSeoSettings,
  type MaxImagePreview,
  type OrganizationSchemaType,
  type SeoSettings,
  type TwitterCardType,
} from "@linq/site-config";
import { apiGet, apiPut } from "@/base/api";

const labelClass =
  "block text-[12px] font-medium tracking-[0.14em] uppercase text-mute";
const inputClass =
  "mt-1.5 w-full border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40";
const textareaClass = `${inputClass} min-h-[88px] resize-y`;

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      {label}
      {children}
      {hint ? (
        <span className="mt-1 block normal-case tracking-normal text-mute/80 font-normal text-[11px]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function SeoControlPanel() {
  const [draft, setDraft] = useState<SeoSettings>(() => defaultSeoSettings());
  const [sameAsText, setSameAsText] = useState("");
  const [noIndexText, setNoIndexText] = useState("");
  const [staticPathsText, setStaticPathsText] = useState("");
  const [additionalPathsText, setAdditionalPathsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  function applyLoaded(next: SeoSettings) {
    setDraft(next);
    setSameAsText(next.sameAs.join("\n"));
    setNoIndexText(next.noIndexPaths.join("\n"));
    setStaticPathsText(
      next.sitemapStaticPaths
        .map((p) => (p === "" ? "/" : p))
        .join("\n"),
    );
    setAdditionalPathsText(next.sitemapAdditionalPaths.join("\n"));
  }

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiGet<SeoSettings>("/api/seo-settings");
    const next =
      res.status_code === 200 && res.data
        ? normalizeSeoSettings(res.data)
        : defaultSeoSettings();
    applyLoaded(next);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function update(partial: Partial<SeoSettings>) {
    setSavedOk(false);
    setDraft((prev) => normalizeSeoSettings({ ...prev, ...partial }));
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const payload = normalizeSeoSettings({
      ...draft,
      sameAs: sameAsText
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
      noIndexPaths: noIndexText
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
      sitemapStaticPaths: staticPathsText
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((p) => (p === "/" ? "" : p)),
      sitemapAdditionalPaths: additionalPathsText
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    const res = await apiPut<SeoSettings>("/api/seo-settings", payload);
    setSaving(false);
    if (res.status_code !== 200 || !res.data) {
      setError(res.message || "Could not save SEO settings");
      return;
    }
    applyLoaded(normalizeSeoSettings(res.data));
    setSavedOk(true);
  }

  if (loading) {
    return <p className="text-sm text-mute">Loading SEO settings…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">
          Titles and descriptions
        </h2>
        <p className="mt-1 text-sm text-mute">
          Storefront document titles, meta descriptions, and brand labels.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Default title">
            <input
              className={inputClass}
              value={draft.titleDefault}
              onChange={(e) => update({ titleDefault: e.target.value })}
            />
          </Field>
          <Field
            label="Title template"
            hint='Use %s for the page title, e.g. "%s · Brand"'
          >
            <input
              className={inputClass}
              value={draft.titleTemplate}
              onChange={(e) => update({ titleTemplate: e.target.value })}
            />
          </Field>
          <Field label="Home title override" hint="Leave blank to use default title">
            <input
              className={inputClass}
              value={draft.homeTitle}
              onChange={(e) => update({ homeTitle: e.target.value })}
            />
          </Field>
          <Field label="Site name" hint="Open Graph site_name / WebSite name">
            <input
              className={inputClass}
              value={draft.siteName}
              onChange={(e) => update({ siteName: e.target.value })}
            />
          </Field>
          <Field label="Application name" hint="PWA / browser application name">
            <input
              className={inputClass}
              value={draft.applicationName}
              onChange={(e) => update({ applicationName: e.target.value })}
            />
          </Field>
          <Field label="Locale" hint="e.g. en-IN">
            <input
              className={inputClass}
              value={draft.locale}
              onChange={(e) => update({ locale: e.target.value })}
            />
          </Field>
          <Field label="Meta description">
            <textarea
              className={textareaClass}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <Field label="Home description override" hint="Leave blank to use meta description">
            <textarea
              className={textareaClass}
              value={draft.homeDescription}
              onChange={(e) => update({ homeDescription: e.target.value })}
            />
          </Field>
          <Field label="Short description" hint="Used in structured data">
            <textarea
              className={textareaClass}
              value={draft.shortDescription}
              onChange={(e) => update({ shortDescription: e.target.value })}
            />
          </Field>
          <Field label="Shop page description">
            <textarea
              className={textareaClass}
              value={draft.shopDescription}
              onChange={(e) => update({ shopDescription: e.target.value })}
            />
          </Field>
          <Field label="Contact page description">
            <textarea
              className={textareaClass}
              value={draft.contactDescription}
              onChange={(e) => update({ contactDescription: e.target.value })}
            />
          </Field>
          <Field label="Keywords" hint="Comma-separated">
            <input
              className={inputClass}
              value={draft.keywords}
              onChange={(e) => update({ keywords: e.target.value })}
              placeholder="streetwear, oversized tees, cargos"
            />
          </Field>
          <Field
            label="Canonical site URL"
            hint="https://www.example.com — used for OG, robots, sitemap"
          >
            <input
              className={inputClass}
              value={draft.canonicalBaseUrl}
              onChange={(e) => update({ canonicalBaseUrl: e.target.value })}
              placeholder="https://www.example.com"
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Indexing / robots</h2>
        <p className="mt-1 text-sm text-mute">
          robots meta, robots.txt, Google-bot previews, and noindex paths.
        </p>
        <div className="mt-5 flex flex-wrap gap-6">
          <Check
            label="Allow search engines to index"
            checked={draft.robotsIndex}
            onChange={(v) => update({ robotsIndex: v })}
          />
          <Check
            label="Allow following links"
            checked={draft.robotsFollow}
            onChange={(v) => update({ robotsFollow: v })}
          />
          <Check
            label="No archive"
            checked={draft.robotsNoArchive}
            onChange={(v) => update({ robotsNoArchive: v })}
          />
          <Check
            label="No snippet"
            checked={draft.robotsNoSnippet}
            onChange={(v) => update({ robotsNoSnippet: v })}
          />
          <Check
            label="No image index"
            checked={draft.robotsNoImageIndex}
            onChange={(v) => update({ robotsNoImageIndex: v })}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="Max image preview">
            <select
              className={inputClass}
              value={draft.maxImagePreview}
              onChange={(e) =>
                update({ maxImagePreview: e.target.value as MaxImagePreview })
              }
            >
              <option value="large">large</option>
              <option value="standard">standard</option>
              <option value="none">none</option>
            </select>
          </Field>
          <Field label="Max snippet" hint="-1 = default (omit)">
            <input
              type="number"
              className={inputClass}
              value={draft.maxSnippet}
              onChange={(e) =>
                update({ maxSnippet: Number(e.target.value) || -1 })
              }
            />
          </Field>
          <Field label="Max video preview" hint="-1 = default (omit)">
            <input
              type="number"
              className={inputClass}
              value={draft.maxVideoPreview}
              onChange={(e) =>
                update({ maxVideoPreview: Number(e.target.value) || -1 })
              }
            />
          </Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Noindex paths"
            hint="One path per line. Disallowed in robots.txt and meta robots."
          >
            <textarea
              className={textareaClass}
              value={noIndexText}
              onChange={(e) => {
                setSavedOk(false);
                setNoIndexText(e.target.value);
              }}
            />
          </Field>
          <Field
            label="Robots sitemap URL"
            hint="Optional override; leave blank for {canonical}/sitemap.xml"
          >
            <input
              className={inputClass}
              value={draft.robotsSitemapUrl}
              onChange={(e) => update({ robotsSitemapUrl: e.target.value })}
              placeholder="https://www.example.com/sitemap.xml"
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Sitemap</h2>
        <div className="mt-5 flex flex-wrap gap-6">
          <Check
            label="Include static pages"
            checked={draft.sitemapIncludeStatic}
            onChange={(v) => update({ sitemapIncludeStatic: v })}
          />
          <Check
            label="Include products"
            checked={draft.sitemapIncludeProducts}
            onChange={(v) => update({ sitemapIncludeProducts: v })}
          />
          <Check
            label="Include collections"
            checked={draft.sitemapIncludeCollections}
            onChange={(v) => update({ sitemapIncludeCollections: v })}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Static paths" hint="One path per line; use / for home">
            <textarea
              className={textareaClass}
              value={staticPathsText}
              onChange={(e) => {
                setSavedOk(false);
                setStaticPathsText(e.target.value);
              }}
            />
          </Field>
          <Field
            label="Additional paths"
            hint="Extra sitemap entries, e.g. /lookbook"
          >
            <textarea
              className={textareaClass}
              value={additionalPathsText}
              onChange={(e) => {
                setSavedOk(false);
                setAdditionalPathsText(e.target.value);
              }}
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Open Graph</h2>
        <p className="mt-1 text-sm text-mute">
          Social sharing cards (Facebook, LinkedIn, etc.).
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="OG title">
            <input
              className={inputClass}
              value={draft.ogTitle}
              onChange={(e) => update({ ogTitle: e.target.value })}
            />
          </Field>
          <Field label="OG type">
            <input
              className={inputClass}
              value={draft.ogType}
              onChange={(e) => update({ ogType: e.target.value })}
              placeholder="website"
            />
          </Field>
          <Field label="OG description">
            <textarea
              className={textareaClass}
              value={draft.ogDescription}
              onChange={(e) => update({ ogDescription: e.target.value })}
            />
          </Field>
          <Field label="OG image URL" hint="Full URL recommended">
            <input
              className={inputClass}
              value={draft.ogImageUrl}
              onChange={(e) => update({ ogImageUrl: e.target.value })}
              placeholder="https://cdn.example.com/og.jpg"
            />
          </Field>
          <Field label="OG image alt">
            <input
              className={inputClass}
              value={draft.ogImageAlt}
              onChange={(e) => update({ ogImageAlt: e.target.value })}
            />
          </Field>
          <Field label="Facebook app ID">
            <input
              className={inputClass}
              value={draft.facebookAppId}
              onChange={(e) => update({ facebookAppId: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Twitter / X cards</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Card type">
            <select
              className={inputClass}
              value={draft.twitterCard}
              onChange={(e) =>
                update({ twitterCard: e.target.value as TwitterCardType })
              }
            >
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </Field>
          <Field label="Site handle" hint="Without @">
            <input
              className={inputClass}
              value={draft.twitterHandle}
              onChange={(e) => update({ twitterHandle: e.target.value })}
            />
          </Field>
          <Field label="Creator handle" hint="Optional; falls back to site handle">
            <input
              className={inputClass}
              value={draft.twitterCreator}
              onChange={(e) => update({ twitterCreator: e.target.value })}
            />
          </Field>
          <Field label="Twitter title">
            <input
              className={inputClass}
              value={draft.twitterTitle}
              onChange={(e) => update({ twitterTitle: e.target.value })}
            />
          </Field>
          <Field label="Twitter image URL">
            <input
              className={inputClass}
              value={draft.twitterImageUrl}
              onChange={(e) => update({ twitterImageUrl: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Twitter description">
              <textarea
                className={textareaClass}
                value={draft.twitterDescription}
                onChange={(e) => update({ twitterDescription: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Structured data</h2>
        <p className="mt-1 text-sm text-mute">
          Organization, WebSite (and SearchAction), and Product JSON-LD.
        </p>
        <div className="mt-5 flex flex-wrap gap-6">
          <Check
            label="Organization schema"
            checked={draft.enableOrganizationSchema}
            onChange={(v) => update({ enableOrganizationSchema: v })}
          />
          <Check
            label="WebSite schema"
            checked={draft.enableWebsiteSchema}
            onChange={(v) => update({ enableWebsiteSchema: v })}
          />
          <Check
            label="Product schema"
            checked={draft.enableProductSchema}
            onChange={(v) => update({ enableProductSchema: v })}
          />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Organization type">
            <select
              className={inputClass}
              value={draft.organizationType}
              onChange={(e) =>
                update({
                  organizationType: e.target.value as OrganizationSchemaType,
                })
              }
            >
              <option value="OnlineStore">OnlineStore</option>
              <option value="Organization">Organization</option>
              <option value="ClothingStore">ClothingStore</option>
              <option value="Store">Store</option>
            </select>
          </Field>
          <Field label="Organization name">
            <input
              className={inputClass}
              value={draft.organizationName}
              onChange={(e) => update({ organizationName: e.target.value })}
            />
          </Field>
          <Field label="Organization email">
            <input
              className={inputClass}
              value={draft.organizationEmail}
              onChange={(e) => update({ organizationEmail: e.target.value })}
            />
          </Field>
          <Field label="Organization phone">
            <input
              className={inputClass}
              value={draft.organizationPhone}
              onChange={(e) => update({ organizationPhone: e.target.value })}
            />
          </Field>
          <Field label="Logo URL">
            <input
              className={inputClass}
              value={draft.organizationLogoUrl}
              onChange={(e) => update({ organizationLogoUrl: e.target.value })}
            />
          </Field>
          <Field
            label="Organization URL"
            hint="Leave blank to use canonical site URL"
          >
            <input
              className={inputClass}
              value={draft.organizationUrl}
              onChange={(e) => update({ organizationUrl: e.target.value })}
            />
          </Field>
          <Field
            label="Site search URL template"
            hint="Include {search_term_string}; relative or absolute"
          >
            <input
              className={inputClass}
              value={draft.siteSearchUrlTemplate}
              onChange={(e) =>
                update({ siteSearchUrlTemplate: e.target.value })
              }
              placeholder="/shop?q={search_term_string}"
            />
          </Field>
          <Field label="sameAs profiles" hint="Social / website URLs, one per line">
            <textarea
              className={textareaClass}
              value={sameAsText}
              onChange={(e) => {
                setSavedOk(false);
                setSameAsText(e.target.value);
              }}
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">
          Icons and verification
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Favicon URL">
            <input
              className={inputClass}
              value={draft.faviconUrl}
              onChange={(e) => update({ faviconUrl: e.target.value })}
            />
          </Field>
          <Field label="Apple touch icon URL">
            <input
              className={inputClass}
              value={draft.appleTouchIconUrl}
              onChange={(e) => update({ appleTouchIconUrl: e.target.value })}
            />
          </Field>
          <Field label="Google site verification" hint="Content value only">
            <input
              className={inputClass}
              value={draft.googleSiteVerification}
              onChange={(e) =>
                update({ googleSiteVerification: e.target.value })
              }
            />
          </Field>
          <Field label="Bing site verification" hint="Content value only">
            <input
              className={inputClass}
              value={draft.bingSiteVerification}
              onChange={(e) => update({ bingSiteVerification: e.target.value })}
            />
          </Field>
          <Field label="Yandex site verification">
            <input
              className={inputClass}
              value={draft.yandexSiteVerification}
              onChange={(e) =>
                update({ yandexSiteVerification: e.target.value })
              }
            />
          </Field>
          <Field label="Pinterest domain verify">
            <input
              className={inputClass}
              value={draft.pinterestSiteVerification}
              onChange={(e) =>
                update({ pinterestSiteVerification: e.target.value })
              }
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="cursor-pointer bg-btn px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-btn-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save SEO"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void load()}
          className="cursor-pointer border border-line px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-mute transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
        >
          Reload
        </button>
        {savedOk ? (
          <p className="text-sm text-mute">Saved for the storefront.</p>
        ) : null}
        {error ? <p className="text-sm text-mute">{error}</p> : null}
      </div>
    </div>
  );
}
