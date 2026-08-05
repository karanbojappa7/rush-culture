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
      undefined,
      'API live',
    );
  }

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<ResponseVm> {
    const report = await this.healthService.check();
    if (report.status === 'error') {
      res.status(503);
    } else if (report.status === 'degraded') {
      res.status(200);
    }
    return this.responseBuilder.success('Health check', report);
  }
}
