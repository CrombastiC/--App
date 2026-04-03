import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MoneyService {
  constructor(private prisma: PrismaService) {}

  // 获取充值选项列表
  async getMoneyList() {
    return this.prisma.moneyOption.findMany({
      where: { isActive: true },
      orderBy: { money: 'asc' },
    });
  }
}
