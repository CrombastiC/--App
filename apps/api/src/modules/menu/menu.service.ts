import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateFoodDto,
  UpdateFoodDto,
} from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ==================== 菜单查询（客户端） ====================

  /** 获取菜单列表（全部或指定分类），只返回上架菜品 */
  async getMenuList(classifyId?: string) {
    const where = classifyId ? { id: classifyId } : {};
    const categories = await this.prisma.foodCategory.findMany({
      where,
      include: {
        foods: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      classifyId: cat.id,
      classifyName: cat.classifyName,
      icon: cat.icon,
      foods: cat.foods.map((food) => ({
        id: food.id,
        classifyId: food.classifyId,
        foodName: food.foodName,
        foodImage: food.foodImage,
        foodPrice: food.foodPrice,
      })),
    }));
  }

  // ==================== 分类管理（管理后台） ====================

  /** 获取全部分类（含菜品数量） */
  async getCategories() {
    return this.prisma.foodCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { foods: true } },
      },
    });
  }

  /** 创建分类 */
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.foodCategory.create({ data: dto });
  }

  /** 更新分类 */
  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.ensureCategoryExists(id);
    return this.prisma.foodCategory.update({
      where: { id },
      data: dto,
    });
  }

  /** 删除分类 */
  async deleteCategory(id: string) {
    await this.ensureCategoryExists(id);

    // 检查分类下是否有菜品
    const foodCount = await this.prisma.food.count({
      where: { classifyId: id },
    });
    if (foodCount > 0) {
      throw new BadRequestException(`该分类下还有 ${foodCount} 个菜品，请先删除菜品`);
    }

    return this.prisma.foodCategory.delete({ where: { id } });
  }

  // ==================== 菜品管理（管理后台） ====================

  /** 获取全部菜品（含分类信息，支持筛选） */
  async getFoods(classifyId?: string) {
    const where = classifyId ? { classifyId } : {};
    return this.prisma.food.findMany({
      where,
      include: { category: { select: { classifyName: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** 创建菜品 */
  async createFood(dto: CreateFoodDto) {
    await this.ensureCategoryExists(dto.classifyId);
    return this.prisma.food.create({ data: dto });
  }

  /** 更新菜品 */
  async updateFood(id: string, dto: UpdateFoodDto) {
    await this.ensureFoodExists(id);
    if (dto.classifyId) {
      await this.ensureCategoryExists(dto.classifyId);
    }
    return this.prisma.food.update({
      where: { id },
      data: dto,
    });
  }

  /** 删除菜品 */
  async deleteFood(id: string) {
    await this.ensureFoodExists(id);
    return this.prisma.food.delete({ where: { id } });
  }

  /** 切换菜品上下架状态 */
  async toggleFood(id: string) {
    const food = await this.ensureFoodExists(id);
    return this.prisma.food.update({
      where: { id },
      data: { isActive: !food.isActive },
    });
  }

  // ==================== 辅助方法 ====================

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.foodCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  private async ensureFoodExists(id: string) {
    const food = await this.prisma.food.findUnique({ where: { id } });
    if (!food) {
      throw new NotFoundException('菜品不存在');
    }
    return food;
  }
}
