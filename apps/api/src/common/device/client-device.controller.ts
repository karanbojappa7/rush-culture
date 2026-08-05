import { Controller, Get, Query } from '@nestjs/common';
import { DeviceType } from '@prisma/client';
import { BaseController } from '../base/base.controller';
import { parsePageQuery } from '../pagination/pagination.utility';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { StaffAuth } from '../../module/security/auth/guards/staff-auth.decorator';
import { ClientDeviceService } from './client-device.service';

@Controller('api/client-devices')
@StaffAuth('ADMIN')
export class ClientDeviceController extends BaseController {
  constructor(
    private readonly clientDeviceService: ClientDeviceService,
    responseBuilder: ResponseBuilder,
  ) {
    super(ClientDeviceController.name, responseBuilder);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('deviceType') deviceType?: DeviceType,
  ): Promise<ResponseVm> {
    const pageQuery = parsePageQuery(page, limit);
    return this.executeMethod(
      (data) =>
        this.clientDeviceService.findPage(
          { page: data.page, limit: data.limit, skip: data.skip },
          { q: data.q, deviceType: data.deviceType },
        ),
      { ...pageQuery, q, deviceType },
      'Devices fetched',
    );
  }
}
