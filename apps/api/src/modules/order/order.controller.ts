import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';

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

  @Get('all')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '获取订单列表（管理端，分页）' })
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.getAll(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @Put('status/:id')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '更新订单状态' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateStatus(id, status);
  }
}
