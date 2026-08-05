"use client";

import { useEffect, useState } from "react";
import {
  COLOR_MODE_OPTIONS,
  CUSTOM_THEME_ID,
  FONT_SCALE_OPTIONS,
  THEME_COLOR_FIELDS,
  colorsEqual,
  lineFromInk,
  paletteToColors,
  toColorPickerValue,
  type ColorMode,
  type FontScale,
  type ThemeColors,
  type ThemeSettings,
} from "@linq/site-config";
import { useTheme } from "@/components/theme/theme-provider";

const labelClass =
  "block text-[12px] font-medium tracking-[0.14em] uppercase text-mute";
const inputClass =
  "mt-1.5 w-full border border-line bg-panel px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40";

export function ThemingControlPanel() {
  const {
    settings,
    palettes,
    previewSettings,
    saveSettings,
    refresh,
    saving,
    error,
  } = useTheme();
  const [draft, setDraft] = useState<ThemeSettings>(settings);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function updateDraft(partial: Partial<ThemeSettings>) {
    setSavedOk(false);
    const next = { ...draft, ...partial } as ThemeSettings;
    setDraft(next);
    previewSettings(next);
  }

  function selectPreset(themeId: string) {
    const palette = palettes.find((item) => item.id === themeId);
    if (!palette) return;
    updateDraft({
      themeId: palette.id,
      colors: paletteToColors(palette),
    });
  }

  function updateColor(key: keyof ThemeColors, value: string) {
    const nextColors = { ...draft.colors, [key]: value };
    if (key === "ink" && !draft.colors.line.startsWith("rgba")) {
      nextColors.line = lineFromInk(value);
    }
    updateDraft({
      themeId: CUSTOM_THEME_ID,
      colors: nextColors,
    });
  }

  function resetLineFromInk() {
    updateDraft({
      themeId: CUSTOM_THEME_ID,
      colors: {
        ...draft.colors,
        line: lineFromInk(draft.colors.ink),
      },
    });
  }

  async function onSave() {
    setSavedOk(false);
    const ok = await saveSettings(draft);
    if (ok) setSavedOk(true);
  }

  async function onResetPreview() {
    setSavedOk(false);
    await refresh();
  }

  const isCustom =
    draft.themeId === CUSTOM_THEME_ID ||
    !palettes.some((palette) =>
      colorsEqual(paletteToColors(palette), draft.colors),
    );

  return (
    <div className="space-y-8">
      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Color palette</h2>
        <p className="mt-1 text-sm text-mute">
          Presets or custom colors. Applied primarily on the storefront.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {palettes.map((palette) => {
            const active =
              !isCustom && draft.themeId === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => selectPreset(palette.id)}
                className={`cursor-pointer border p-4 text-left transition-colors ${
                  active
                    ? "border-btn bg-btn text-btn-fg"
                    : "border-line hover:border-ink/40"
                }`}
              >
                <span
                  className="mb-3 flex h-10 w-full overflow-hidden border border-black/10"
                  aria-hidden
                >
                  <span
                    className="h-full w-1/2"
                    style={{ background: palette.paper }}
                  />
                  <span
                    className="h-full w-1/2"
                    style={{ background: palette.accent }}
                  />
                </span>
                <span className="block text-sm font-semibold tracking-[0.08em] uppercase">
                  {palette.name}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() =>
              updateDraft({
                themeId: CUSTOM_THEME_ID,
                colors: { ...draft.colors },
              })
            }
            className={`cursor-pointer border p-4 text-left transition-colors ${
              isCustom
                ? "border-btn bg-btn text-btn-fg"
                : "border-line hover:border-ink/40"
            }`}
          >
            <span
              className="mb-3 flex h-10 w-full overflow-hidden border border-black/10"
              aria-hidden
            >
              <span
                className="h-full w-1/3"
                style={{ background: draft.colors.paper }}
              />
              <span
                className="h-full w-1/3"
                style={{ background: draft.colors.accent }}
              />
              <span
                className="h-full w-1/3"
                style={{ background: draft.colors.ink }}
              />
            </span>
            <span className="block text-sm font-semibold tracking-[0.08em] uppercase">
              Custom
            </span>
          </button>
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Custom colors</h2>
            <p className="mt-1 text-sm text-mute">
              Pick any colors. Editing switches mode to Custom.
            </p>
          </div>
          <button
            type="button"
            onClick={resetLineFromInk}
            className="cursor-pointer border border-line px-3 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-mute transition-colors hover:border-ink/40 hover:text-ink"
          >
            Auto border from ink
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {THEME_COLOR_FIELDS.map((field) => {
            const value = draft.colors[field.key];
            const pickerValue = toColorPickerValue(value);
            return (
              <label key={field.key} className={labelClass}>
                {field.label}
                <span className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={pickerValue}
                    onChange={(e) => updateColor(field.key, e.target.value)}
                    className="h-10 w-12 shrink-0 cursor-pointer border border-line bg-panel p-1"
                    aria-label={`${field.label} picker`}
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateColor(field.key, e.target.value)}
                    className={inputClass + " mt-0"}
                    spellCheck={false}
                  />
                </span>
                <span className="mt-1 block normal-case tracking-normal font-normal text-[11px] text-mute/80">
                  {field.hint}
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-5 flex h-14 overflow-hidden border border-line">
          <span className="w-1/4" style={{ background: draft.colors.paper }} />
          <span className="w-1/4" style={{ background: draft.colors.panel }} />
          <span className="w-1/4" style={{ background: draft.colors.accent }} />
          <span className="w-1/4" style={{ background: draft.colors.ink }} />
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Day / night</h2>
        <p className="mt-1 text-sm text-mute">
          Night mode darkens surfaces while keeping the accent color.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {COLOR_MODE_OPTIONS.map((option) => {
            const active = draft.colorMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateDraft({ colorMode: option.id as ColorMode })
                }
                className={`cursor-pointer border px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "border-btn bg-btn text-btn-fg"
                    : "border-line text-mute hover:border-ink/40 hover:text-ink"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Font size</h2>
        <p className="mt-1 text-sm text-mute">
          Scales base type across storefront and admin UIs.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FONT_SCALE_OPTIONS.map((option) => {
            const active = draft.fontScale === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateDraft({ fontScale: option.id as FontScale })
                }
                className={`cursor-pointer border px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "border-btn bg-btn text-btn-fg"
                    : "border-line text-mute hover:border-ink/40 hover:text-ink"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-ink" style={{ fontSize: "1rem" }}>
          Preview sentence: Street-ready fits, oversized tees, cargos.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="cursor-pointer bg-btn px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-btn-fg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save theme"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void onResetPreview()}
          className="cursor-pointer border border-line px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-mute transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
        >
          Discard preview
        </button>
        {savedOk ? (
          <p className="text-sm text-mute">Saved for the storefront.</p>
        ) : null}
        {error ? <p className="text-sm text-mute">{error}</p> : null}
      </div>
    </div>
  );
}
