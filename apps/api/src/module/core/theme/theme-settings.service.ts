import { Injectable } from '@nestjs/common';
import {
  brand,
  defaultSurfaceThemeSettings,
  isThemeSurface,
  normalizeSurfaceThemeSettings,
  normalizeThemeSettings,
  pickSurfaceTheme,
  type SurfaceThemeSettings,
  type ThemeSettings,
  type ThemeSurface,
} from '@linq/site-config';
import { BaseService } from '../../../common/base/base.service';
import { AppConfigRepo } from '../app-config/app-config.repo';

export const THEME_SETTINGS_KEY = 'ui.theme';

@Injectable()
export class ThemeSettingsService extends BaseService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {
    super(ThemeSettingsService.name);
  }

  async getAll(): Promise<SurfaceThemeSettings> {
    const row = await this.appConfigRepo.findByKey(THEME_SETTINGS_KEY);
    if (!row?.value) {
      return defaultSurfaceThemeSettings(brand.themeId);
    }
    try {
      const parsed = JSON.parse(row.value) as unknown;
      return normalizeSurfaceThemeSettings(
        parsed as Partial<SurfaceThemeSettings>,
        brand.themeId,
      );
    } catch {
      return defaultSurfaceThemeSettings(brand.themeId);
    }
  }

  async getSurface(surface: ThemeSurface): Promise<ThemeSettings> {
    const bundle = await this.getAll();
    return pickSurfaceTheme(bundle, surface);
  }

  async updateSurface(
    surface: ThemeSurface,
    input: Partial<ThemeSettings>,
  ): Promise<ThemeSettings> {
    if (!isThemeSurface(surface)) {
      surface = 'storefront';
    }
    const bundle = await this.getAll();
    const nextSurface = normalizeThemeSettings(input, brand.themeId);
    const nextBundle: SurfaceThemeSettings = {
      ...bundle,
      [surface]: nextSurface,
    };
    await this.persist(nextBundle);
    return nextSurface;
  }

  async updateAll(
    input: Partial<SurfaceThemeSettings>,
  ): Promise<SurfaceThemeSettings> {
    const next = normalizeSurfaceThemeSettings(input, brand.themeId);
    await this.persist(next);
    return next;
  }

  private async persist(bundle: SurfaceThemeSettings): Promise<void> {
    const existing = await this.appConfigRepo.findByKey(THEME_SETTINGS_KEY);
    const value = JSON.stringify(bundle);
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
  }
}
