import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MODULE_CONFIG } from '../config/module-config.types';
import { loadModuleConfig } from '../config/load-module-config';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { DecryptMiddleware } from './decrypt.middleware';
import { EncryptInterceptor } from './encrypt.interceptor';

@Global()
@Module({
  controllers: [CryptoController],
  providers: [
    {
      provide: MODULE_CONFIG,
      useFactory: () => loadModuleConfig(__dirname),
    },
    CryptoService,
    EncryptInterceptor,
  ],
  exports: [CryptoService, MODULE_CONFIG, EncryptInterceptor],
})
export class CryptoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DecryptMiddleware).forRoutes('*');
  }
}
