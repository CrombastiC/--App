import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SendSupportMessageDto } from "./dto/support.dto";
import { SupportService } from "./support.service";
import type { UploadedFile as UploadedFileType } from "../upload/upload.service";

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
  @ApiOperation({ summary: "向客服发送文字消息" })
  sendMessage(
    @CurrentUser("id") userId: string,
    @Body() dto: SendSupportMessageDto,
  ) {
    return this.supportService.sendUserMessage(userId, dto.content);
  }

  @Post("attachments")
  @ApiOperation({ summary: "向客服发送图片或文件" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
      required: ["file"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  sendAttachment(
    @CurrentUser("id") userId: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    return this.supportService.sendUserAttachment(userId, file);
  }
}
