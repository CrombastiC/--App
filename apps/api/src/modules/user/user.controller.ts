import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto, RechargeDto } from './dto/user.dto';
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
}
