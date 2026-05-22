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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export interface CreatePrizeDto {
  prizeName: string;
  prizeImage: string;
  prizeIntegral: number;
  prizeValue?: number;
  stock?: number;
  sortOrder?: number;
}

export interface UpdatePrizeDto {
  prizeName?: string;
  prizeImage?: string;
  prizeIntegral?: number;
  prizeValue?: number;
  stock?: number;
  sortOrder?: number;
  isActive?: boolean;
}

@ApiTags('奖品管理')
@Controller('points/prize')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PrizeController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('list')
  @ApiOperation({ summary: '获取所有奖品列表（含已禁用）' })
  async getPrizeList() {
    return this.pointsService.getPrizeList();
  }

  @Post('create')
  @ApiOperation({ summary: '创建奖品' })
  async createPrize(@Body() dto: CreatePrizeDto) {
    return this.pointsService.createPrize(dto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新奖品' })
  async updatePrize(
    @Param('id') id: string,
    @Body() dto: UpdatePrizeDto,
  ) {
    return this.pointsService.updatePrize(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除奖品' })
  async deletePrize(@Param('id') id: string) {
    return this.pointsService.deletePrize(id);
  }

  @Put('toggle/:id')
  @ApiOperation({ summary: '启用/禁用奖品' })
  async togglePrize(@Param('id') id: string) {
    return this.pointsService.togglePrize(id);
  }
}
