import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { ThemeSettingsController } from './theme-settings.controller';
import { ThemeSettingsService } from './theme-settings.service';

@Module({
  imports: [AppConfigModule],
  controllers: [ThemeSettingsController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    ThemeSettingsService,
  ],
  exports: [ThemeSettingsService, MODULE_CONFIG],
})
export class ThemeSettingsModule {}
