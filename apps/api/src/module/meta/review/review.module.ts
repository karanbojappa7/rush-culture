import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { CustomerModule } from '../customer/customer.module';
import { ReviewController } from './review.controller';
import { ReviewRepo } from './review.repo';
import { ReviewService } from './review.service';

@Module({
  imports: [CustomerModule],
  controllers: [ReviewController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    ReviewRepo,
    ReviewService,
  ],
  exports: [ReviewService, MODULE_CONFIG],
})
export class ReviewModule {}
