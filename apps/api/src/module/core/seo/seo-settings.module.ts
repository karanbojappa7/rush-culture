import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
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
