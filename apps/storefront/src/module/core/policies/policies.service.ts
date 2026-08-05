import {
  BaseService,
  type AppHttpClient,
  type CacheStore,
} from "@linq/app-layer";
import {
  defaultPoliciesSettings,
  normalizePoliciesSettings,
  type PoliciesSettings,
} from "@linq/site-config";
import { PoliciesRepo } from "./policies.repo";

export class PoliciesService extends BaseService {
  private readonly repo: PoliciesRepo;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("PoliciesService");
    this.repo = new PoliciesRepo(http, cache);
  }

  async getSettings(): Promise<PoliciesSettings> {
    try {
      const res = await this.repo.get();
      if (res.status_code === 200 && res.data) {
        return normalizePoliciesSettings(res.data);
      }
    } catch {
    }
    return defaultPoliciesSettings();
  }
}
