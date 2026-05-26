import { Controller, Post, Get, Body, Param, All, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayService } from './pay.service';
import { CreatePayDto } from './dto/create-pay.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { Request } from 'express';

@ApiTags('支付')
@Controller('pay')
export class PayController {
  constructor(private readonly payService: PayService) {}

  @Post('create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建支付订单（生成支付链接或签名串）' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPayDto: CreatePayDto,
  ) {
    return this.payService.create(createPayDto, userId);
  }

  @Get('status/:orderId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '查询订单支付状态' })
  async queryPayStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.payService.queryPayStatus(orderId, userId);
  }

  /**
   * 支付宝异步通知回调
   * 注意：此接口必须为公开接口（无需认证），由支付宝服务端直接调用
   */
  @Public()
  @All('notify')
  @ApiOperation({ summary: '支付宝支付异步通知回调' })
  async notify(@Req() req: Request) {
    return this.payService.notify(req);
  }
}
