"use client";

import { useEffect, useState } from "react";
import {
  defaultPoliciesSettings,
  normalizePoliciesSettings,
  type ContactTopic,
  type PoliciesSettings,
  type PolicyDocument,
  type PolicySection,
  type SizeGuideRow,
} from "@linq/site-config";
import { apiGet, apiPut } from "@/base/api";

const labelClass =
  "block text-[12px] font-medium tracking-[0.14em] uppercase text-mute";
const inputClass =
  "mt-1.5 w-full border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40";
const textareaClass = `${inputClass} min-h-[88px] resize-y`;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      {label}
      {children}
    </label>
  );
}

function PolicyDocumentEditor({
  title,
  document,
  onChange,
}: {
  title: string;
  document: PolicyDocument;
  onChange: (next: PolicyDocument) => void;
}) {
  function updateSection(index: number, partial: Partial<PolicySection>) {
    const sections = document.sections.map((section, i) =>
      i === index ? { ...section, ...partial } : section,
    );
    onChange({ ...document, sections });
  }

  function addSection() {
    onChange({
      ...document,
      sections: [
        ...document.sections,
        { title: "New section", body: "" },
      ],
    });
  }

  function removeSection(index: number) {
    onChange({
      ...document,
      sections: document.sections.filter((_, i) => i !== index),
    });
  }

  return (
    <section className="border border-line bg-panel p-5 md:p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-5 grid gap-4">
        <Field label="Page title">
          <input
            className={inputClass}
            value={document.title}
            onChange={(e) => onChange({ ...document, title: e.target.value })}
          />
        </Field>
        <Field label="Intro">
          <textarea
            className={textareaClass}
            value={document.intro}
            onChange={(e) => onChange({ ...document, intro: e.target.value })}
          />
        </Field>
      </div>
      <div className="mt-6 space-y-4">
        <p className={labelClass}>Sections</p>
        {document.sections.map((section, index) => (
          <div key={index} className="border border-line p-4">
            <div className="grid gap-3">
              <Field label="Section title">
                <input
                  className={inputClass}
                  value={section.title}
                  onChange={(e) =>
                    updateSection(index, { title: e.target.value })
                  }
                />
              </Field>
              <Field label="Body">
                <textarea
                  className={textareaClass}
                  value={section.body}
                  onChange={(e) =>
                    updateSection(index, { body: e.target.value })
                  }
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="mt-3 cursor-pointer text-sm text-mute underline"
            >
              Remove section
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSection}
          className="cursor-pointer text-sm font-medium text-ink underline"
        >
          Add section
        </button>
      </div>
    </section>
  );
}

export function PoliciesControlPanel() {
  const [draft, setDraft] = useState<PoliciesSettings>(() =>
    defaultPoliciesSettings(),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await apiGet<PoliciesSettings>("/api/policy-settings");
    const next =
      res.status_code === 200 && res.data
        ? normalizePoliciesSettings(res.data)
        : defaultPoliciesSettings();
    setDraft(next);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function update(partial: Partial<PoliciesSettings>) {
    setSavedOk(false);
    setDraft((prev) => normalizePoliciesSettings({ ...prev, ...partial }));
  }

  function updateRow(index: number, partial: Partial<SizeGuideRow>) {
    update({
      sizeGuide: {
        ...draft.sizeGuide,
        rows: draft.sizeGuide.rows.map((row, i) =>
          i === index ? { ...row, ...partial } : row,
        ),
      },
    });
  }

  function addRow() {
    update({
      sizeGuide: {
        ...draft.sizeGuide,
        rows: [
          ...draft.sizeGuide.rows,
          { size: "", chest: "", length: "", shoulder: "" },
        ],
      },
    });
  }

  function removeRow(index: number) {
    update({
      sizeGuide: {
        ...draft.sizeGuide,
        rows: draft.sizeGuide.rows.filter((_, i) => i !== index),
      },
    });
  }

  function updateTopic(index: number, label: string) {
    const contactTopics = draft.contactTopics.map((topic, i) =>
      i === index ? { ...topic, label } : topic,
    ) as ContactTopic[];
    update({ contactTopics });
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    setSavedOk(false);
    const payload = normalizePoliciesSettings(draft);
    const res = await apiPut<PoliciesSettings>("/api/policy-settings", payload);
    setSaving(false);
    if (res.status_code !== 200 || !res.data) {
      setError(res.message || "Could not save policy settings");
      return;
    }
    setDraft(normalizePoliciesSettings(res.data));
    setSavedOk(true);
  }

  if (loading) {
    return <p className="text-sm text-mute">Loading policy settings…</p>;
  }

  return (
    <div className="space-y-8">
      <PolicyDocumentEditor
        title="Shipping"
        document={draft.shipping}
        onChange={(shipping) => update({ shipping })}
      />
      <PolicyDocumentEditor
        title="Returns"
        document={draft.returns}
        onChange={(returns) => update({ returns })}
      />

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Size guide</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Page title">
            <input
              className={inputClass}
              value={draft.sizeGuide.title}
              onChange={(e) =>
                update({
                  sizeGuide: { ...draft.sizeGuide, title: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Intro">
            <textarea
              className={textareaClass}
              value={draft.sizeGuide.intro}
              onChange={(e) =>
                update({
                  sizeGuide: { ...draft.sizeGuide, intro: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Note">
            <textarea
              className={textareaClass}
              value={draft.sizeGuide.note}
              onChange={(e) =>
                update({
                  sizeGuide: { ...draft.sizeGuide, note: e.target.value },
                })
              }
            />
          </Field>
        </div>
        <div className="mt-6 space-y-3">
          <p className={labelClass}>Rows (inches)</p>
          {draft.sizeGuide.rows.map((row, index) => (
            <div
              key={index}
              className="grid gap-2 border border-line p-3 md:grid-cols-5"
            >
              {(["size", "chest", "length", "shoulder"] as const).map((key) => (
                <Field key={key} label={key}>
                  <input
                    className={inputClass}
                    value={row[key]}
                    onChange={(e) => updateRow(index, { [key]: e.target.value })}
                  />
                </Field>
              ))}
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="self-end cursor-pointer text-sm text-mute underline md:pb-3"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="cursor-pointer text-sm font-medium text-ink underline"
          >
            Add size row
          </button>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Contact</h2>
        <p className="mt-1 text-sm text-mute">
          Topic values are fixed to API enums; you can rename labels only.
        </p>
        <div className="mt-5 grid gap-4">
          <Field label="Contact intro">
            <textarea
              className={textareaClass}
              value={draft.contactIntro}
              onChange={(e) => update({ contactIntro: e.target.value })}
            />
          </Field>
          {draft.contactTopics.map((topic, index) => (
            <Field key={topic.value} label={`Label · ${topic.value}`}>
              <input
                className={inputClass}
                value={topic.label}
                onChange={(e) => updateTopic(index, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="cursor-pointer bg-ink px-5 py-2.5 text-[13px] font-bold tracking-[0.12em] uppercase text-paper disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save policies"}
        </button>
        {savedOk ? (
          <p className="text-sm text-mute">Saved. Help pages refresh on next load.</p>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
