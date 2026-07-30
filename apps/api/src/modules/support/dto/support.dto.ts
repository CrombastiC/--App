import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SendSupportMessageDto {
  @ApiProperty({ description: "消息正文", maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class SupportConversationsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 30, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 30;

  @ApiPropertyOptional({ description: "按用户昵称或手机号搜索" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["open", "closed"] })
  @IsOptional()
  @IsIn(["open", "closed"])
  status?: "open" | "closed";
}

export class UpdateSupportStatusDto {
  @ApiProperty({ enum: ["open", "closed"] })
  @IsIn(["open", "closed"])
  status: "open" | "closed";
}
