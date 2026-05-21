import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '性别 0:男 1:女 2:保密', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  @Type(() => Number)
  gender?: number;

  @ApiProperty({ description: '生日', required: false })
  @IsOptional()
  @IsString()
  birthday?: string;
}

export class RechargeDto {
  @ApiProperty({ description: '充值金额' })
  @IsNumber()
  @Type(() => Number)
  balance: number;

  @ApiProperty({ description: '赠送金额' })
  @IsNumber()
  @Type(() => Number)
  giveBalance: number;

  @ApiProperty({ description: '是否充值 true:充值 false:扣除' })
  @IsBoolean()
  isRecharge: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '原密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  newPassword: string;
}
