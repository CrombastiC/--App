import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}

export class AdminUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '按手机号或昵称搜索' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['user', 'admin'] })
  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}

export class AdminOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: '按订单号、手机号或昵称搜索' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['pending', 'paid', 'completed', 'cancelled'] })
  @IsOptional()
  @IsIn(['pending', 'paid', 'completed', 'cancelled'])
  status?: 'pending' | 'paid' | 'completed' | 'cancelled';
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['paid', 'completed', 'cancelled'] })
  @IsIn(['paid', 'completed', 'cancelled'])
  status: 'paid' | 'completed' | 'cancelled';
}

export class CreateCouponDto {
  @ApiProperty({ description: '优惠券名称' })
  @IsString()
  couponName: string;

  @ApiProperty({ description: '优惠金额' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  couponAmount: number;

  @ApiProperty({ description: '最低消费金额' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  consumeMoney: number;

  @ApiProperty({ description: '有效期' })
  @IsDateString()
  couponUseTime: string;

  @ApiProperty({ description: '发行库存' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalStock: number;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ description: '优惠券名称' })
  @IsOptional()
  @IsString()
  couponName?: string;

  @ApiPropertyOptional({ description: '优惠金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  couponAmount?: number;

  @ApiPropertyOptional({ description: '最低消费金额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  consumeMoney?: number;

  @ApiPropertyOptional({ description: '有效期' })
  @IsOptional()
  @IsDateString()
  couponUseTime?: string;

  @ApiPropertyOptional({ description: '追加库存' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  addStock?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @Type(() => Boolean)
  @IsIn([true, false])
  isActive?: boolean;
}

export class GrantCouponDto {
  @ApiProperty({ description: '领取用户 ID' })
  @IsString()
  userId: string;
}

export class CreateGiftCardDto {
  @ApiPropertyOptional({ description: '兑换码，不填则自动生成' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '礼品卡面额' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateGiftCardDto {
  @ApiPropertyOptional({ description: '礼品卡面额' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiPropertyOptional({ description: '过期时间' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ enum: ['active', 'expired'] })
  @IsOptional()
  @IsIn(['active', 'expired'])
  status?: 'active' | 'expired';
}
