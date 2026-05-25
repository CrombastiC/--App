import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== 分类 DTO ====================

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  classifyName: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '分类名称' })
  @IsOptional()
  @IsString()
  classifyName?: string;

  @ApiPropertyOptional({ description: '分类图标' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ==================== 菜品 DTO ====================

export class CreateFoodDto {
  @ApiProperty({ description: '所属分类 ID' })
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  @IsString()
  classifyId: string;

  @ApiProperty({ description: '菜品名称' })
  @IsNotEmpty({ message: '菜品名称不能为空' })
  @IsString()
  foodName: string;

  @ApiProperty({ description: '菜品价格' })
  @IsNotEmpty({ message: '价格不能为空' })
  @IsNumber()
  @Min(0, { message: '价格不能为负数' })
  foodPrice: number;

  @ApiPropertyOptional({ description: '菜品图片' })
  @IsOptional()
  @IsString()
  foodImage?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateFoodDto {
  @ApiPropertyOptional({ description: '所属分类 ID' })
  @IsOptional()
  @IsString()
  classifyId?: string;

  @ApiPropertyOptional({ description: '菜品名称' })
  @IsOptional()
  @IsString()
  foodName?: string;

  @ApiPropertyOptional({ description: '菜品价格' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '价格不能为负数' })
  foodPrice?: number;

  @ApiPropertyOptional({ description: '菜品图片' })
  @IsOptional()
  @IsString()
  foodImage?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否上架' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
