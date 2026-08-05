import { BaseService } from "@linq/app-layer";
import type { PageResult } from "@/base/pagination";
import {
  getLowestPrice,
  mapApiProduct,
  type StoreProduct,
} from "@/base/catalog-map";
import { ProductRepo, type ProductListQuery } from "./product.repo";
import type { AppHttpClient, CacheStore } from "@linq/app-layer";

export class ProductService extends BaseService {
  private readonly repo: ProductRepo;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("ProductService");
    this.repo = new ProductRepo(http, cache);
  }

  async listPage(
    params: ProductListQuery = {},
  ): Promise<PageResult<StoreProduct>> {
    const res = await this.repo.findPage(params);
    const data = res.data;
    if (!data) {
      return {
        items: [],
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        total: 0,
        totalPages: 0,
      };
    }
    return {
      ...data,
      items: (data.items ?? []).map(mapApiProduct),
    };
  }

  async listActive(limit = 20): Promise<StoreProduct[]> {
    const page = await this.listPage({ page: 1, limit, isActive: true });
    return page.items;
  }

  async getBySlug(slug: string): Promise<StoreProduct | null> {
    const res = await this.repo.findBySlug(slug);
    if (res.status_code !== 200 || !res.data) return null;
    return mapApiProduct(res.data);
  }

  lowestPrice(product: StoreProduct) {
    return getLowestPrice(product);
  }
}
