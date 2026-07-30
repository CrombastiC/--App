import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import {
  CreateCommodityDto,
  UpdateCommodityDto,
} from './dto/admin-points.dto';

@ApiTags('积分商品管理')
@Controller('points/commodity')
@UseGuards(AdminGuard)
@Roles('admin')
@ApiBearerAuth('JWT-auth')
export class CommodityController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('list')
  @ApiOperation({ summary: '获取积分商品列表（含已禁用，分页）' })
  async getCommodityList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pointsService.getCommodityListAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Post('create')
  @ApiOperation({ summary: '创建积分商品' })
  async createCommodity(@Body() dto: CreateCommodityDto) {
    return this.pointsService.createCommodity(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新积分商品' })
  async updateCommodity(
    @Param('id') id: string,
    @Body() dto: UpdateCommodityDto,
  ) {
    return this.pointsService.updateCommodity(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除积分商品' })
  async deleteCommodity(@Param('id') id: string) {
    return this.pointsService.deleteCommodity(id);
  }

  @Put('toggle/:id')
  @ApiOperation({ summary: '启用/禁用积分商品' })
  async toggleCommodity(@Param('id') id: string) {
    return this.pointsService.toggleCommodity(id);
  }
}
