import { BaseController, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import { CategoryService } from "./category.service";

export class CategoryController extends BaseController {
  private readonly categories: CategoryService;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("CategoryController");
    this.categories = new CategoryService(http, cache);
  }

  list(limit = 100) {
    return this.executeMethod(
      (payload) => this.categories.list(payload),
      limit,
      "Categories fetched",
    );
  }

  getBySlug(slug: string) {
    return this.executeMethod(
      (payload) => this.categories.getBySlug(payload),
      slug,
      "Category fetched",
    );
  }
}
