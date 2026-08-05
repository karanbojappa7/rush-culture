import { Injectable } from '@nestjs/common';
import {
  brand,
  defaultThemeSettings,
  normalizeThemeSettings,
  type ThemeSettings,
} from '@linq/site-config';
import { AppConfigRepo } from '../../module/core/app-config/app-config.repo';

export const THEME_SETTINGS_KEY = 'ui.theme';

@Injectable()
export class ThemeSettingsService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {}

  async get(): Promise<ThemeSettings> {
    const row = await this.appConfigRepo.findByKey(THEME_SETTINGS_KEY);
    if (!row?.value) {
      return defaultThemeSettings(brand.themeId);
    }
    try {
      const parsed = JSON.parse(row.value) as Partial<ThemeSettings>;
      return normalizeThemeSettings(parsed, brand.themeId);
    } catch {
      return defaultThemeSettings(brand.themeId);
    }
  }

  async update(input: Partial<ThemeSettings>): Promise<ThemeSettings> {
    const next = normalizeThemeSettings(input, brand.themeId);
    const existing = await this.appConfigRepo.findByKey(THEME_SETTINGS_KEY);
    const value = JSON.stringify(next);
    if (existing) {
      await this.appConfigRepo.update(existing.id, {
        value,
        isActive: true,
        description: 'Storefront and admin theme settings',
      });
    } else {
      await this.appConfigRepo.create({
        key: THEME_SETTINGS_KEY,
        value,
        isActive: true,
        description: 'Storefront and admin theme settings',
      });
    }
    return next;
  }
}
