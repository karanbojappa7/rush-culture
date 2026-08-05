import { ResponseBuilder } from "../response/response.builder";
import type { ResponseVm } from "../response/response.vm";

export abstract class BaseController {
  protected readonly responseBuilder: ResponseBuilder;
  protected readonly context: string;

  constructor(context: string, responseBuilder?: ResponseBuilder) {
    this.context = context;
    this.responseBuilder = responseBuilder ?? new ResponseBuilder();
  }

  protected log(message: string, payload?: unknown) {
    if (process.env.NODE_ENV === "production") return;
    if (payload === undefined) {
      console.info(`[${this.context}] ${message}`);
      return;
    }
    console.info(`[${this.context}] ${message}`, payload);
  }

  protected logError(message: string, error?: unknown) {
    console.error(`[${this.context}] ${message}`, error);
  }

  protected async executeMethod<TPayload, TResult>(
    fn: (payload: TPayload) => Promise<TResult>,
    payload: TPayload,
    successMessage = "Success",
  ): Promise<ResponseVm<TResult | undefined>> {
    try {
      this.log(`Starting ${fn.name || "operation"}`, payload);
      const data = await fn(payload);
      this.log(`Completed ${fn.name || "operation"}`);
      return this.responseBuilder.success(successMessage, data);
    } catch (exception) {
      const message =
        exception instanceof Error ? exception.message : String(exception);
      this.logError(message, exception);
      return this.responseBuilder.codeError(message);
    }
  }
}
