import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import {
  isThemeSurface,
  type ThemeSurface,
} from '@linq/site-config';
import { BaseController } from '../../../common/base/base.controller';
import { PermissionsAuth } from '../rbac/permissions.decorator';
import { ResponseBuilder } from '../../../common/response/response.builder';
import { ResponseVm } from '../../../common/response/response.vm';
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
  get(@Query('surface') surface?: string): Promise<ResponseVm> {
    if (isThemeSurface(surface)) {
      return this.executeMethod(
        () => this.themeSettingsService.getSurface(surface),
        undefined as never,
        `${surface} theme settings fetched`,
      );
    }
    return this.executeMethod(
      () => this.themeSettingsService.getAll(),
      undefined as never,
      'Theme settings fetched',
    );
  }

  @Put()
  @PermissionsAuth('theming.manage')
  update(@Body() payload: UpdateThemeSettingsDto): Promise<ResponseVm> {
    const surface: ThemeSurface = isThemeSurface(payload.surface)
      ? payload.surface
      : 'storefront';
    const { surface: _surface, ...theme } = payload;
    return this.executeMethod(
      (data) => this.themeSettingsService.updateSurface(surface, data),
      theme,
      `${surface} theme settings updated`,
    );
  }
}
