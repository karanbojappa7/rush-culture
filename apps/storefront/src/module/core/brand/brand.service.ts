import {
  BaseService,
  type AppHttpClient,
  type CacheStore,
} from "@linq/app-layer";
import {
  defaultBrandSettings,
  normalizeBrandSettings,
  type BrandSettings,
} from "@linq/site-config";
import { BrandRepo } from "./brand.repo";

export class BrandService extends BaseService {
  private readonly repo: BrandRepo;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("BrandService");
    this.repo = new BrandRepo(http, cache);
  }

  async getSettings(): Promise<BrandSettings> {
    try {
      const res = await this.repo.get();
      if (res.status_code === 200 && res.data) {
        return normalizeBrandSettings(res.data);
      }
    } catch {
    }
    return defaultBrandSettings();
  }
}
