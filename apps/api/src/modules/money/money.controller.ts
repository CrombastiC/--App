import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MoneyService } from './money.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('充值')
@Controller('money')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MoneyController {
  constructor(private readonly moneyService: MoneyService) {}

  @Get('getMoneyList')
  @ApiOperation({ summary: '获取充值选项列表' })
  async getMoneyList() {
    return this.moneyService.getMoneyList();
  }
}
