import { BaseController, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import { BrandService } from "./brand.service";

export class BrandController extends BaseController {
  private readonly brand: BrandService;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("BrandController");
    this.brand = new BrandService(http, cache);
  }

  getSettings() {
    return this.executeMethod(
      () => this.brand.getSettings(),
      undefined as never,
      "Brand settings fetched",
    );
  }
}
