import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('优惠券')
@Controller('coupon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('getCouponList')
  @ApiOperation({ summary: '获取用户优惠券列表' })
  async getCouponList(
    @CurrentUser('id') userId: string,
    @Body() body: { isExpired?: boolean },
  ) {
    return this.couponService.getCouponList(userId, body.isExpired);
  }
}
