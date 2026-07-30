import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  private toLuckyRollData(prize: {
    id: string;
    prizeName: string;
    prizeImage: string;
    prizeIntegral: number;
  }) {
    return {
      id: prize.id,
      prizeName: prize.prizeName,
      prizeImage: prize.prizeImage,
      prizeIntegral: prize.prizeIntegral,
    };
  }

  // 获取抽奖数据
  async getLuckyRollData(userId: string) {
    const { start, end } = this.getTodayRange();
    const [prizeList, user, todayCheckIn, usedFreeDraw] = await Promise.all([
      this.prisma.lotteryPrize.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.checkInRecord.findFirst({
        where: { userId, createdAt: { gte: start, lt: end } },
      }),
      this.prisma.lotteryRecord.findFirst({
        where: {
          userId,
          costIntegral: 0,
          createdAt: { gte: start, lt: end },
        },
      }),
    ]);

    return {
      prizeList: prizeList.map((prize) => this.toLuckyRollData(prize)),
      userIntegral: user?.integral || 0,
      luckyDrawCount: todayCheckIn && !usedFreeDraw ? 1 : 0,
    };
  }

  // 兑换奖品（单抽）
  async exchangePrize(userId: string, prizeId: string, costIntegral: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      const isFreeDraw = costIntegral === 0;
      if (isFreeDraw) {
        const { start, end } = this.getTodayRange();
        const [todayCheckIn, usedFreeDraw] = await Promise.all([
          tx.checkInRecord.findFirst({
            where: { userId, createdAt: { gte: start, lt: end } },
          }),
          tx.lotteryRecord.findFirst({
            where: {
              userId,
              costIntegral: 0,
              createdAt: { gte: start, lt: end },
            },
          }),
        ]);
        if (!todayCheckIn || usedFreeDraw) {
          throw new BadRequestException('今日暂无免费抽奖次数');
        }
      } else if (costIntegral !== 200 || user.integral < 200) {
        throw new BadRequestException('积分不足');
      }

      const prize = await tx.lotteryPrize.findUnique({ where: { id: prizeId } });
      if (!prize || !prize.isActive) throw new BadRequestException('奖品不存在');
      if (prize.prizeIntegral === 0 && prize.stock <= 0) {
        throw new BadRequestException('奖品库存不足');
      }

      if (!isFreeDraw) {
        await tx.user.update({
          where: { id: userId },
          data: { integral: { decrement: 200 } },
        });
        await tx.pointRecord.create({
          data: { userId, integral: 200, isGet: false, remark: '积分抽奖' },
        });
      }

      // 创建抽奖记录
      await tx.lotteryRecord.create({
        data: { userId, prizeId, costIntegral },
      });

      if (prize.prizeIntegral === 0) {
        await tx.lotteryPrize.update({
          where: { id: prize.id },
          data: { stock: { decrement: 1 } },
        });
      }

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

      return this.toLuckyRollData(prize);
    });
  }

  // 十连抽
  async exchangeMultiPrize(userId: string, prizeIds: string[], costIntegral: number) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || costIntegral !== 2000 || user.integral < 2000) {
        throw new BadRequestException('积分不足');
      }

      const prizes = await tx.lotteryPrize.findMany({
        where: { id: { in: prizeIds }, isActive: true },
      });
      const prizeMap = new Map(prizes.map((prize) => [prize.id, prize]));
      const orderedPrizes = prizeIds.map((prizeId) => prizeMap.get(prizeId));
      if (orderedPrizes.some((prize) => !prize)) {
        throw new BadRequestException('奖品不存在或已下架');
      }

      const bigPrizeCounts = new Map<string, number>();
      for (const prize of orderedPrizes) {
        if (prize && prize.prizeIntegral === 0) {
          bigPrizeCounts.set(prize.id, (bigPrizeCounts.get(prize.id) || 0) + 1);
        }
      }
      for (const [prizeId, count] of bigPrizeCounts) {
        const prize = prizeMap.get(prizeId)!;
        if (prize.stock < count) {
          throw new BadRequestException(`奖品「${prize.prizeName}」库存不足`);
        }
      }

      // 扣除积分
      await tx.user.update({
        where: { id: userId },
        data: { integral: { decrement: 2000 } },
      });
      await tx.pointRecord.create({
        data: { userId, integral: 2000, isGet: false, remark: '积分十连抽' },
      });

      // 创建抽奖记录
      for (const prizeId of prizeIds) {
        await tx.lotteryRecord.create({
          data: { userId, prizeId, costIntegral: 200 },
        });
      }

      for (const [prizeId, count] of bigPrizeCounts) {
        await tx.lotteryPrize.update({
          where: { id: prizeId },
          data: { stock: { decrement: count } },
        });
      }

      const earnedIntegral = orderedPrizes.reduce(
        (total, prize) => total + (prize?.prizeIntegral || 0),
        0,
      );
      if (earnedIntegral > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { integral: { increment: earnedIntegral } },
        });
        await tx.pointRecord.create({
          data: {
            userId,
            integral: earnedIntegral,
            isGet: true,
            remark: '十连抽获得积分',
          },
        });
      }

      return orderedPrizes.map((prize) => this.toLuckyRollData(prize!));
    });
  }

  // 获取中奖记录
  async getWinningRecords(isBigPrize?: boolean) {
    const where = isBigPrize ? { prize: { prizeIntegral: 0 } } : {};

    const records = await this.prisma.lotteryRecord.findMany({
      where,
      include: {
        user: { select: { username: true, avatar: true } },
        prize: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return records.map((record) => ({
      id: record.id,
      userAvatar: record.user.avatar || '',
      username: record.user.username,
      prizeName: record.prize.prizeName,
      prizeImage: record.prize.prizeImage,
      createdAt: record.createdAt.toISOString(),
    }));
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
    const existing = await this.prisma.lotteryPrize.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('奖品不存在');
    return this.prisma.lotteryPrize.update({
      where: { id },
      data,
    });
  }

  // 删除奖品
  async deletePrize(id: string) {
    const recordCount = await this.prisma.lotteryRecord.count({ where: { prizeId: id } });
    if (recordCount > 0) {
      throw new BadRequestException('该奖品已有抽奖记录，只能停用，不能删除');
    }
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

  // ==================== 积分商品管理 ====================

  // 获取所有商品（含已禁用，分页）
  async getCommodityListAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.commodity.findMany({
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.commodity.count(),
    ]);
    return { data, total, page, limit };
  }

  // 创建商品
  async createCommodity(data: {
    commodityName: string;
    commodityImage: string;
    commodityIntegral: number;
    stock?: number;
    sortOrder?: number;
  }) {
    return this.prisma.commodity.create({ data });
  }

  // 更新商品
  async updateCommodity(id: string, data: {
    commodityName?: string;
    commodityImage?: string;
    commodityIntegral?: number;
    stock?: number;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const existing = await this.prisma.commodity.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('积分商品不存在');
    return this.prisma.commodity.update({
      where: { id },
      data,
    });
  }

  // 删除商品
  async deleteCommodity(id: string) {
    const existing = await this.prisma.commodity.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException('积分商品不存在');
    return this.prisma.commodity.delete({ where: { id } });
  }

  // 切换商品启用/禁用状态
  async toggleCommodity(id: string) {
    const commodity = await this.prisma.commodity.findUnique({ where: { id } });
    if (!commodity) throw new BadRequestException('商品不存在');
    return this.prisma.commodity.update({
      where: { id },
      data: { isActive: !commodity.isActive },
    });
  }
}
