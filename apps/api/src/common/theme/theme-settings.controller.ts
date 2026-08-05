import { Body, Controller, Get, Put } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { ResponseBuilder } from '../response/response.builder';
import { ResponseVm } from '../response/response.vm';
import { UpdateThemeSettingsDto } from './dto/update-theme-settings.dto';
import { ThemeSettingsService } from './theme-settings.service';

@Controller('api/theme-settings')
export class ThemeSettingsController extends BaseController {
  constructor(
    private readonly themeSettingsService: ThemeSettingsService,
    responseBuilder: ResponseBuilder,
  ) {
    super(ThemeSettingsController.name, responseBuilder);
  }

  @Get()
  get(): Promise<ResponseVm> {
    return this.executeMethod(
      () => this.themeSettingsService.get(),
      undefined as never,
      'Theme settings fetched',
    );
  }

  @Put()
  @PermissionsAuth('theming.manage')
  update(@Body() payload: UpdateThemeSettingsDto): Promise<ResponseVm> {
    return this.executeMethod(
      (data) => this.themeSettingsService.update(data),
      payload,
      'Theme settings updated',
    );
  }
}
