import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { BrandSettingsController } from './brand-settings.controller';
import { BrandSettingsService } from './brand-settings.service';

@Module({
  imports: [AppConfigModule],
  controllers: [BrandSettingsController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    BrandSettingsService,
  ],
  exports: [BrandSettingsService, MODULE_CONFIG],
})
export class BrandSettingsModule {}
