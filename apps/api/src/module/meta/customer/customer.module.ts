import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { CustomerController } from './customer.controller';
import { CustomerRepo } from './customer.repo';
import { CustomerService } from './customer.service';

@Module({
  controllers: [CustomerController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    CustomerService,
    CustomerRepo,
  ],
  exports: [CustomerService, CustomerRepo, MODULE_CONFIG],
})
export class CustomerModule {}
