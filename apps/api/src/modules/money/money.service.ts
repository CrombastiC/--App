import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMoneyOptionDto, UpdateMoneyOptionDto } from './dto/money.dto';

@Injectable()
export class MoneyService {
  constructor(private prisma: PrismaService) {}

  // 获取充值选项列表（客户端）
  async getMoneyList() {
    const options = await this.prisma.moneyOption.findMany({
      where: { isActive: true },
      orderBy: { money: 'asc' },
    });

    return options.map((opt) => ({
      moneyId: opt.id,
      money: opt.money,
      giveMoney: opt.giveMoney,
    }));
  }

  // 获取充值选项列表（管理端，分页）
  async getAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.moneyOption.findMany({
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.moneyOption.count(),
    ]);
    return { data, total, page, limit };
  }

  // 创建充值选项
  async create(dto: CreateMoneyOptionDto) {
    return this.prisma.moneyOption.create({ data: dto });
  }

  // 更新充值选项
  async update(id: string, dto: UpdateMoneyOptionDto) {
    const option = await this.prisma.moneyOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('充值选项不存在');
    return this.prisma.moneyOption.update({ where: { id }, data: dto });
  }

  // 删除充值选项
  async remove(id: string) {
    const option = await this.prisma.moneyOption.findUnique({ where: { id } });
    if (!option) throw new NotFoundException('充值选项不存在');
    return this.prisma.moneyOption.delete({ where: { id } });
  }
}
