import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MoneyService {
  constructor(private prisma: PrismaService) {}

  // 获取充值选项列表
  async getMoneyList() {
    const options = await this.prisma.moneyOption.findMany({
      where: { isActive: true },
      orderBy: { money: 'asc' },
    });

    // 映射为前端期望的 moneyId 字段
    return options.map((opt) => ({
      moneyId: opt.id,
      money: opt.money,
      giveMoney: opt.giveMoney,
    }));
  }
}
