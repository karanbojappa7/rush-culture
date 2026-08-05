import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { CategoryController } from './category.controller';
import { CategoryRepo } from './category.repo';
import { CategoryService } from './category.service';

@Module({
  controllers: [CategoryController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    CategoryService,
    CategoryRepo,
  ],
  exports: [CategoryService, CategoryRepo, MODULE_CONFIG],
})
export class CategoryModule {}
