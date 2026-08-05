import { BaseController, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import type { ProductListQuery } from "./product.repo";
import { ProductService } from "./product.service";

export class ProductController extends BaseController {
  private readonly products: ProductService;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("ProductController");
    this.products = new ProductService(http, cache);
  }

  listPage(params: ProductListQuery = {}) {
    return this.executeMethod(
      (payload) => this.products.listPage(payload),
      params,
      "Products fetched",
    );
  }

  listActive(limit = 20) {
    return this.executeMethod(
      (payload) => this.products.listActive(payload),
      limit,
      "Products fetched",
    );
  }

  getBySlug(slug: string) {
    return this.executeMethod(
      (payload) => this.products.getBySlug(payload),
      slug,
      "Product fetched",
    );
  }
}
