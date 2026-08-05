import { Global, Module, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheConfigService } from './cache-config.service';
import { CacheHandler } from './cache.handler';
import { CacheInterceptor } from './cache.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [],
})
export class CachingModule implements OnModuleInit {
  onModuleInit() {
    CacheHandler.getInstance();
    CacheConfigService.getInstance().reload();
  }
}
