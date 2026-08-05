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
export type FontScale = "sm" | "md" | "lg" | "custom";
export type ThemeSurface = "storefront" | "admin";

export type ThemeSettings = {
  themeId: string;
  colorMode: ColorMode;
  fontScale: FontScale;
  fontSizePx: number;
  displayFont: string;
  bodyFont: string;
  colors: ThemeColors;
};

export type SurfaceThemeSettings = {
  storefront: ThemeSettings;
  admin: ThemeSettings;
};

export const THEME_SURFACES: Array<{ id: ThemeSurface; name: string }> = [
  { id: "storefront", name: "Storefront" },
  { id: "admin", name: "Admin" },
];

export function isThemeSurface(value: unknown): value is ThemeSurface {
  return value === "storefront" || value === "admin";
}

export const CUSTOM_THEME_ID = "custom";

export const FONT_SCALE_OPTIONS: Array<{
  id: Exclude<FontScale, "custom">;
  name: string;
  sizePx: number;
}> = [
  { id: "sm", name: "Small", sizePx: 14 },
  { id: "md", name: "Medium", sizePx: 16 },
  { id: "lg", name: "Large", sizePx: 18 },
];

export const FONT_SIZE_PX_MIN = 12;
export const FONT_SIZE_PX_MAX = 24;

export const COLOR_MODE_OPTIONS: Array<{ id: ColorMode; name: string }> = [
  { id: "day", name: "Day" },
  { id: "night", name: "Night" },
];

export const DEFAULT_DISPLAY_FONT = "Syne";
export const DEFAULT_BODY_FONT = "Figtree";

export const GOOGLE_FONT_OPTIONS: Array<{
  id: string;
  name: string;
  role: "display" | "body" | "both";
}> = [
  { id: "Syne", name: "Syne", role: "display" },
  { id: "Figtree", name: "Figtree", role: "body" },
  { id: "Inter", name: "Inter", role: "both" },
  { id: "DM Sans", name: "DM Sans", role: "both" },
  { id: "Space Grotesk", name: "Space Grotesk", role: "display" },
  { id: "Outfit", name: "Outfit", role: "both" },
  { id: "Manrope", name: "Manrope", role: "body" },
  { id: "Plus Jakarta Sans", name: "Plus Jakarta Sans", role: "both" },
  { id: "Sora", name: "Sora", role: "both" },
  { id: "Work Sans", name: "Work Sans", role: "body" },
  { id: "Rubik", name: "Rubik", role: "both" },
  { id: "Nunito Sans", name: "Nunito Sans", role: "body" },
  { id: "Libre Franklin", name: "Libre Franklin", role: "body" },
  { id: "Playfair Display", name: "Playfair Display", role: "display" },
  { id: "Bebas Neue", name: "Bebas Neue", role: "display" },
  { id: "Archivo Black", name: "Archivo Black", role: "display" },
  { id: "Oswald", name: "Oswald", role: "display" },
  { id: "Raleway", name: "Raleway", role: "both" },
  { id: "Poppins", name: "Poppins", role: "both" },
  { id: "Montserrat", name: "Montserrat", role: "both" },
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

const fontSizeByScale = new Map(
  FONT_SCALE_OPTIONS.map((option) => [option.id, option.sizePx]),
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

export function listGoogleFonts(role?: "display" | "body") {
  if (!role) return GOOGLE_FONT_OPTIONS.map((font) => ({ ...font }));
  return GOOGLE_FONT_OPTIONS.filter(
    (font) => font.role === role || font.role === "both",
  ).map((font) => ({ ...font }));
}

export function clampFontSizePx(value: unknown, fallback = 16): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(FONT_SIZE_PX_MAX, Math.max(FONT_SIZE_PX_MIN, Math.round(n)));
}

export function fontScaleFromSizePx(sizePx: number): FontScale {
  const match = FONT_SCALE_OPTIONS.find((option) => option.sizePx === sizePx);
  return match?.id ?? "custom";
}

export function sizePxFromFontScale(
  fontScale: FontScale | undefined,
  fontSizePx?: number,
  fallback = 16,
): number {
  if (fontScale === "custom" || fontScale === undefined) {
    return clampFontSizePx(fontSizePx, fallback);
  }
  if (fontScale === "sm" || fontScale === "md" || fontScale === "lg") {
    if (fontSizePx != null && Number.isFinite(Number(fontSizePx))) {
      const px = clampFontSizePx(fontSizePx, fallback);
      if (fontScaleFromSizePx(px) === fontScale) return px;
    }
    return fontSizeByScale.get(fontScale) ?? fallback;
  }
  return clampFontSizePx(fontSizePx, fallback);
}

export function normalizeFontName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!/^[A-Za-z0-9][A-Za-z0-9 ]{0,48}[A-Za-z0-9]$|^[A-Za-z0-9]{2,50}$/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

export function fontFamilyCss(fontName: string): string {
  const safe = fontName.replace(/['"]/g, "").trim() || DEFAULT_BODY_FONT;
  return `"${safe}", system-ui, sans-serif`;
}

export function buildGoogleFontsStylesheetUrl(
  displayFont: string,
  bodyFont: string,
): string {
  const families = Array.from(
    new Set(
      [displayFont, bodyFont]
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );
  if (families.length === 0) {
    families.push(DEFAULT_DISPLAY_FONT, DEFAULT_BODY_FONT);
  }
  const query = families
    .map(
      (family) =>
        `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700;800`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
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
    fontSizePx: 16,
    displayFont: DEFAULT_DISPLAY_FONT,
    bodyFont: DEFAULT_BODY_FONT,
    colors: paletteToColors(palette),
  };
}

export function defaultSurfaceThemeSettings(
  themeId?: string,
): SurfaceThemeSettings {
  const base = defaultThemeSettings(themeId);
  return {
    storefront: { ...base, colors: { ...base.colors } },
    admin: {
      ...base,
      colorMode: "night",
      colors: { ...base.colors },
    },
  };
}

function isLegacyThemeSettingsBlob(value: unknown): value is Partial<ThemeSettings> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if ("storefront" in record || "admin" in record) return false;
  return (
    "themeId" in record ||
    "colors" in record ||
    "colorMode" in record ||
    "fontScale" in record
  );
}

export function normalizeSurfaceThemeSettings(
  input?: Partial<SurfaceThemeSettings> | Partial<ThemeSettings> | null,
  fallbackThemeId?: string,
): SurfaceThemeSettings {
  const base = defaultSurfaceThemeSettings(fallbackThemeId);
  if (!input || typeof input !== "object") return base;

  if (isLegacyThemeSettingsBlob(input)) {
    const shared = normalizeThemeSettings(input, fallbackThemeId);
    return {
      storefront: shared,
      admin: { ...shared, colors: { ...shared.colors } },
    };
  }

  const bundle = input as Partial<SurfaceThemeSettings>;
  return {
    storefront: normalizeThemeSettings(
      bundle.storefront ?? base.storefront,
      fallbackThemeId,
    ),
    admin: normalizeThemeSettings(bundle.admin ?? base.admin, fallbackThemeId),
  };
}

export function pickSurfaceTheme(
  bundle: SurfaceThemeSettings,
  surface: ThemeSurface,
): ThemeSettings {
  return bundle[surface];
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

  const rawScale = input?.fontScale;
  const explicitCustomScale = rawScale === "custom";
  let fontScale: FontScale =
    rawScale === "sm" ||
    rawScale === "md" ||
    rawScale === "lg" ||
    rawScale === "custom"
      ? rawScale
      : base.fontScale;

  const fontSizePx = sizePxFromFontScale(
    fontScale,
    input?.fontSizePx ?? base.fontSizePx,
    base.fontSizePx,
  );
  if (!explicitCustomScale) {
    fontScale = fontScaleFromSizePx(fontSizePx);
  } else {
    fontScale = "custom";
  }

  const displayFont = normalizeFontName(
    input?.displayFont,
    base.displayFont,
  );
  const bodyFont = normalizeFontName(input?.bodyFont, base.bodyFont);

  const hasCustomColors =
    input?.colors != null && typeof input.colors === "object";
  const presetBase =
    requestedId === CUSTOM_THEME_ID
      ? hasCustomColors
        ? normalizeThemeColors(input.colors, base.colors)
        : base.colors
      : paletteToColors(resolveTheme(requestedId));
  const colors = normalizeThemeColors(
    hasCustomColors ? input.colors : presetBase,
    presetBase,
  );

  let themeId = requestedId;
  if (requestedId === CUSTOM_THEME_ID) {
    themeId = CUSTOM_THEME_ID;
  } else if (themeById.has(requestedId)) {
    if (!colorsEqual(colors, paletteToColors(resolveTheme(requestedId)))) {
      themeId = CUSTOM_THEME_ID;
    }
  } else {
    const match = themePalettes.find((palette) =>
      colorsEqual(paletteToColors(palette), colors),
    );
    themeId = match?.id ?? CUSTOM_THEME_ID;
  }

  return {
    themeId,
    colorMode,
    fontScale,
    fontSizePx,
    displayFont,
    bodyFont,
    colors,
  };
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
  options: {
    colorMode?: ColorMode;
    fontScale?: FontScale;
    fontSizePx?: number;
    displayFont?: string;
    bodyFont?: string;
  } = {},
): Record<string, string> {
  const colorMode = options.colorMode ?? "day";
  const display = resolveDisplayPalette(theme, colorMode);
  const fontSizePx = sizePxFromFontScale(
    options.fontScale,
    options.fontSizePx,
    16,
  );
  const isNight = colorMode === "night";
  const dayInk = theme.ink;
  const displayFont = normalizeFontName(
    options.displayFont,
    DEFAULT_DISPLAY_FONT,
  );
  const bodyFont = normalizeFontName(options.bodyFont, DEFAULT_BODY_FONT);
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
    "--font-scale": String(fontSizePx / 16),
    "--font-size-base": `${fontSizePx}px`,
    "--font-display-family": fontFamilyCss(displayFont),
    "--font-sans-family": fontFamilyCss(bodyFont),
  };
}

export function themeToCssText(
  theme: ThemePalette,
  options: {
    colorMode?: ColorMode;
    fontScale?: FontScale;
    fontSizePx?: number;
    displayFont?: string;
    bodyFont?: string;
  } = {},
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
    fontSizePx: normalized.fontSizePx,
    displayFont: normalized.displayFont,
    bodyFont: normalized.bodyFont,
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
