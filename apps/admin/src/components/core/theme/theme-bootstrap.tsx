import {
  brand,
  defaultThemeSettings,
  themeSettingsToCssText,
} from "@linq/site-config";

export function ThemeBootstrap() {
  const settings = defaultThemeSettings(brand.themeId);
  const css = themeSettingsToCssText(settings, brand.themeId);
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{${css}}html{font-size:var(--font-size-base,calc(16px * var(--font-scale, 1)));}`,
      }}
    />
  );
}
