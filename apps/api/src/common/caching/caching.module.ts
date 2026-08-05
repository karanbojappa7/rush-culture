import { Global, Module, OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../../module/security/auth/auth.module';
import { CacheAdminService } from './cache-admin.service';
import { CacheConfigService } from './cache-config.service';
import { CacheController } from './cache.controller';
import { CacheHandler } from './cache.handler';
import { CacheInterceptor } from './cache.interceptor';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [CacheController],
  providers: [CacheAdminService, CacheInterceptor],
  exports: [CacheAdminService, CacheInterceptor],
})
export class CachingModule implements OnModuleInit {
  onModuleInit() {
    CacheHandler.getInstance();
    CacheConfigService.getInstance().reload();
  }
}
