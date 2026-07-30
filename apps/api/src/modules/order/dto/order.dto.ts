import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  CreateOrderRequest,
  OrderItem,
  OrderStatus,
  OrderType,
} from '@orderfood/common';

export class OrderItemDto implements OrderItem {
  @ApiProperty({ description: '菜品 ID' })
  @IsString()
  foodId: string;

  @ApiProperty({ description: '菜品名称' })
  @IsString()
  foodName: string;

  @ApiProperty({ description: '菜品单价' })
  @IsNumber()
  @Min(0)
  foodPrice: number;

  @ApiProperty({ description: '数量' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: '小计' })
  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class CreateOrderDto implements CreateOrderRequest {
  @ApiProperty({ enum: ['dine-in', 'takeout'] })
  @IsIn(['dine-in', 'takeout'])
  orderType: OrderType;

  @ApiProperty({ description: '订单原价' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: '实际支付金额' })
  @IsNumber()
  @Min(0)
  payAmount: number;

  @ApiPropertyOptional({ description: '配送地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '就餐人数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  peopleCount?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderListQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'paid', 'completed', 'cancelled'] })
  @IsOptional()
  @IsIn(['pending', 'paid', 'completed', 'cancelled'])
  status?: OrderStatus;
}
