import { Body, Controller, Get, Put } from '@nestjs/common';
import { BaseController } from '../../../common/base/base.controller';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
import { UpdateSeoSettingsDto } from './dto/update-seo-settings.dto';
import { SeoSettingsService } from './seo-settings.service';

@Controller('api/seo-settings')
export class SeoSettingsController extends BaseController {
  constructor(
    private readonly seoSettingsService: SeoSettingsService,
    responseBuilder: ResponseBuilder,
  ) {
    super(SeoSettingsController.name, responseBuilder);
  }

  @Get()
  get(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.seoSettingsService.get(),
      undefined as never,
      'SEO settings fetched',
    );
  }

  @Put()
  @PermissionsAuth('seo.manage')
  update(@Body() payload: UpdateSeoSettingsDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.seoSettingsService.update(data),
      payload,
      'SEO settings updated',
    );
  }
}
