import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ExchangeMultiPrizeRequest,
  ExchangePrizeRequest,
  GetPointsListRequest,
} from '@orderfood/common';

export class ExchangePrizeDto implements ExchangePrizeRequest {
  @ApiProperty({ description: '奖品 ID' })
  @IsString()
  prizeId: string;

  @ApiProperty({ description: '消耗积分，签到免费抽为 0，普通单抽为 200' })
  @IsIn([0, 200])
  costIntegral: number;
}

export class ExchangeMultiPrizeDto implements ExchangeMultiPrizeRequest {
  @ApiProperty({ description: '十连抽奖品 ID', type: [String] })
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  prizeIds: string[];

  @ApiProperty({ description: '十连抽固定消耗积分', example: 2000 })
  @IsIn([2000])
  costIntegral: number;
}

export class PointsListQueryDto implements GetPointsListRequest {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;
}
