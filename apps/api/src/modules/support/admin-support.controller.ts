import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
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
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminGuard } from "../../common/guards/admin.guard";
import {
  SendSupportMessageDto,
  SupportConversationsQueryDto,
  UpdateSupportStatusDto,
} from "./dto/support.dto";
import { SupportService } from "./support.service";
import type { UploadedFile as UploadedFileType } from "../upload/upload.service";

@ApiTags("管理后台-在线客服")
@ApiBearerAuth("JWT-auth")
@Controller("admin/support")
@UseGuards(AdminGuard)
@Roles("admin")
export class AdminSupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("conversations")
  @ApiOperation({ summary: "客服会话列表" })
  getConversations(@Query() query: SupportConversationsQueryDto) {
    return this.supportService.getAdminConversations(query);
  }

  @Get("conversations/:id/messages")
  @ApiOperation({ summary: "获取会话消息并标记用户消息已读" })
  getMessages(@Param("id") id: string) {
    return this.supportService.getAdminMessages(id);
  }

  @Post("conversations/:id/messages")
  @ApiOperation({ summary: "客服回复文字消息" })
  sendMessage(
    @CurrentUser("id") adminId: string,
    @Param("id") id: string,
    @Body() dto: SendSupportMessageDto,
  ) {
    return this.supportService.sendAdminMessage(adminId, id, dto.content);
  }

  @Post("conversations/:id/attachments")
  @ApiOperation({ summary: "客服发送图片或文件" })
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
    @CurrentUser("id") adminId: string,
    @Param("id") id: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    return this.supportService.sendAdminAttachment(adminId, id, file);
  }

  @Post("conversations/:id/status")
  @ApiOperation({ summary: "关闭或重新打开会话" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateSupportStatusDto) {
    return this.supportService.updateConversationStatus(id, dto.status);
  }
}
