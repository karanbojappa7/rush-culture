import { BaseController } from "@linq/app-layer";
import type { AdminProductListQuery } from "./product.repo";
import { ProductService } from "./product.service";

export class ProductController extends BaseController {
  private readonly products: ProductService;

  constructor(service: ProductService) {
    super("ProductController");
    this.products = service;
  }

  static async server() {
    return new ProductController(await ProductService.server());
  }

  listPage(params: AdminProductListQuery) {
    return this.executeMethod(
      (payload) => this.products.listPage(payload),
      params,
      "Products fetched",
    );
  }

  create(body: unknown) {
    return this.executeMethod(
      (payload) => this.products.create(payload),
      body,
      "Product created",
    );
  }

  update(payload: { id: string; body: unknown }) {
    return this.executeMethod(
      ({ id, body }) => this.products.update(id, body),
      payload,
      "Product updated",
    );
  }

  remove(id: string) {
    return this.executeMethod(
      (payload) => this.products.remove(payload),
      id,
      "Product deleted",
    );
  }
}
