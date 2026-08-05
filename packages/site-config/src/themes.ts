export type ThemePalette = {
  id: string;
  name: string;
  ink: string;
  paper: string;
  mist: string;
  mute: string;
  accent: string;
  accentInk: string;
  panel: string;
  line: string;
};

export type ThemeColors = {
  ink: string;
  paper: string;
  mist: string;
  mute: string;
  accent: string;
  accentInk: string;
  panel: string;
  line: string;
};

export type ColorMode = "day" | "night";
export type FontScale = "sm" | "md" | "lg";

export type ThemeSettings = {
  themeId: string;
  colorMode: ColorMode;
  fontScale: FontScale;
  colors: ThemeColors;
};

export const CUSTOM_THEME_ID = "custom";

export const FONT_SCALE_OPTIONS: Array<{
  id: FontScale;
  name: string;
  scale: number;
}> = [
  { id: "sm", name: "Small", scale: 0.925 },
  { id: "md", name: "Medium", scale: 1 },
  { id: "lg", name: "Large", scale: 1.075 },
];

export const COLOR_MODE_OPTIONS: Array<{ id: ColorMode; name: string }> = [
  { id: "day", name: "Day" },
  { id: "night", name: "Night" },
];

export const THEME_COLOR_FIELDS: Array<{
  key: keyof ThemeColors;
  label: string;
  hint: string;
}> = [
  { key: "accent", label: "Accent", hint: "Primary highlight / brand accent" },
  { key: "accentInk", label: "Accent text", hint: "Text on accent backgrounds" },
  { key: "ink", label: "Text / ink", hint: "Main text and solid buttons (day)" },
  { key: "paper", label: "Background", hint: "Page background" },
  { key: "panel", label: "Panel", hint: "Cards and elevated surfaces" },
  { key: "mist", label: "Mist", hint: "Subtle surface / wash" },
  { key: "mute", label: "Muted text", hint: "Secondary labels" },
  { key: "line", label: "Border / line", hint: "Dividers and borders (hex or rgba)" },
];

export const themePalettes = [
  {
    id: "rush-volt",
    name: "Rush Volt",
    ink: "#0e0e0e",
    paper: "#f4f1ea",
    mist: "#e8e3d8",
    mute: "#6a655c",
    accent: "#d4ff4a",
    accentInk: "#142000",
    panel: "#fffcf8",
    line: "rgba(14, 14, 14, 0.12)",
  },
  {
    id: "ink-lime",
    name: "Ink Lime",
    ink: "#141414",
    paper: "#f3f1ec",
    mist: "#e6e2d9",
    mute: "#6a655c",
    accent: "#c8f542",
    accentInk: "#1a2200",
    panel: "#fffcf8",
    line: "rgba(20, 20, 20, 0.1)",
  },
  {
    id: "ocean-slate",
    name: "Ocean Slate",
    ink: "#0f1c24",
    paper: "#eef3f6",
    mist: "#d9e3ea",
    mute: "#5c6b75",
    accent: "#3ec6c4",
    accentInk: "#042221",
    panel: "#f7fbfc",
    line: "rgba(15, 28, 36, 0.12)",
  },
  {
    id: "berry-dusk",
    name: "Berry Dusk",
    ink: "#1a1218",
    paper: "#f6f0f3",
    mist: "#e8dce3",
    mute: "#6f5c66",
    accent: "#e85d8a",
    accentInk: "#2a0614",
    panel: "#fffafc",
    line: "rgba(26, 18, 24, 0.12)",
  },
  {
    id: "amber-studio",
    name: "Amber Studio",
    ink: "#1c140c",
    paper: "#f7f1e8",
    mist: "#eadfce",
    mute: "#6e6154",
    accent: "#f0a202",
    accentInk: "#2a1800",
    panel: "#fffaf3",
    line: "rgba(28, 20, 12, 0.12)",
  },
  {
    id: "graphite-signal",
    name: "Graphite Signal",
    ink: "#111111",
    paper: "#f0f0ee",
    mist: "#e0e0dc",
    mute: "#5f5f5a",
    accent: "#5b8cff",
    accentInk: "#04122e",
    panel: "#fafaf8",
    line: "rgba(17, 17, 17, 0.12)",
  },
] as const satisfies readonly ThemePalette[];

export type ThemeId = (typeof themePalettes)[number]["id"] | typeof CUSTOM_THEME_ID;

const themeById = new Map<string, ThemePalette>(
  themePalettes.map((theme) => [theme.id, theme]),
);

const fontScaleById = new Map(
  FONT_SCALE_OPTIONS.map((option) => [option.id, option.scale]),
);

export function resolveTheme(themeId?: string | null): ThemePalette {
  if (themeId && themeId !== CUSTOM_THEME_ID) {
    const match = themeById.get(themeId);
    if (match) return match;
  }
  return themePalettes[0];
}

export function listThemePalettes(): ThemePalette[] {
  return themePalettes.map((theme) => ({ ...theme }));
}

export function paletteToColors(palette: ThemePalette): ThemeColors {
  return {
    ink: palette.ink,
    paper: palette.paper,
    mist: palette.mist,
    mute: palette.mute,
    accent: palette.accent,
    accentInk: palette.accentInk,
    panel: palette.panel,
    line: palette.line,
  };
}

export function colorsEqual(a: ThemeColors, b: ThemeColors): boolean {
  return (
    a.ink === b.ink &&
    a.paper === b.paper &&
    a.mist === b.mist &&
    a.mute === b.mute &&
    a.accent === b.accent &&
    a.accentInk === b.accentInk &&
    a.panel === b.panel &&
    a.line === b.line
  );
}

function parseHex(value: string): { r: number; g: number; b: number } | null {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return {
      r: parseInt(raw[0] + raw[0], 16),
      g: parseInt(raw[1] + raw[1], 16),
      b: parseInt(raw[2] + raw[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }
  return null;
}

export function isValidColorValue(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (parseHex(v)) return true;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(v)) {
    return true;
  }
  if (/^hsla?\(/i.test(v)) return true;
  return false;
}

export function normalizeColorValue(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (!isValidColorValue(trimmed)) return fallback;
  if (parseHex(trimmed) && !trimmed.startsWith("#")) {
    return `#${trimmed}`;
  }
  return trimmed;
}

export function lineFromInk(ink: string, alpha = 0.12): string {
  const hex = parseHex(ink);
  if (!hex) return `rgba(14, 14, 14, ${alpha})`;
  return `rgba(${hex.r}, ${hex.g}, ${hex.b}, ${alpha})`;
}

export function toColorPickerValue(value: string): string {
  const hex = parseHex(value);
  if (!hex) return "#0e0e0e";
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(hex.r)}${to(hex.g)}${to(hex.b)}`;
}

export function normalizeThemeColors(
  input?: Partial<ThemeColors> | null,
  fallback?: ThemeColors,
): ThemeColors {
  const base = fallback ?? paletteToColors(themePalettes[0]);
  const ink = normalizeColorValue(input?.ink, base.ink);
  return {
    ink,
    paper: normalizeColorValue(input?.paper, base.paper),
    mist: normalizeColorValue(input?.mist, base.mist),
    mute: normalizeColorValue(input?.mute, base.mute),
    accent: normalizeColorValue(input?.accent, base.accent),
    accentInk: normalizeColorValue(input?.accentInk, base.accentInk),
    panel: normalizeColorValue(input?.panel, base.panel),
    line: normalizeColorValue(input?.line, base.line || lineFromInk(ink)),
  };
}

export function resolveThemeFromSettings(
  settings: ThemeSettings,
  fallbackThemeId?: string,
): ThemePalette {
  const normalized = normalizeThemeSettings(settings, fallbackThemeId);
  const preset =
    normalized.themeId === CUSTOM_THEME_ID
      ? resolveTheme(fallbackThemeId)
      : resolveTheme(normalized.themeId);
  const colors = normalized.colors;
  const matched = themePalettes.find((palette) =>
    colorsEqual(paletteToColors(palette), colors),
  );
  return {
    id: matched?.id ?? CUSTOM_THEME_ID,
    name: matched?.name ?? "Custom",
    ...colors,
  };
}

export function defaultThemeSettings(themeId?: string): ThemeSettings {
  const palette = resolveTheme(themeId);
  return {
    themeId: palette.id,
    colorMode: "day",
    fontScale: "md",
    colors: paletteToColors(palette),
  };
}

export function normalizeThemeSettings(
  input?: Partial<ThemeSettings> | null,
  fallbackThemeId?: string,
): ThemeSettings {
  const base = defaultThemeSettings(fallbackThemeId);
  const requestedId =
    typeof input?.themeId === "string" && input.themeId.trim()
      ? input.themeId.trim()
      : base.themeId;

  const colorMode: ColorMode =
    input?.colorMode === "night" || input?.colorMode === "day"
      ? input.colorMode
      : base.colorMode;
  const fontScale: FontScale =
    input?.fontScale === "sm" ||
    input?.fontScale === "md" ||
    input?.fontScale === "lg"
      ? input.fontScale
      : base.fontScale;

  const presetBase =
    requestedId === CUSTOM_THEME_ID
      ? base.colors
      : paletteToColors(resolveTheme(requestedId));

  const hasCustomColors =
    input?.colors != null && typeof input.colors === "object";
  const colors = normalizeThemeColors(
    hasCustomColors ? input.colors : presetBase,
    presetBase,
  );

  let themeId = requestedId;
  if (requestedId !== CUSTOM_THEME_ID && themeById.has(requestedId)) {
    if (!colorsEqual(colors, paletteToColors(resolveTheme(requestedId)))) {
      themeId = CUSTOM_THEME_ID;
    }
  } else if (requestedId !== CUSTOM_THEME_ID) {
    const match = themePalettes.find((palette) =>
      colorsEqual(paletteToColors(palette), colors),
    );
    themeId = match?.id ?? CUSTOM_THEME_ID;
  } else {
    const match = themePalettes.find((palette) =>
      colorsEqual(paletteToColors(palette), colors),
    );
    themeId = match?.id ?? CUSTOM_THEME_ID;
  }

  return { themeId, colorMode, fontScale, colors };
}

export function resolveDisplayPalette(
  theme: ThemePalette,
  colorMode: ColorMode = "day",
): ThemePalette {
  if (colorMode === "day") return theme;
  return {
    ...theme,
    ink: "#f2efe8",
    paper: "#101010",
    mist: "#1a1a1a",
    mute: "#a39e95",
    panel: "#171717",
    line: "rgba(242, 239, 232, 0.12)",
    accent: theme.accent,
    accentInk: theme.accentInk,
  };
}

export function themeToCssVars(
  theme: ThemePalette,
  options: { colorMode?: ColorMode; fontScale?: FontScale } = {},
): Record<string, string> {
  const colorMode = options.colorMode ?? "day";
  const display = resolveDisplayPalette(theme, colorMode);
  const scale = fontScaleById.get(options.fontScale ?? "md") ?? 1;
  const isNight = colorMode === "night";
  const dayInk = theme.ink;
  return {
    "--ink": display.ink,
    "--paper": display.paper,
    "--mist": display.mist,
    "--mute": display.mute,
    "--volt": display.accent,
    "--volt-ink": display.accentInk,
    "--line": display.line,
    "--background": display.paper,
    "--foreground": display.ink,
    "--bg": display.paper,
    "--panel": display.panel,
    "--accent": display.accent,
    "--accent-ink": display.accentInk,
    "--btn": isNight ? "#0e0e0e" : dayInk,
    "--btn-fg": isNight ? "#f2efe8" : "#ffffff",
    "--font-scale": String(scale),
  };
}

export function themeToCssText(
  theme: ThemePalette,
  options: { colorMode?: ColorMode; fontScale?: FontScale } = {},
): string {
  return Object.entries(themeToCssVars(theme, options))
    .map(([key, value]) => `${key}:${value};`)
    .join("");
}

export function themeSettingsToCssVars(
  settings: ThemeSettings,
  fallbackThemeId?: string,
): Record<string, string> {
  const normalized = normalizeThemeSettings(settings, fallbackThemeId);
  const theme = resolveThemeFromSettings(normalized, fallbackThemeId);
  return themeToCssVars(theme, {
    colorMode: normalized.colorMode,
    fontScale: normalized.fontScale,
  });
}

export function themeSettingsToCssText(
  settings: ThemeSettings,
  fallbackThemeId?: string,
): string {
  return Object.entries(themeSettingsToCssVars(settings, fallbackThemeId))
    .map(([key, value]) => `${key}:${value};`)
    .join("");
}
