import { Body, Controller, Get, Put } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { BrandSettingsService } from './brand-settings.service';

@Controller('api/brand-settings')
export class BrandSettingsController extends BaseController {
  constructor(
    private readonly brandSettingsService: BrandSettingsService,
    responseBuilder: ResponseBuilder,
  ) {
    super(BrandSettingsController.name, responseBuilder);
  }

  @Get()
  get(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.brandSettingsService.get(),
      undefined as never,
      'Brand settings fetched',
    );
  }

  @Put()
  @PermissionsAuth('brand.manage')
  update(@Body() payload: UpdateBrandSettingsDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.brandSettingsService.update(data),
      payload,
      'Brand settings updated',
    );
  }
}
