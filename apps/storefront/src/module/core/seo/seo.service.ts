import {
  BaseService,
  type AppHttpClient,
  type CacheStore,
} from "@linq/app-layer";
import {
  defaultSeoSettings,
  normalizeSeoSettings,
  type SeoSettings,
} from "@linq/site-config";
import { SeoRepo } from "./seo.repo";

export class SeoService extends BaseService {
  private readonly repo: SeoRepo;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("SeoService");
    this.repo = new SeoRepo(http, cache);
  }

  async getSettings(): Promise<SeoSettings> {
    try {
      const res = await this.repo.get();
      if (res.status_code === 200 && res.data) {
        return normalizeSeoSettings(res.data);
      }
    } catch {
    }
    return defaultSeoSettings();
  }
}
