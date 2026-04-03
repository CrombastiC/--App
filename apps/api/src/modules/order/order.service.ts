import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // 创建订单
  async createOrder(userId: string, data: {
    orderType: string;
    totalAmount: number;
    payAmount: number;
    address?: string;
    peopleCount?: number;
    remark?: string;
    items: { foodId: string; foodName: string; foodPrice: number; quantity: number; subtotal: number }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          orderType: data.orderType,
          totalAmount: data.totalAmount,
          payAmount: data.payAmount,
          address: data.address,
          peopleCount: data.peopleCount,
          remark: data.remark,
        },
      });

      // 创建订单明细
      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: order.id,
          ...item,
        })),
      });

      return order;
    });
  }

  // 获取用户订单列表
  async getOrders(userId: string, status?: string) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 获取订单详情
  async getOrderDetail(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });
  }
}
