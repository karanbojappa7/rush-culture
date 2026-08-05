import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../module/core/app-config/app-config.module';
import { MODULE_CONFIG } from '../config/module-config.types';
import { loadModuleConfig } from '../config/load-module-config';
import { SeoSettingsController } from './seo-settings.controller';
import { SeoSettingsService } from './seo-settings.service';

@Module({
  imports: [AppConfigModule],
  controllers: [SeoSettingsController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    SeoSettingsService,
  ],
  exports: [SeoSettingsService, MODULE_CONFIG],
})
export class SeoSettingsModule {}
