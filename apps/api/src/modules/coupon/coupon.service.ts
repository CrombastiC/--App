import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  // 获取用户优惠券列表
  async getCouponList(userId: string, isExpired?: boolean) {
    const now = new Date();
    const where: any = { userId };

    if (isExpired) {
      where.OR = [
        { status: 'used' },
        { coupon: { couponUseTime: { lt: now } } },
      ];
    } else {
      where.status = 'unused';
      where.coupon = { couponUseTime: { gte: now } };
    }

    return this.prisma.userCoupon.findMany({
      where,
      include: {
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
