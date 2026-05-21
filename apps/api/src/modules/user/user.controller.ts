import { Controller, Get, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto, RechargeDto, ChangePasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUserInfo')
  @ApiOperation({ summary: '获取用户信息' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('update')
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateDto);
  }

  @Post('rechargeAndDeduct')
  @ApiOperation({ summary: '余额充值/扣除' })
  async rechargeBalance(
    @CurrentUser('id') userId: string,
    @Body() rechargeDto: RechargeDto,
  ) {
    return this.userService.rechargeBalance(userId, rechargeDto);
  }

  @Get('getRechargeRecord')
  @ApiOperation({ summary: '获取充值记录' })
  async getTopUpRecords(@CurrentUser('id') userId: string) {
    return this.userService.getTopUpRecords(userId);
  }

  @Get('getCheckInStatus')
  @ApiOperation({ summary: '获取签到状态' })
  async getCheckInStatus(@CurrentUser('id') userId: string) {
    return this.userService.getCheckInStatus(userId);
  }

  @Post('checkIn')
  @ApiOperation({ summary: '签到' })
  async checkIn(@CurrentUser('id') userId: string) {
    return this.userService.checkIn(userId);
  }

  @Post('change-password')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户统计信息' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.userService.getStats(userId);
  }

  @Delete('account')
  @ApiOperation({ summary: '注销账户' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.userService.deleteAccount(userId);
  }
}
