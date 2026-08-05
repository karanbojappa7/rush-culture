import { BaseController, type AppHttpClient, type CacheStore } from "@linq/app-layer";
import { PoliciesService } from "./policies.service";

export class PoliciesController extends BaseController {
  private readonly policies: PoliciesService;

  constructor(http?: AppHttpClient, cache?: CacheStore) {
    super("PoliciesController");
    this.policies = new PoliciesService(http, cache);
  }

  getSettings() {
    return this.executeMethod(
      () => this.policies.getSettings(),
      undefined as never,
      "Policy settings fetched",
    );
  }
}
