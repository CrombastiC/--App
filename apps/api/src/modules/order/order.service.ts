import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { OrderStatus } from '@orderfood/common';
import type { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // 创建订单
  async createOrder(userId: string, data: CreateOrderDto) {
    const itemTotal = data.items.reduce(
      (total, item) => total + item.foodPrice * item.quantity,
      0,
    );
    if (Math.abs(itemTotal - data.totalAmount) > 0.01) {
      throw new BadRequestException('订单总金额与菜品明细不一致');
    }
    if (data.payAmount > data.totalAmount) {
      throw new BadRequestException('实付金额不能大于订单总金额');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('用户不存在');
      }
      if (user.balance < data.payAmount) {
        throw new BadRequestException('余额不足');
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: data.payAmount } },
      });

      return tx.order.create({
        data: {
          userId,
          orderType: data.orderType,
          status: 'paid',
          totalAmount: data.totalAmount,
          payAmount: data.payAmount,
          address: data.address,
          peopleCount: data.peopleCount,
          remark: data.remark,
          orderItems: {
            create: data.items.map((item) => ({
              foodId: item.foodId,
              foodName: item.foodName,
              foodPrice: item.foodPrice,
              quantity: item.quantity,
              subtotal: item.foodPrice * item.quantity,
            })),
          },
        },
        include: { orderItems: true },
      });
    });
  }

  // 获取用户订单列表
  async getOrders(userId: string, status?: OrderStatus) {
    const where = status ? { userId, status } : { userId };

    return this.prisma.order.findMany({
      where,
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 获取订单详情
  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: true,
      },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    return order;
  }
}
