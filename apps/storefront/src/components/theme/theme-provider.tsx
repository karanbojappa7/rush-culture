"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  brand,
  defaultThemeSettings,
  listThemePalettes,
  normalizeThemeSettings,
  resolveDisplayPalette,
  resolveThemeFromSettings,
  themeSettingsToCssVars,
  type ThemePalette,
  type ThemeSettings,
} from "@linq/site-config";
import { apiGet } from "@/lib/api";
import { applyThemeFontsToDocument } from "@/components/theme/apply-theme-fonts";

type ThemeContextValue = {
  settings: ThemeSettings;
  theme: ThemePalette;
  displayTheme: ThemePalette;
  palettes: ThemePalette[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applySettings(settings: ThemeSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const normalized = normalizeThemeSettings(settings, brand.themeId);
  const theme = resolveThemeFromSettings(normalized, brand.themeId);
  const vars = themeSettingsToCssVars(normalized, brand.themeId);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  applyThemeFontsToDocument({
    displayFont: normalized.displayFont,
    bodyFont: normalized.bodyFont,
  });
  root.dataset.theme = theme.id;
  root.dataset.colorMode = normalized.colorMode;
  root.dataset.fontScale = normalized.fontScale;
  root.dataset.fontSize = String(normalized.fontSizePx);
  root.dataset.themeSurface = "storefront";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const palettes = useMemo(() => listThemePalettes(), []);
  const [settings, setSettings] = useState<ThemeSettings>(() =>
    defaultThemeSettings(brand.themeId),
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<ThemeSettings>(
      "/api/theme-settings?surface=storefront",
    );
    if (res.status_code === 200 && res.data) {
      const next = normalizeThemeSettings(res.data, brand.themeId);
      setSettings(next);
      applySettings(next);
    } else {
      const fallback = defaultThemeSettings(brand.themeId);
      setSettings(fallback);
      applySettings(fallback);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = resolveThemeFromSettings(settings, brand.themeId);
    return {
      settings,
      theme,
      displayTheme: resolveDisplayPalette(theme, settings.colorMode),
      palettes,
      loading,
      refresh,
    };
  }, [settings, palettes, loading, refresh]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
