"use client";

import { useEffect, useState } from "react";
import {
  defaultSeoSettings,
  normalizeSeoSettings,
  type SeoSettings,
  type TwitterCardType,
} from "@linq/site-config";
import { apiGet, apiPut } from "@/lib/api";

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
      {hint ? <span className="mt-1 block normal-case tracking-normal text-mute/80 font-normal text-[11px]">{hint}</span> : null}
    </label>
  );
}

export function SeoControlPanel() {
  const [draft, setDraft] = useState<SeoSettings>(() => defaultSeoSettings());
  const [sameAsText, setSameAsText] = useState("");
  const [noIndexText, setNoIndexText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiGet<SeoSettings>("/api/seo-settings");
    const next =
      res.status_code === 200 && res.data
        ? normalizeSeoSettings(res.data)
        : defaultSeoSettings();
    setDraft(next);
    setSameAsText(next.sameAs.join("\n"));
    setNoIndexText(next.noIndexPaths.join("\n"));
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
    });
    const res = await apiPut<SeoSettings>("/api/seo-settings", payload);
    setSaving(false);
    if (res.status_code !== 200 || !res.data) {
      setError(res.message || "Could not save SEO settings");
      return;
    }
    const saved = normalizeSeoSettings(res.data);
    setDraft(saved);
    setSameAsText(saved.sameAs.join("\n"));
    setNoIndexText(saved.noIndexPaths.join("\n"));
    setSavedOk(true);
  }

  if (loading) {
    return <p className="text-sm text-mute">Loading SEO settings…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Titles and descriptions</h2>
        <p className="mt-1 text-sm text-mute">
          Default document title and meta description for the storefront.
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
          <Field label="Meta description">
            <textarea
              className={textareaClass}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <Field label="Short description">
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
          <Field label="Keywords" hint="Comma-separated">
            <input
              className={inputClass}
              value={draft.keywords}
              onChange={(e) => update({ keywords: e.target.value })}
              placeholder="streetwear, oversized tees, cargos"
            />
          </Field>
          <Field label="Locale" hint="e.g. en-IN">
            <input
              className={inputClass}
              value={draft.locale}
              onChange={(e) => update({ locale: e.target.value })}
            />
          </Field>
          <Field
            label="Canonical site URL"
            hint="https://www.example.com — used for OG URLs, robots, sitemap"
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
          Controls storefront robots meta, robots.txt, and noindex path list.
        </p>
        <div className="mt-5 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={draft.robotsIndex}
              onChange={(e) => update({ robotsIndex: e.target.checked })}
            />
            Allow search engines to index
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={draft.robotsFollow}
              onChange={(e) => update({ robotsFollow: e.target.checked })}
            />
            Allow following links
          </label>
        </div>
        <div className="mt-4">
          <Field
            label="Noindex paths"
            hint="One path per line (e.g. /cart). Added to robots.txt disallow when present."
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
          <Field label="Twitter handle" hint="Without @">
            <input
              className={inputClass}
              value={draft.twitterHandle}
              onChange={(e) => update({ twitterHandle: e.target.value })}
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
        <h2 className="font-display text-xl font-bold">Organization (JSON-LD)</h2>
        <p className="mt-1 text-sm text-mute">
          Defaults for structured data on the storefront.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
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
          <Field label="Logo URL">
            <input
              className={inputClass}
              value={draft.organizationLogoUrl}
              onChange={(e) => update({ organizationLogoUrl: e.target.value })}
            />
          </Field>
          <Field
            label="sameAs profiles"
            hint="Social / website URLs, one per line"
          >
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
        <h2 className="font-display text-xl font-bold">Search console verification</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
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
