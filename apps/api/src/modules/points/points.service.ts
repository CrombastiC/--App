import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  // 获取抽奖数据
  async getLuckyRollData(userId: string) {
    const [prizeList, user, lotteryCount] = await Promise.all([
      this.prisma.lotteryPrize.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.lotteryRecord.count({ where: { userId } }),
    ]);

    return {
      prizeList,
      userIntegral: user?.integral || 0,
      luckyDrawCount: lotteryCount,
    };
  }

  // 兑换奖品（单抽）
  async exchangePrize(userId: string, prizeId: string, costIntegral: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.integral < costIntegral) {
        throw new BadRequestException('积分不足');
      }

      const prize = await tx.lotteryPrize.findUnique({ where: { id: prizeId } });
      if (!prize) throw new BadRequestException('奖品不存在');

      // 扣除积分
      await tx.user.update({
        where: { id: userId },
        data: { integral: { decrement: costIntegral } },
      });

      // 创建抽奖记录
      const record = await tx.lotteryRecord.create({
        data: { userId, prizeId, costIntegral },
        include: { prize: true },
      });

      // 如果是积分奖励，返还积分
      if (prize.prizeIntegral > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { integral: { increment: prize.prizeIntegral } },
        });
        await tx.pointRecord.create({
          data: {
            userId,
            integral: prize.prizeIntegral,
            isGet: true,
            remark: '抽奖获得积分',
          },
        });
      }

      return record;
    });
  }

  // 十连抽
  async exchangeMultiPrize(userId: string, prizeIds: string[], costIntegral: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.integral < costIntegral) {
        throw new BadRequestException('积分不足');
      }

      // 扣除积分
      await tx.user.update({
        where: { id: userId },
        data: { integral: { decrement: costIntegral } },
      });

      // 创建抽奖记录
      const records = await Promise.all(
        prizeIds.map((prizeId) =>
          tx.lotteryRecord.create({
            data: { userId, prizeId, costIntegral: 0 },
            include: { prize: true },
          })
        )
      );

      return records;
    });
  }

  // 获取中奖记录
  async getWinningRecords(isBigPrize?: boolean) {
    const where: any = {};
    if (isBigPrize) {
      where.prize = { prizeIntegral: 0 };
    }

    return this.prisma.lotteryRecord.findMany({
      where,
      include: {
        user: { select: { username: true, avatar: true } },
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // 获取积分商城商品
  async getCommodityList() {
    const commodities = await this.prisma.commodity.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    // 映射为前端期望的字段名
    return commodities.map((item) => ({
      commodityId: item.id,
      commodityName: item.commodityName,
      commodityImage: item.commodityImage,
      commodityIntegral: item.commodityIntegral,
    }));
  }

  // 获取积分收支记录
  async getPointsList(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.pointRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pointRecord.count({ where: { userId } }),
    ]);

    return { data, total, page, limit };
  }

  // ==================== 奖品管理 ====================

  // 获取所有奖品（含已禁用）
  async getPrizeList() {
    return this.prisma.lotteryPrize.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  // 创建奖品
  async createPrize(data: {
    prizeName: string;
    prizeImage: string;
    prizeIntegral: number;
    prizeValue?: number;
    stock?: number;
    sortOrder?: number;
  }) {
    return this.prisma.lotteryPrize.create({ data });
  }

  // 更新奖品
  async updatePrize(id: string, data: {
    prizeName?: string;
    prizeImage?: string;
    prizeIntegral?: number;
    prizeValue?: number;
    stock?: number;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.prisma.lotteryPrize.update({
      where: { id },
      data,
    });
  }

  // 删除奖品
  async deletePrize(id: string) {
    return this.prisma.lotteryPrize.delete({ where: { id } });
  }

  // 切换启用/禁用状态
  async togglePrize(id: string) {
    const prize = await this.prisma.lotteryPrize.findUnique({ where: { id } });
    if (!prize) throw new BadRequestException('奖品不存在');
    return this.prisma.lotteryPrize.update({
      where: { id },
      data: { isActive: !prize.isActive },
    });
  }
}
