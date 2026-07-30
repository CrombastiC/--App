import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateOrderDto, OrderListQueryDto } from './dto/order.dto';

@ApiTags('订单')
@Controller('order')
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  @ApiOperation({ summary: '创建订单' })
  async createOrder(
    @CurrentUser('id') userId: string,
    @Body() data: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, data);
  }

  @Get('list')
  @ApiOperation({ summary: '获取订单列表' })
  async getOrders(
    @CurrentUser('id') userId: string,
    @Query() query: OrderListQueryDto,
  ) {
    return this.orderService.getOrders(userId, query.status);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '获取订单详情' })
  async getOrderDetail(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.orderService.getOrderDetail(userId, id);
  }
}
