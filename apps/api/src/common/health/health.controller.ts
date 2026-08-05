import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BaseController } from '../base/base.controller';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { HealthService } from './health.service';

@Controller('api/health')
export class HealthController extends BaseController {
  constructor(
    private readonly healthService: HealthService,
    responseBuilder: ResponseBuilder,
  ) {
    super(HealthController.name, responseBuilder);
  }

  @Get('live')
  live(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.healthService.live(),
      undefined as never,
      'API live',
    );
  }

  @Get()
  check(@Res({ passthrough: true }) res: Response): Promise<ResponseVm> {
    return this.executeMethod(
      async () => {
        const report = await this.healthService.check();
        if (report.status === 'error') {
          res.status(503);
        }
        return report;
      },
      undefined as never,
      'Health check',
    );
  }
}
