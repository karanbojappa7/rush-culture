import { Injectable } from '@nestjs/common';
import {
  brand,
  defaultPoliciesSettings,
  normalizePoliciesSettings,
  type PoliciesSettings,
} from '@linq/site-config';
import { BaseService } from '../../../common/base/base.service';
import { AppConfigRepo } from '../app-config/app-config.repo';

export const POLICIES_SETTINGS_KEY = 'ui.policies';

@Injectable()
export class PolicySettingsService extends BaseService {
  constructor(private readonly appConfigRepo: AppConfigRepo) {
    super(PolicySettingsService.name);
  }

  async get(): Promise<PoliciesSettings> {
    const row = await this.appConfigRepo.findByKey(POLICIES_SETTINGS_KEY);
    if (!row?.value) {
      return defaultPoliciesSettings();
    }
    try {
      const parsed = JSON.parse(row.value) as Partial<PoliciesSettings>;
      return normalizePoliciesSettings(parsed);
    } catch {
      return defaultPoliciesSettings();
    }
  }

  async update(input: Partial<PoliciesSettings>): Promise<PoliciesSettings> {
    const next = normalizePoliciesSettings(input);
    const existing = await this.appConfigRepo.findByKey(POLICIES_SETTINGS_KEY);
    const value = JSON.stringify(next);
    if (existing) {
      await this.appConfigRepo.update(existing.id, {
        value,
        isActive: true,
        description: `Store policy pages (${brand.name})`,
      });
    } else {
      await this.appConfigRepo.create({
        key: POLICIES_SETTINGS_KEY,
        value,
        isActive: true,
        description: `Store policy pages (${brand.name})`,
      });
    }
    return next;
  }
}
