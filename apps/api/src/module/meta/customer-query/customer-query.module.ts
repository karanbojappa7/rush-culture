import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { CustomerModule } from '../customer/customer.module';
import { CustomerQueryController } from './customer-query.controller';
import { CustomerQueryRepo } from './customer-query.repo';
import { CustomerQueryService } from './customer-query.service';

@Module({
  imports: [CustomerModule],
  controllers: [CustomerQueryController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    CustomerQueryService,
    CustomerQueryRepo,
  ],
  exports: [CustomerQueryService, CustomerQueryRepo, MODULE_CONFIG],
})
export class CustomerQueryModule {}
