import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MoneyService } from './money.service';
import { CreateMoneyOptionDto, UpdateMoneyOptionDto } from './dto/money.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminGuard } from '../../common/guards/admin.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('充值')
@Controller('money')
@ApiBearerAuth('JWT-auth')
export class MoneyController {
  constructor(private readonly moneyService: MoneyService) {}

  @Public()
  @Get('getMoneyList')
  @ApiOperation({ summary: '获取充值选项列表（客户端）' })
  async getMoneyList() {
    return this.moneyService.getMoneyList();
  }

  @Get('all')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '获取充值选项列表（管理端，分页）' })
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moneyService.getAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Post('create')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '创建充值选项' })
  async create(@Body() dto: CreateMoneyOptionDto) {
    return this.moneyService.create(dto);
  }

  @Put('update/:id')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '更新充值选项' })
  async update(@Param('id') id: string, @Body() dto: UpdateMoneyOptionDto) {
    return this.moneyService.update(id, dto);
  }

  @Delete('delete/:id')
  @Roles('admin')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '删除充值选项' })
  async remove(@Param('id') id: string) {
    return this.moneyService.remove(id);
  }
}
