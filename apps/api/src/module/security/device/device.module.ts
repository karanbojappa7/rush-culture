import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../../common/prisma/prisma.module';
import { ClientDeviceController } from './client-device.controller';
import { ClientDeviceService } from './client-device.service';
import { DeviceTrackingMiddleware } from './device-tracking.middleware';

@Global()
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClientDeviceController],
  providers: [ClientDeviceService],
  exports: [ClientDeviceService],
})
export class DeviceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DeviceTrackingMiddleware).forRoutes('*');
  }
}
