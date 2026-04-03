import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { PointsModule } from './modules/points/points.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { MoneyModule } from './modules/money/money.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    MenuModule,
    OrderModule,
    PointsModule,
    CouponModule,
    MoneyModule,
    UploadModule,
  ],
})
export class AppModule {}
