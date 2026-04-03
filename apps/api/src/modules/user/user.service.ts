import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, RechargeDto } from './dto/user.dto';

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
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
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
      if (isRecharge === 1) {
        // 充值
        newBalance += balance + giveBalance;
      } else {
        // 扣除
        newBalance -= balance;
        if (newBalance < 0) {
          throw new Error('余额不足');
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
    return this.prisma.topUpRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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

    return { checkedIn: !!record };
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
      throw new Error('今天已经签到过了');
    }

    // 签到奖励积分
    const rewardIntegral = 10;

    // 使用事务创建签到记录和更新积分
    return this.prisma.$transaction(async (tx) => {
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
  }
}
