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

    const records = await this.prisma.userCoupon.findMany({
      where,
      include: {
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 平铺为前端期望的结构
    return records.map((record) => ({
      couponId: record.coupon.id,
      couponName: record.coupon.couponName,
      couponAmount: record.coupon.couponAmount,
      consumeMoney: record.coupon.consumeMoney,
      couponUseTime: record.coupon.couponUseTime.toISOString(),
      status: record.status as 'unused' | 'used',
    }));
  }
}
