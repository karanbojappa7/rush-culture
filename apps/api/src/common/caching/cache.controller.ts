import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { BaseController } from '../base/base.controller';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { CacheAdminService } from './cache-admin.service';

@Controller('api/cache')
@PermissionsAuth('cache.flush')
export class CacheController extends BaseController {
  constructor(
    private readonly cacheAdminService: CacheAdminService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CacheController.name, responseBuilder);
  }

  @Get()
  status(): Promise<ResponseVm> {
    return this.executeMethod(
      () => Promise.resolve(this.cacheAdminService.status()),
      undefined,
      'Cache status',
    );
  }

  @Get('services')
  services(): Promise<ResponseVm> {
    return this.executeMethod(
      () =>
        Promise.resolve({
          services: this.cacheAdminService.status().services,
        }),
      undefined,
      'Cache services',
    );
  }

  @Post('flush')
  flushAll(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.cacheAdminService.flushAll(),
      undefined,
      'Cache flushed',
    );
  }

  @Delete()
  flushAllDelete(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.cacheAdminService.flushAll(),
      undefined,
      'Cache flushed',
    );
  }

  @Post('flush/:service')
  flushService(@Param('service') service: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.cacheAdminService.flushService(data.service),
      { service },
      'Service cache flushed',
    );
  }

  @Delete('services/:service')
  flushServiceDelete(@Param('service') service: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.cacheAdminService.flushService(data.service),
      { service },
      'Service cache flushed',
    );
  }
}
