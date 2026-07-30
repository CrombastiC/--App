import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AdminOrdersQueryDto,
  AdminUsersQueryDto,
  CreateCouponDto,
  CreateGiftCardDto,
  GrantCouponDto,
  PaginationQueryDto,
  UpdateCouponDto,
  UpdateGiftCardDto,
  UpdateOrderStatusDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    const [
      userCount,
      orderCount,
      todayOrderCount,
      pendingOrderCount,
      foodCount,
      couponCount,
      giftCardCount,
      revenue,
      todayRevenue,
      lowStockCount,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'user' } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.food.count({ where: { isActive: true } }),
      this.prisma.coupon.count({
        where: { isActive: true, couponUseTime: { gt: now } },
      }),
      this.prisma.giftCard.count({
        where: {
          status: 'active',
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
      this.prisma.order.aggregate({
        where: { status: { in: ['paid', 'completed'] } },
        _sum: { payAmount: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: ['paid', 'completed'] },
          createdAt: { gte: today },
        },
        _sum: { payAmount: true },
      }),
      this.prisma.commodity.count({ where: { isActive: true, stock: { lte: 10 } } }),
      this.prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, phone: true } },
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    return {
      userCount,
      orderCount,
      todayOrderCount,
      pendingOrderCount,
      foodCount,
      couponCount,
      giftCardCount,
      revenue: revenue._sum.payAmount || 0,
      todayRevenue: todayRevenue._sum.payAmount || 0,
      lowStockCount,
      recentOrders,
    };
  }

  async getUsers(query: AdminUsersQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.UserWhereInput = {
      role: query.role,
      ...(query.search
        ? {
            OR: [
              { phone: { contains: query.search } },
              { username: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          username: true,
          avatar: true,
          gender: true,
          birthday: true,
          balance: true,
          integral: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true, userCoupons: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }

  async getOrders(query: AdminOrdersQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.OrderWhereInput = {
      status: query.status,
      ...(query.search
        ? {
            OR: [
              { id: { contains: query.search } },
              { user: { phone: { contains: query.search } } },
              { user: { username: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, phone: true } },
          orderItems: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');

    const allowedTransitions: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      paid: ['completed'],
      completed: [],
      cancelled: [],
    };
    if (!allowedTransitions[order.status]?.includes(dto.status)) {
      throw new BadRequestException(`订单不能从 ${order.status} 更新为 ${dto.status}`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async getCoupons(query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { userCoupons: true } } },
      }),
      this.prisma.coupon.count(),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async createCoupon(dto: CreateCouponDto) {
    if (new Date(dto.couponUseTime) <= new Date()) {
      throw new BadRequestException('优惠券有效期必须晚于当前时间');
    }
    return this.prisma.coupon.create({
      data: {
        couponName: dto.couponName,
        couponAmount: dto.couponAmount,
        consumeMoney: dto.consumeMoney,
        couponUseTime: new Date(dto.couponUseTime),
        totalStock: dto.totalStock,
        remainStock: dto.totalStock,
      },
    });
  }

  async updateCoupon(id: string, dto: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');

    const { addStock, couponUseTime, ...fields } = dto;
    const data: Prisma.CouponUpdateInput = {
      ...fields,
      couponUseTime: couponUseTime ? new Date(couponUseTime) : undefined,
      ...(addStock
        ? {
            totalStock: { increment: addStock },
            remainStock: { increment: addStock },
          }
        : {}),
    };
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async deleteCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    const assignedCount = await this.prisma.userCoupon.count({ where: { couponId: id } });
    if (assignedCount > 0) {
      throw new BadRequestException('该优惠券已有领取记录，只能停用，不能删除');
    }
    return this.prisma.coupon.delete({ where: { id } });
  }

  async grantCoupon(couponId: string, dto: GrantCouponDto) {
    return this.prisma.$transaction(async (tx) => {
      const [coupon, user] = await Promise.all([
        tx.coupon.findUnique({ where: { id: couponId } }),
        tx.user.findUnique({ where: { id: dto.userId } }),
      ]);
      if (!coupon || !coupon.isActive) throw new NotFoundException('优惠券不存在或已停用');
      if (!user) throw new NotFoundException('用户不存在');
      if (coupon.remainStock <= 0) throw new BadRequestException('优惠券库存不足');
      if (coupon.couponUseTime < new Date()) throw new BadRequestException('优惠券已过期');

      const stockUpdate = await tx.coupon.updateMany({
        where: { id: couponId, remainStock: { gt: 0 } },
        data: { remainStock: { decrement: 1 } },
      });
      if (stockUpdate.count === 0) throw new BadRequestException('优惠券库存不足');
      return tx.userCoupon.create({
        data: { userId: dto.userId, couponId },
      });
    });
  }

  async getGiftCards(query: PaginationQueryDto) {
    await this.prisma.giftCard.updateMany({
      where: { status: 'active', expiresAt: { lt: new Date() } },
      data: { status: 'expired' },
    });
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.giftCard.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.giftCard.count(),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async createGiftCard(dto: CreateGiftCardDto) {
    const code = dto.code?.trim().toUpperCase() || this.generateGiftCardCode();
    if (dto.expiresAt && new Date(dto.expiresAt) <= new Date()) {
      throw new BadRequestException('礼品卡有效期必须晚于当前时间');
    }
    const existing = await this.prisma.giftCard.findUnique({ where: { code } });
    if (existing) throw new BadRequestException('礼品卡兑换码已存在');
    return this.prisma.giftCard.create({
      data: {
        code,
        amount: dto.amount,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async updateGiftCard(id: string, dto: UpdateGiftCardDto) {
    const card = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('礼品卡不存在');
    if (card.status === 'redeemed') throw new BadRequestException('已兑换礼品卡不能修改');
    if (dto.status === 'active' && dto.expiresAt && new Date(dto.expiresAt) <= new Date()) {
      throw new BadRequestException('启用礼品卡时，有效期必须晚于当前时间');
    }

    return this.prisma.giftCard.update({
      where: { id },
      data: {
        amount: dto.amount,
        status: dto.status,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async deleteGiftCard(id: string) {
    const card = await this.prisma.giftCard.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('礼品卡不存在');
    if (card.status === 'redeemed') throw new BadRequestException('已兑换礼品卡不能删除');
    return this.prisma.giftCard.delete({ where: { id } });
  }

  private generateGiftCardCode() {
    return `GIFT-${randomBytes(3).toString('hex').toUpperCase()}-${randomBytes(2)
      .toString('hex')
      .toUpperCase()}`;
  }
}
