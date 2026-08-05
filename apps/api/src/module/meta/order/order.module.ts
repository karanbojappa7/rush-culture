import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { OrderController } from './order.controller';
import { OrderRepo } from './order.repo';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    OrderRepo,
    OrderService,
  ],
  exports: [OrderService, MODULE_CONFIG],
})
export class OrderModule {}
