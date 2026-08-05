import { Injectable } from '@nestjs/common';
import {
  brand,
  defaultSeoSettings,
  normalizeSeoSettings,
  type SeoSettings,
} from '@linq/site-config';
import { BaseService } from '../../../common/base/base.service';
import { AppConfigRepo } from '../app-config/app-config.repo';

export const SEO_SETTINGS_KEY = 'ui.seo';

@Injectable()
export class SeoSettingsService extends BaseService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {
    super(SeoSettingsService.name);
  }

  async get(): Promise<SeoSettings> {
    const row = await this.appConfigRepo.findByKey(SEO_SETTINGS_KEY);
    if (!row?.value) {
      return defaultSeoSettings();
    }
    try {
      const parsed = JSON.parse(row.value) as Partial<SeoSettings>;
      return normalizeSeoSettings(parsed);
    } catch {
      return defaultSeoSettings();
    }
  }

  async update(input: Partial<SeoSettings>): Promise<SeoSettings> {
    const next = normalizeSeoSettings(input);
    const existing = await this.appConfigRepo.findByKey(SEO_SETTINGS_KEY);
    const value = JSON.stringify(next);
    if (existing) {
      await this.appConfigRepo.update(existing.id, {
        value,
        isActive: true,
        description: `Storefront SEO settings (${brand.name})`,
      });
    } else {
      await this.appConfigRepo.create({
        key: SEO_SETTINGS_KEY,
        value,
        isActive: true,
        description: `Storefront SEO settings (${brand.name})`,
      });
    }
    return next;
  }
}
