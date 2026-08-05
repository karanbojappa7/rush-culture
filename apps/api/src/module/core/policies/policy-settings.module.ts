import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { PolicySettingsController } from './policy-settings.controller';
import { PolicySettingsService } from './policy-settings.service';

@Module({
  imports: [AppConfigModule],
  controllers: [PolicySettingsController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    PolicySettingsService,
  ],
  exports: [PolicySettingsService, MODULE_CONFIG],
})
export class PolicySettingsModule {}
