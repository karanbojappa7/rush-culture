import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StaffAuth } from '../../module/security/auth/guards/staff-auth.decorator';
import { BaseController } from '../base/base.controller';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { CacheAdminService } from './cache-admin.service';

@Controller('api/cache')
export class CacheController extends BaseController {
  constructor(
    private readonly cacheAdminService: CacheAdminService,
    responseBuilder: ResponseBuilder,
  ) {
    super(CacheController.name, responseBuilder);
  }

  @Get()
  @StaffAuth()
  status(): Promise<ResponseVm> {
    return this.executeMethod(
      () => Promise.resolve(this.cacheAdminService.status()),
      undefined,
      'Cache status',
    );
  }

  @Get('services')
  @StaffAuth()
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
  @StaffAuth()
  flushAll(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.cacheAdminService.flushAll(),
      undefined,
      'Cache flushed',
    );
  }

  @Delete()
  @StaffAuth()
  flushAllDelete(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.cacheAdminService.flushAll(),
      undefined,
      'Cache flushed',
    );
  }

  @Post('flush/:service')
  @StaffAuth()
  flushService(@Param('service') service: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.cacheAdminService.flushService(data.service),
      { service },
      'Service cache flushed',
    );
  }

  @Delete('services/:service')
  @StaffAuth()
  flushServiceDelete(@Param('service') service: string): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.cacheAdminService.flushService(data.service),
      { service },
      'Service cache flushed',
    );
  }
}
