import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DeviceModule } from '../device/device.module';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitStore } from './rate-limit.store';

@Global()
@Module({
  imports: [DeviceModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class RateLimitModule {
  constructor() {
    RateLimitStore.getInstance();
  }
}
