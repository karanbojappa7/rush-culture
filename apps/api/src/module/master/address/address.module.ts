import { Module } from '@nestjs/common';
import { MODULE_CONFIG } from '../../../common/config/module-config.types';
import { loadModuleConfig } from '../../../common/config/load-module-config';
import { AddressController } from './address.controller';
import { AddressRepo } from './address.repo';
import { AddressService } from './address.service';

@Module({
  controllers: [AddressController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    AddressService,
    AddressRepo,
  ],
  exports: [AddressService, AddressRepo, MODULE_CONFIG],
})
export class AddressModule {}
