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
import { apiGet, apiPut } from "@/lib/api";
import { hasPermission, type SessionUser } from "@/lib/session-shared";
import { applyThemeFontsToDocument } from "@/components/theme/apply-theme-fonts";

type ThemeContextValue = {
  settings: ThemeSettings;
  theme: ThemePalette;
  displayTheme: ThemePalette;
  palettes: ThemePalette[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  canManage: boolean;
  refresh: () => Promise<void>;
  saveSettings: (next: ThemeSettings) => Promise<boolean>;
  previewSettings: (next: ThemeSettings | Partial<ThemeSettings>) => void;
  applyLive: (next: ThemeSettings) => void;
  restoreLive: () => void;
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
  root.dataset.themeSurface = "admin";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const palettes = useMemo(() => listThemePalettes(), []);
  const [settings, setSettings] = useState<ThemeSettings>(() =>
    defaultThemeSettings(brand.themeId),
  );
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [themeRes, meRes] = await Promise.all([
      apiGet<ThemeSettings>("/api/theme-settings?surface=admin"),
      apiGet<SessionUser>("/api/auth/me"),
    ]);
    if (themeRes.status_code === 200 && themeRes.data) {
      const next = normalizeThemeSettings(themeRes.data, brand.themeId);
      setSettings(next);
      applySettings(next);
    } else {
      const fallback = defaultThemeSettings(brand.themeId);
      setSettings(fallback);
      applySettings(fallback);
    }
    if (meRes.status_code === 200 && meRes.data) {
      setCanManage(hasPermission(meRes.data, "theming.manage"));
    } else {
      setCanManage(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const previewSettings = useCallback(
    (next: ThemeSettings | Partial<ThemeSettings>) => {
      setSettings((prev) =>
        normalizeThemeSettings({ ...prev, ...next }, brand.themeId),
      );
    },
    [],
  );

  const applyLive = useCallback((next: ThemeSettings) => {
    applySettings(normalizeThemeSettings(next, brand.themeId));
  }, []);

  const restoreLive = useCallback(() => {
    applySettings(settings);
  }, [settings]);

  const saveSettings = useCallback(
    async (next: ThemeSettings) => {
      if (!canManage) return false;
      setSaving(true);
      setError(null);
      const payload = {
        surface: "admin" as const,
        ...normalizeThemeSettings(next, brand.themeId),
      };
      const res = await apiPut<ThemeSettings>("/api/theme-settings", payload);
      setSaving(false);
      if (res.status_code !== 200 || !res.data) {
        setError(res.message || "Could not save theme settings");
        return false;
      }
      const saved = normalizeThemeSettings(res.data, brand.themeId);
      setSettings(saved);
      applySettings(saved);
      return true;
    },
    [canManage],
  );

  const value = useMemo<ThemeContextValue>(() => {
    const theme = resolveThemeFromSettings(settings, brand.themeId);
    return {
      settings,
      theme,
      displayTheme: resolveDisplayPalette(theme, settings.colorMode),
      palettes,
      loading,
      saving,
      error,
      canManage,
      refresh,
      previewSettings,
      saveSettings,
      applyLive,
      restoreLive,
    };
  }, [
    settings,
    palettes,
    loading,
    saving,
    error,
    canManage,
    refresh,
    previewSettings,
    saveSettings,
    applyLive,
    restoreLive,
  ]);

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
