import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('菜单')
@Controller('menu')
@Public()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('getMenuList/:id?')
  @ApiOperation({ summary: '获取菜单列表' })
  async getMenuList(@Param('id') id?: string) {
    return this.menuService.getMenuList(id);
  }

  @Post('createFood')
  @ApiOperation({ summary: '创建菜品' })
  async createFood(
    @Body() data: { classifyId: string; foodName: string; foodPrice: number; foodImage?: string },
  ) {
    return this.menuService.createFood(data);
  }
}
