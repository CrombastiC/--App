import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateFoodDto,
  UpdateFoodDto,
} from './dto/menu.dto';

@ApiTags('菜单')
@Controller('menu')
@UseGuards(AdminGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ==================== 客户端接口（公开） ====================

  @Public()
  @Get('getMenuList/:id?')
  @ApiOperation({ summary: '获取菜单列表（客户端）' })
  async getMenuList(@Param('id') id?: string) {
    return this.menuService.getMenuList(id);
  }

  // ==================== 分类管理（管理员） ====================

  @Get('categories')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取分类列表（管理员，分页）' })
  async getCategories(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.menuService.getCategories(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Post('category')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建分类' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Put('category/:id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新分类' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, dto);
  }

  @Delete('category/:id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除分类' })
  async deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  // ==================== 菜品管理（管理员） ====================

  @Get('foods')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取菜品列表（管理员，分页）' })
  async getFoods(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('classifyId') classifyId?: string,
  ) {
    return this.menuService.getFoods(
      Number(page) || 1,
      Number(limit) || 10,
      classifyId,
    );
  }

  @Post('food')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建菜品' })
  async createFood(@Body() dto: CreateFoodDto) {
    return this.menuService.createFood(dto);
  }

  @Put('food/:id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新菜品' })
  async updateFood(@Param('id') id: string, @Body() dto: UpdateFoodDto) {
    return this.menuService.updateFood(id, dto);
  }

  @Delete('food/:id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除菜品' })
  async deleteFood(@Param('id') id: string) {
    return this.menuService.deleteFood(id);
  }

  @Put('food/:id/toggle')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '切换菜品上下架' })
  async toggleFood(@Param('id') id: string) {
    return this.menuService.toggleFood(id);
  }
}
