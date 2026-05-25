import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MoneyService } from './money.service';

@ApiTags('充值')
@Controller('money')
@ApiBearerAuth('JWT-auth')
export class MoneyController {
  constructor(private readonly moneyService: MoneyService) {}

  @Get('getMoneyList')
  @ApiOperation({ summary: '获取充值选项列表' })
  async getMoneyList() {
    return this.moneyService.getMoneyList();
  }
}
