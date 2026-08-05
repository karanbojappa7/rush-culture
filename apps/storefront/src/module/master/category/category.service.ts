import { BaseService, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import { mapApiCategory, type StoreCollection } from "@/base/catalog-map";
import { CategoryRepo } from "./category.repo";

export class CategoryService extends BaseService {
  private readonly repo: CategoryRepo;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("CategoryService");
    this.repo = new CategoryRepo(http, cache);
  }

  async list(limit = 100): Promise<StoreCollection[]> {
    const res = await this.repo.findPage({ page: 1, limit });
    return (res.data?.items ?? []).map(mapApiCategory);
  }

  async getBySlug(slug: string): Promise<StoreCollection | null> {
    const res = await this.repo.findBySlug(slug);
    if (res.status_code !== 200 || !res.data) return null;
    return mapApiCategory(res.data);
  }
}
