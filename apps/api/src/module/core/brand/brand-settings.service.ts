import { Injectable } from '@nestjs/common';
import {
  brand,
  defaultBrandSettings,
  normalizeBrandSettings,
  type BrandSettings,
} from '@linq/site-config';
import { BaseService } from '../../../common/base/base.service';
import { AppConfigRepo } from '../app-config/app-config.repo';

export const BRAND_SETTINGS_KEY = 'ui.brand';

@Injectable()
export class BrandSettingsService extends BaseService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {
    super(BrandSettingsService.name);
  }

  async get(): Promise<BrandSettings> {
    const row = await this.appConfigRepo.findByKey(BRAND_SETTINGS_KEY);
    if (!row?.value) {
      return defaultBrandSettings();
    }
    try {
      const parsed = JSON.parse(row.value) as Partial<BrandSettings>;
      return normalizeBrandSettings(parsed);
    } catch {
      return defaultBrandSettings();
    }
  }

  async update(input: Partial<BrandSettings>): Promise<BrandSettings> {
    const next = normalizeBrandSettings(input);
    const existing = await this.appConfigRepo.findByKey(BRAND_SETTINGS_KEY);
    const value = JSON.stringify(next);
    if (existing) {
      await this.appConfigRepo.update(existing.id, {
        value,
        isActive: true,
        description: `Store brand identity (${brand.name})`,
      });
    } else {
      await this.appConfigRepo.create({
        key: BRAND_SETTINGS_KEY,
        value,
        isActive: true,
        description: `Store brand identity (${brand.name})`,
      });
    }
    return next;
  }
}
