import { BaseController, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import { SeoService } from "./seo.service";

export class SeoController extends BaseController {
  private readonly seo: SeoService;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("SeoController");
    this.seo = new SeoService(http, cache);
  }

  getSettings() {
    return this.executeMethod(
      () => this.seo.getSettings(),
      undefined as never,
      "SEO settings fetched",
    );
  }
}
