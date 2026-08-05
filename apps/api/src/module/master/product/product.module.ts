import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { ProductController } from './product.controller';
import { ProductRepo } from './product.repo';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    ProductRepo,
    ProductService,
  ],
  exports: [ProductService, MODULE_CONFIG],
})
export class ProductModule {}
