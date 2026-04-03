import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // 获取菜单列表（全部或指定分类）
  async getMenuList(classifyId?: string) {
    if (classifyId) {
      const category = await this.prisma.foodCategory.findUnique({
        where: { id: classifyId },
        include: {
          foods: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      return category ? [category] : [];
    }

    return this.prisma.foodCategory.findMany({
      where: {},
      include: {
        foods: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // 创建菜品
  async createFood(data: {
    classifyId: string;
    foodName: string;
    foodPrice: number;
    foodImage?: string;
  }) {
    return this.prisma.food.create({
      data,
    });
  }
}
