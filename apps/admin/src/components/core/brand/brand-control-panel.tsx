"use client";

import { useEffect, useState } from "react";
import {
  defaultBrandSettings,
  normalizeBrandSettings,
  type BrandSettings,
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

export function BrandControlPanel() {
  const [draft, setDraft] = useState<BrandSettings>(() => defaultBrandSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiGet<BrandSettings>("/api/brand-settings");
    const next =
      res.status_code === 200 && res.data
        ? normalizeBrandSettings(res.data)
        : defaultBrandSettings();
    setDraft(next);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function update(partial: Partial<BrandSettings>) {
    setSavedOk(false);
    setDraft((prev) => normalizeBrandSettings({ ...prev, ...partial }));
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const payload = normalizeBrandSettings(draft);
    const res = await apiPut<BrandSettings>("/api/brand-settings", payload);
    setSaving(false);
    if (res.status_code !== 200 || !res.data) {
      setError(res.message || "Could not save brand settings");
      return;
    }
    setDraft(normalizeBrandSettings(res.data));
    setSavedOk(true);
  }

  if (loading) {
    return <p className="text-sm text-mute">Loading brand settings…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Identity</h2>
        <p className="mt-1 text-sm text-mute">
          Store-facing name and legal identity. SEO organization fields stay on
          the SEO page.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Brand name">
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </Field>
          <Field label="Legal name" hint="Footer copyright and receipts">
            <input
              className={inputClass}
              value={draft.legalName}
              onChange={(e) => update({ legalName: e.target.value })}
            />
          </Field>
          <Field label="Tagline">
            <input
              className={inputClass}
              value={draft.tagline}
              onChange={(e) => update({ tagline: e.target.value })}
            />
          </Field>
          <Field label="Support email">
            <input
              className={inputClass}
              type="email"
              value={draft.supportEmail}
              onChange={(e) => update({ supportEmail: e.target.value })}
            />
          </Field>
          <Field label="Support phone" hint="Optional; leave blank to hide">
            <input
              className={inputClass}
              value={draft.supportPhone}
              onChange={(e) => update({ supportPhone: e.target.value })}
            />
          </Field>
          <Field label="Locale" hint="e.g. en-IN">
            <input
              className={inputClass}
              value={draft.locale}
              onChange={(e) => update({ locale: e.target.value })}
            />
          </Field>
          <Field label="Currency" hint="ISO code, e.g. INR">
            <input
              className={inputClass}
              value={draft.currency}
              onChange={(e) => update({ currency: e.target.value })}
            />
          </Field>
          <Field label="Country" hint="ISO code, e.g. IN">
            <input
              className={inputClass}
              value={draft.country}
              onChange={(e) => update({ country: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Store copy</h2>
        <p className="mt-1 text-sm text-mute">
          Hero and footer marketing text. Meta titles live in SEO.
        </p>
        <div className="mt-5 grid gap-4">
          <Field label="Short description" hint="Hero supporting sentence">
            <textarea
              className={textareaClass}
              value={draft.shortDescription}
              onChange={(e) => update({ shortDescription: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className={textareaClass}
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <Field label="Footer blurb">
            <textarea
              className={textareaClass}
              value={draft.footerBlurb}
              onChange={(e) => update({ footerBlurb: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="cursor-pointer bg-ink px-5 py-2.5 text-[13px] font-bold tracking-[0.12em] uppercase text-paper disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save brand"}
        </button>
        {savedOk ? (
          <p className="text-sm text-mute">Saved. Storefront will pick this up on next load.</p>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
