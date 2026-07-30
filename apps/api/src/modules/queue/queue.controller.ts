import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { CreateQueueTicketDto } from "./dto/queue.dto";
import { QueueService } from "./queue.service";

@ApiTags("排队取号")
@ApiBearerAuth("JWT-auth")
@Controller("queue")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get("stores")
  @Public()
  @ApiOperation({ summary: "获取支持排队的门店和实时等位桌数" })
  getStores(@Query("city") city?: string, @Query("search") search?: string) {
    return this.queueService.getStores(city, search);
  }

  @Get("tickets/current")
  @ApiOperation({ summary: "获取当前有效排队号码" })
  getCurrentTicket(@CurrentUser("id") userId: string) {
    return this.queueService.getCurrentTicket(userId);
  }

  @Post("tickets")
  @ApiOperation({ summary: "取号排队" })
  createTicket(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateQueueTicketDto,
  ) {
    return this.queueService.createTicket(userId, dto);
  }

  @Patch("tickets/:id/cancel")
  @ApiOperation({ summary: "取消排队" })
  cancelTicket(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.queueService.cancelTicket(userId, id);
  }
}
