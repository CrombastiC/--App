import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMoneyOptionDto {
  @ApiProperty({ description: '充值金额' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  money: number;

  @ApiProperty({ description: '赠送金额', required: false })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  giveMoney: number;

  @ApiProperty({ description: '排序', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;
}

export class UpdateMoneyOptionDto {
  @ApiProperty({ description: '充值金额', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  money?: number;

  @ApiProperty({ description: '赠送金额', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  giveMoney?: number;

  @ApiProperty({ description: '排序', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
