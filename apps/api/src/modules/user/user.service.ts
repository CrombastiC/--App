import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, RechargeDto, RedeemGiftCardDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 获取用户信息
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        username: true,
        avatar: true,
        gender: true,
        birthday: true,
        balance: true,
        integral: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { userCoupons: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const { _count, ...profile } = user;
    return { ...profile, couponCount: _count.userCoupons };
  }

  // 更新用户信息
  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateDto,
    });

    const { password, ...result } = user;
    return result;
  }

  // 余额充值/扣除
  async rechargeBalance(userId: string, rechargeDto: RechargeDto) {
    const { balance, giveBalance, isRecharge } = rechargeDto;

    // 使用事务更新用户余额和创建充值记录
    const result = await this.prisma.$transaction(async (tx) => {
      // 获取当前用户
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      // 计算新余额
      let newBalance = user.balance;
      if (isRecharge === true) {
        // 充值
        newBalance += balance + giveBalance;
      } else {
        // 扣除
        if (giveBalance !== 0) {
          throw new BadRequestException('余额扣除时赠送金额必须为 0');
        }
        newBalance -= balance;
        if (newBalance < 0) {
          throw new BadRequestException('余额不足');
        }
      }

      // 更新用户余额
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      });

      // 创建充值记录
      await tx.topUpRecord.create({
        data: {
          userId,
          balance,
          giveBalance: giveBalance || 0,
          totalBalance: newBalance,
        },
      });

      const { password, ...result } = updatedUser;
      return result;
    });

    return result;
  }

  // 获取充值记录
  async getTopUpRecords(userId: string) {
    const records = await this.prisma.topUpRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records;
  }

  // 修改密码
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: '密码修改成功' };
  }

  // 获取用户统计信息
  async getStats(userId: string) {
    const [orderCount, couponCount, points] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.userCoupon.count({ where: { userId, status: 'unused' } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { integral: true },
      }),
    ]);

    return {
      orderCount,
      favoriteCount: 0, // 暂无收藏功能
      couponCount,
      points: points?.integral || 0,
    };
  }

  // 注销账户
  async deleteAccount(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: { userId },
        select: { id: true },
      });
      const orderIds = orders.map((order) => order.id);

      await tx.paymentRecord.deleteMany({ where: { userId } });
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      }
      await tx.order.deleteMany({ where: { userId } });
      await tx.userCoupon.deleteMany({ where: { userId } });
      await tx.lotteryRecord.deleteMany({ where: { userId } });
      await tx.pointRecord.deleteMany({ where: { userId } });
      await tx.checkInRecord.deleteMany({ where: { userId } });
      await tx.topUpRecord.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { message: '账户注销成功' };
  }

  // 获取签到状态
  async getCheckInStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await this.prisma.checkInRecord.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 计算连续签到天数
    let streak = 0;
    if (record) {
      streak = await this.calculateStreak(userId);
    }

    return { isCheckIn: !!record, streak };
  }

  // 计算连续签到天数
  private async calculateStreak(userId: string) {
    const records = await this.prisma.checkInRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (records.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i < records.length; i++) {
      const prevDate = new Date(records[i - 1].createdAt);
      prevDate.setHours(0, 0, 0, 0);
      const currDate = new Date(records[i].createdAt);
      currDate.setHours(0, 0, 0, 0);

      const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // 签到
  async checkIn(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 检查今天是否已签到
    const existingRecord = await this.prisma.checkInRecord.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingRecord) {
      throw new BadRequestException('今天已经签到过了');
    }

    // 签到奖励积分
    const rewardIntegral = 10;

    // 使用事务创建签到记录和更新积分
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.checkInRecord.create({
        data: {
          userId,
          integral: rewardIntegral,
        },
      });

      return tx.user.update({
        where: { id: userId },
        data: { integral: { increment: rewardIntegral } },
        select: {
          id: true,
          integral: true,
        },
      });
    });

    // 返回签到结果和连续签到天数
    const streak = await this.calculateStreak(userId);
    return { ...result, streak };
  }

  // 礼品卡兑换
  async redeemGiftCard(userId: string, dto: RedeemGiftCardDto) {
    const { code } = dto;

    const giftCard = await this.prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw new BadRequestException('兑换码不存在');
    }

    if (giftCard.status === 'redeemed') {
      throw new BadRequestException('该兑换码已被使用');
    }

    if (giftCard.status === 'expired') {
      throw new BadRequestException('该兑换码已过期');
    }

    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      throw new BadRequestException('该兑换码已过期');
    }

    // 事务：更新礼品卡状态 → 增加余额 → 创建充值记录
    const result = await this.prisma.$transaction(async (tx) => {
      // 更新礼品卡状态
      await tx.giftCard.update({
        where: { id: giftCard.id },
        data: {
          status: 'redeemed',
          redeemedBy: userId,
          redeemedAt: new Date(),
        },
      });

      // 增加用户余额
      const user = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: giftCard.amount } },
        select: { balance: true },
      });

      // 创建充值记录（标记来源为礼品卡）
      await tx.topUpRecord.create({
        data: {
          userId,
          balance: giftCard.amount,
          giveBalance: 0,
          totalBalance: user.balance,
        },
      });

      return { amount: giftCard.amount, newBalance: user.balance };
    });

    return result;
  }
}
