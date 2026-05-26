import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // 管理端：订单列表（分页、状态筛选）
  async getAll(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: true,
          user: { select: { username: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  // 管理端：更新订单状态
  async updateStatus(orderId: string, status: string) {
    const validStatuses = ['pending', 'paid', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`无效状态，可选：${validStatuses.join(', ')}`);
    }
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
