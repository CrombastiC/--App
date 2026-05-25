import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('订单')
@Controller('order')
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiOperation({ summary: '创建订单' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() data: {
      orderType: string;
      totalAmount: number;
      payAmount: number;
      address?: string;
      peopleCount?: number;
      remark?: string;
      items: { foodId: string; foodName: string; foodPrice: number; quantity: number; subtotal: number }[];
    },
  ) {
    return this.orderService.createOrder(userId, data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取订单列表' })
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.getOrders(userId, status);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '获取订单详情' })
  async getOrderDetail(@Param('id') id: string) {
    return this.orderService.getOrderDetail(id);
  }
}
