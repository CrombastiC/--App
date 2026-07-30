import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
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

@ApiTags('管理后台')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(AdminGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '经营概览' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: '用户列表' })
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('orders')
  @ApiOperation({ summary: '订单列表' })
  getOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态' })
  updateOrderStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(id, dto);
  }

  @Get('coupons')
  @ApiOperation({ summary: '优惠券列表' })
  getCoupons(@Query() query: PaginationQueryDto) {
    return this.adminService.getCoupons(query);
  }

  @Post('coupons')
  @ApiOperation({ summary: '创建优惠券' })
  createCoupon(@Body() dto: CreateCouponDto) {
    return this.adminService.createCoupon(dto);
  }

  @Put('coupons/:id')
  @ApiOperation({ summary: '更新优惠券' })
  updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.adminService.updateCoupon(id, dto);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: '删除优惠券' })
  deleteCoupon(@Param('id') id: string) {
    return this.adminService.deleteCoupon(id);
  }

  @Post('coupons/:id/grant')
  @ApiOperation({ summary: '向用户发放优惠券' })
  grantCoupon(@Param('id') id: string, @Body() dto: GrantCouponDto) {
    return this.adminService.grantCoupon(id, dto);
  }

  @Get('gift-cards')
  @ApiOperation({ summary: '礼品卡列表' })
  getGiftCards(@Query() query: PaginationQueryDto) {
    return this.adminService.getGiftCards(query);
  }

  @Post('gift-cards')
  @ApiOperation({ summary: '创建礼品卡' })
  createGiftCard(@Body() dto: CreateGiftCardDto) {
    return this.adminService.createGiftCard(dto);
  }

  @Put('gift-cards/:id')
  @ApiOperation({ summary: '更新礼品卡' })
  updateGiftCard(@Param('id') id: string, @Body() dto: UpdateGiftCardDto) {
    return this.adminService.updateGiftCard(id, dto);
  }

  @Delete('gift-cards/:id')
  @ApiOperation({ summary: '删除礼品卡' })
  deleteGiftCard(@Param('id') id: string) {
    return this.adminService.deleteGiftCard(id);
  }
}
