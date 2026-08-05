import {
  BaseService,
  type AppHttpClient,
} from "@linq/app-layer";
import { emptyPage, type PageResult } from "@/base/pagination";
import {
  createBrowserProductRepo,
  ProductRepo,
  type AdminProduct,
  type AdminProductListQuery,
} from "./product.repo";

export class ProductService extends BaseService {
  private readonly repo: ProductRepo;

  constructor(repo: ProductRepo) {
    super("ProductService");
    this.repo = repo;
  }

  static async server() {
    const { createServerProductRepo } = await import("./product.repo.server");
    return new ProductService(await createServerProductRepo());
  }

  static browser(http?: AppHttpClient) {
    return new ProductService(createBrowserProductRepo(http));
  }

  async listPage(
    params: AdminProductListQuery,
  ): Promise<PageResult<AdminProduct>> {
    const res = await this.repo.findPage(params);
    return res.data ?? emptyPage<AdminProduct>(Number(params.limit ?? 20));
  }

  create(body: unknown) {
    return this.repo.create(body);
  }

  update(id: string, body: unknown) {
    return this.repo.update(id, body);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
