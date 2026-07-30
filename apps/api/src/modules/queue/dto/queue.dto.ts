import { Type } from "class-transformer";
import { IsInt, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateQueueTicketDto {
  @ApiProperty({ description: "门店 ID" })
  @IsString()
  storeId: string;

  @ApiProperty({ description: "就餐人数", minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  partySize: number;
}
