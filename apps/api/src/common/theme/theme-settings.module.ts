import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../module/core/app-config/app-config.module';
import { MODULE_CONFIG } from '../config/module-config.types';
import { loadModuleConfig } from '../config/load-module-config';
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
