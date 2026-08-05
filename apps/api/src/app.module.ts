import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CachingModule } from './common/caching/caching.module';
import { CacheInterceptor } from './common/caching/cache.interceptor';
import { CryptoModule } from './common/crypto/crypto.module';
import { EncryptInterceptor } from './common/crypto/encrypt.interceptor';
import { DeviceModule } from './common/device/device.module';
import { EmailModule } from './common/email/email.module';
import { HealthModule } from './common/health/health.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { RbacModule } from './common/rbac/rbac.module';
import { AppConfigModule } from './module/core/app-config/app-config.module';
import { DiscountModule } from './module/core/discount/discount.module';
import { UserModule } from './module/core/user/user.module';
import { CategoryModule } from './module/master/category/category.module';
import { ProductModule } from './module/master/product/product.module';
import { AuthModule } from './module/security/auth/auth.module';
import { AddressModule } from './module/meta/address/address.module';
import { CustomerModule } from './module/meta/customer/customer.module';
import { CustomerQueryModule } from './module/meta/customer-query/customer-query.module';
import { OrderModule } from './module/meta/order/order.module';
import { CartModule } from './module/meta/cart/cart.module';
import { ReviewModule } from './module/meta/review/review.module';

@Module({
  imports: [
    CryptoModule,
    CachingModule,
    DeviceModule,
    EmailModule,
    RateLimitModule,
    HealthModule,
    PrismaModule,
    RbacModule,
    AppConfigModule,
    DiscountModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    CustomerModule,
    CustomerQueryModule,
    AddressModule,
    OrderModule,
    CartModule,
    ReviewModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EncryptInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
