import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { DiscountController } from './discount.controller';
import { DiscountRepo } from './discount.repo';
import { DiscountService } from './discount.service';

@Module({
  controllers: [DiscountController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    DiscountService,
    DiscountRepo,
  ],
  exports: [DiscountService, DiscountRepo, MODULE_CONFIG],
})
export class DiscountModule {}
