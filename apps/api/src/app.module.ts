import { Module } from '@nestjs/common';
import { CryptoModule } from './common/crypto/crypto.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppConfigModule } from './module/core/app-config/app-config.module';
import { DiscountModule } from './module/core/discount/discount.module';
import { AddressModule } from './module/master/address/address.module';
import { CategoryModule } from './module/master/category/category.module';
import { UserModule } from './module/master/user/user.module';
import { ProductModule } from './module/master/product/product.module';
import { OrderModule } from './module/meta/order/order.module';
import { CartModule } from './module/meta/cart/cart.module';
import { ReviewModule } from './module/meta/review/review.module';

@Module({
  imports: [
    CryptoModule,
    PrismaModule,
    AppConfigModule,
    DiscountModule,
    AddressModule,
    CategoryModule,
    UserModule,
    ProductModule,
    OrderModule,
    CartModule,
    ReviewModule,
  ],
})
export class AppModule {}
