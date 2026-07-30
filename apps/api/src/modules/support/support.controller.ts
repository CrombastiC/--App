import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SendSupportMessageDto } from "./dto/support.dto";
import { SupportService } from "./support.service";

@ApiTags("在线客服")
@ApiBearerAuth("JWT-auth")
@Controller("support")
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("conversation")
  @ApiOperation({ summary: "获取我的客服会话概要" })
  getConversation(@CurrentUser("id") userId: string) {
    return this.supportService.getUserConversation(userId);
  }

  @Get("messages")
  @ApiOperation({ summary: "获取我的客服消息并标记客服消息已读" })
  getMessages(@CurrentUser("id") userId: string) {
    return this.supportService.getUserMessages(userId);
  }

  @Post("messages")
  @ApiOperation({ summary: "向客服发送消息" })
  sendMessage(
    @CurrentUser("id") userId: string,
    @Body() dto: SendSupportMessageDto,
  ) {
    return this.supportService.sendUserMessage(userId, dto.content);
  }
}
