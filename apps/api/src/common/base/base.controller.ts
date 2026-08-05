import { Logger } from '@nestjs/common';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';

export abstract class BaseController {
  protected readonly logger: Logger;
  protected readonly responseBuilder: ResponseBuilder;

  constructor(context: string, responseBuilder?: ResponseBuilder) {
    this.logger = new Logger(context);
    this.responseBuilder = responseBuilder ?? new ResponseBuilder();
  }

  protected async executeMethod<TPayload, TResult>(
    fn: (payload: TPayload) => Promise<TResult>,
    payload: TPayload,
    successMessage = 'Success',
  ): Promise<ResponseVm<TResult | undefined>> {
    try {
      this.logger.log(`Starting ${fn.name || 'operation'}`);
      const data = await fn(payload);
      this.logger.log(`Completed ${fn.name || 'operation'}`);
      return this.responseBuilder.success(successMessage, data);
    } catch (exception) {
      const message =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(message, exception instanceof Error ? exception.stack : undefined);
      return this.responseBuilder.codeError(message);
    }
  }
}
