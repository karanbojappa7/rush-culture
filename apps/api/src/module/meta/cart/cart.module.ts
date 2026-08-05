import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { CartController } from './cart.controller';
import { CartRepo, CartItemRepo } from './cart.repo';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    CartRepo,
    CartItemRepo,
    CartService,
  ],
  exports: [CartService, MODULE_CONFIG],
})
export class CartModule {}
