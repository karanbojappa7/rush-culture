import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { AppConfigController } from './app-config.controller';
import { AppConfigRepo } from './app-config.repo';
import { AppConfigService } from './app-config.service';

@Module({
  controllers: [AppConfigController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    AppConfigService,
    AppConfigRepo,
  ],
  exports: [AppConfigService, AppConfigRepo, MODULE_CONFIG],
})
export class AppConfigModule {}
