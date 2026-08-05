"use client";

import { useEffect, useState } from "react";
import {
  COLOR_MODE_OPTIONS,
  CUSTOM_THEME_ID,
  FONT_SCALE_OPTIONS,
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  THEME_COLOR_FIELDS,
  lineFromInk,
  listGoogleFonts,
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

const CUSTOM_FONT = "__custom__";

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
  const [customDisplayFont, setCustomDisplayFont] = useState(false);
  const [customBodyFont, setCustomBodyFont] = useState(false);

  const displayFontOptions = listGoogleFonts("display");
  const bodyFontOptions = listGoogleFonts("body");

  useEffect(() => {
    setDraft(settings);
    setCustomDisplayFont(
      !listGoogleFonts("display").some((font) => font.id === settings.displayFont),
    );
    setCustomBodyFont(
      !listGoogleFonts("body").some((font) => font.id === settings.bodyFont),
    );
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
    setSavedOk(false);
    const nextColors = { ...draft.colors, [key]: value };
    if (key === "ink" && !draft.colors.line.startsWith("rgba")) {
      nextColors.line = lineFromInk(value);
    }
    const next = {
      ...draft,
      themeId: CUSTOM_THEME_ID,
      colors: nextColors,
    } as ThemeSettings;
    setDraft(next);
    previewSettings(next);
  }

  function resetLineFromInk() {
    setSavedOk(false);
    const next = {
      ...draft,
      themeId: CUSTOM_THEME_ID,
      colors: {
        ...draft.colors,
        line: lineFromInk(draft.colors.ink),
      },
    } as ThemeSettings;
    setDraft(next);
    previewSettings(next);
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

  const isCustomColors = draft.themeId === CUSTOM_THEME_ID;
  const isCustomFontSize = draft.fontScale === "custom";

  return (
    <div className="space-y-8">
      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Color palette</h2>
        <p className="mt-1 text-sm text-mute">
          Choose a preset, or Custom to edit individual colors.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {palettes.map((palette) => {
            const active = !isCustomColors && draft.themeId === palette.id;
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
              isCustomColors
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

        {isCustomColors ? (
          <div className="mt-8 border-t border-line pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold">Custom colors</h3>
                <p className="mt-1 text-sm text-mute">
                  Pick hex/rgba values for the storefront palette.
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
                        className={`${inputClass} mt-0`}
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
              <span
                className="w-1/4"
                style={{ background: draft.colors.paper }}
              />
              <span
                className="w-1/4"
                style={{ background: draft.colors.panel }}
              />
              <span
                className="w-1/4"
                style={{ background: draft.colors.accent }}
              />
              <span className="w-1/4" style={{ background: draft.colors.ink }} />
            </div>
          </div>
        ) : null}
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
        <h2 className="font-display text-xl font-bold">Google fonts</h2>
        <p className="mt-1 text-sm text-mute">
          Pick a listed font, or Custom to enter any Google Font name.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={labelClass}>
            Display / headings
            <select
              className={inputClass}
              value={customDisplayFont ? CUSTOM_FONT : draft.displayFont}
              onChange={(e) => {
                if (e.target.value === CUSTOM_FONT) {
                  setCustomDisplayFont(true);
                  return;
                }
                setCustomDisplayFont(false);
                updateDraft({ displayFont: e.target.value });
              }}
            >
              {displayFontOptions.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
              <option value={CUSTOM_FONT}>Custom…</option>
            </select>
            {customDisplayFont ? (
              <input
                className={`${inputClass} mt-2`}
                value={draft.displayFont}
                onChange={(e) => updateDraft({ displayFont: e.target.value })}
                placeholder="Google Font name (e.g. Space Grotesk)"
                spellCheck={false}
              />
            ) : null}
          </label>
          <label className={labelClass}>
            Body / UI
            <select
              className={inputClass}
              value={customBodyFont ? CUSTOM_FONT : draft.bodyFont}
              onChange={(e) => {
                if (e.target.value === CUSTOM_FONT) {
                  setCustomBodyFont(true);
                  return;
                }
                setCustomBodyFont(false);
                updateDraft({ bodyFont: e.target.value });
              }}
            >
              {bodyFontOptions.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
              <option value={CUSTOM_FONT}>Custom…</option>
            </select>
            {customBodyFont ? (
              <input
                className={`${inputClass} mt-2`}
                value={draft.bodyFont}
                onChange={(e) => updateDraft({ bodyFont: e.target.value })}
                placeholder="Google Font name (e.g. Inter)"
                spellCheck={false}
              />
            ) : null}
          </label>
        </div>
        <p
          className="mt-5 text-2xl font-bold tracking-tight text-ink"
          style={{ fontFamily: `"${draft.displayFont}", system-ui, sans-serif` }}
        >
          Display: The drop never sleeps
        </p>
        <p
          className="mt-2 text-base text-mute"
          style={{ fontFamily: `"${draft.bodyFont}", system-ui, sans-serif` }}
        >
          Body: Street-ready fits, oversized tees, cargos, and limited drops.
        </p>
      </section>

      <section className="border border-line bg-panel p-5 md:p-6">
        <h2 className="font-display text-xl font-bold">Font size</h2>
        <p className="mt-1 text-sm text-mute">
          Choose a preset, or Custom for a precise base size.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {FONT_SCALE_OPTIONS.map((option) => {
            const active =
              !isCustomFontSize &&
              draft.fontScale === option.id &&
              draft.fontSizePx === option.sizePx;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  updateDraft({
                    fontScale: option.id as FontScale,
                    fontSizePx: option.sizePx,
                  })
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
          <button
            type="button"
            onClick={() =>
              updateDraft({
                fontScale: "custom",
                fontSizePx: draft.fontSizePx,
              })
            }
            className={`cursor-pointer border px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
              isCustomFontSize
                ? "border-btn bg-btn text-btn-fg"
                : "border-line text-mute hover:border-ink/40 hover:text-ink"
            }`}
          >
            Custom
          </button>
        </div>

        {isCustomFontSize ? (
          <div className="mt-5 border-t border-line pt-5">
            <div className="grid max-w-md gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className={labelClass}>
                Base size (px)
                <input
                  type="range"
                  min={FONT_SIZE_PX_MIN}
                  max={FONT_SIZE_PX_MAX}
                  step={1}
                  value={draft.fontSizePx}
                  onChange={(e) => {
                    const fontSizePx = Number(e.target.value);
                    updateDraft({
                      fontSizePx,
                      fontScale: "custom",
                    });
                  }}
                  className="mt-3 w-full cursor-pointer"
                />
              </label>
              <input
                type="number"
                min={FONT_SIZE_PX_MIN}
                max={FONT_SIZE_PX_MAX}
                value={draft.fontSizePx}
                onChange={(e) => {
                  const fontSizePx = Number(e.target.value);
                  updateDraft({
                    fontSizePx,
                    fontScale: "custom",
                  });
                }}
                className={`${inputClass} w-24`}
              />
            </div>
            <p className="mt-4 text-ink" style={{ fontSize: "1rem" }}>
              Preview at {draft.fontSizePx}px base — Street-ready fits,
              oversized tees, cargos.
            </p>
          </div>
        ) : null}
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
