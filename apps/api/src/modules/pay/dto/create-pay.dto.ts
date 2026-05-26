import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建支付订单 DTO
 */
export class CreatePayDto {
  @ApiProperty({ description: '订单ID' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: '订单标题（显示在支付宝收银台）' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiPropertyOptional({ description: '订单描述' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: '支付金额（元）' })
  @IsNumber()
  @Min(0.01)
  totalAmount: number;

  @ApiPropertyOptional({ description: '支付方式：app（移动端）、page（网页/H5），默认 page' })
  @IsString()
  @IsOptional()
  payType?: 'app' | 'page';
}
