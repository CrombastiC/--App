import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { SupportConversationsQueryDto } from "./dto/support.dto";
import {
  UploadService,
  type UploadedFile,
  type UploadedSupportAttachment,
} from "../upload/upload.service";

type MessageRole = "user" | "admin";
type MessageType = "text" | "image" | "file";

interface MessagePayload {
  content: string;
  messageType: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMime?: string;
}

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  private normalizeContent(content: string) {
    const normalized = content.trim();
    if (!normalized) throw new BadRequestException("消息内容不能为空");
    return normalized;
  }

  private getOrCreateConversation(userId: string) {
    return this.prisma.supportConversation.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private createMessage(
    conversationId: string,
    senderId: string,
    senderRole: MessageRole,
    payload: MessagePayload,
  ) {
    const preview =
      payload.messageType === "text"
        ? payload.content
        : payload.messageType === "image"
          ? "[图片]"
          : `[文件] ${payload.attachmentName || payload.content}`;

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: { conversationId, senderId, senderRole, ...payload },
      });
      await tx.supportConversation.update({
        where: { id: conversationId },
        data: {
          status: "open",
          lastMessagePreview: preview,
          lastMessageAt: message.createdAt,
          ...(senderRole === "user"
            ? { adminUnreadCount: { increment: 1 } }
            : { userUnreadCount: { increment: 1 } }),
        },
      });
      return message;
    });
  }

  private createAttachmentMessage(
    conversationId: string,
    senderId: string,
    senderRole: MessageRole,
    attachment: UploadedSupportAttachment,
  ) {
    return this.createMessage(conversationId, senderId, senderRole, {
      content: attachment.messageType === "image" ? "[图片]" : attachment.name,
      messageType: attachment.messageType,
      attachmentUrl: attachment.url,
      attachmentName: attachment.name,
      attachmentSize: attachment.size,
      attachmentMime: attachment.mimeType,
    });
  }

  async getUserConversation(userId: string) {
    return this.prisma.supportConversation.findUnique({
      where: { userId },
      select: {
        id: true,
        status: true,
        lastMessagePreview: true,
        lastMessageAt: true,
        userUnreadCount: true,
      },
    });
  }

  async getUserMessages(userId: string) {
    const conversation = await this.getOrCreateConversation(userId);
    const [, messages] = await this.prisma.$transaction([
      this.prisma.supportMessage.updateMany({
        where: {
          conversationId: conversation.id,
          senderRole: "admin",
          readAt: null,
        },
        data: { readAt: new Date() },
      }),
      this.prisma.supportMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      this.prisma.supportConversation.updateMany({
        where: { id: conversation.id, userUnreadCount: { gt: 0 } },
        data: { userUnreadCount: 0 },
      }),
    ]);
    return {
      conversationId: conversation.id,
      status: conversation.status,
      messages: messages.reverse(),
    };
  }

  async sendUserMessage(userId: string, content: string) {
    const conversation = await this.getOrCreateConversation(userId);
    return this.createMessage(conversation.id, userId, "user", {
      content: this.normalizeContent(content),
      messageType: "text",
    });
  }

  async sendUserAttachment(userId: string, file: UploadedFile) {
    const conversation = await this.getOrCreateConversation(userId);
    const attachment = this.uploadService.uploadSupportAttachment(file);
    return this.createAttachmentMessage(
      conversation.id,
      userId,
      "user",
      attachment,
    );
  }

  async getAdminConversations(query: SupportConversationsQueryDto) {
    const where: Prisma.SupportConversationWhereInput = {
      status: query.status,
      ...(query.search
        ? {
            user: {
              OR: [
                { username: { contains: query.search, mode: "insensitive" } },
                { phone: { contains: query.search } },
              ],
            },
          }
        : {}),
    };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.supportConversation.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
        include: {
          user: {
            select: { id: true, username: true, phone: true, avatar: true },
          },
        },
      }),
      this.prisma.supportConversation.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }

  async getAdminMessages(conversationId: string) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: { id: true, username: true, phone: true, avatar: true },
        },
      },
    });
    if (!conversation) throw new NotFoundException("客服会话不存在");
    const [, messages] = await this.prisma.$transaction([
      this.prisma.supportMessage.updateMany({
        where: { conversationId, senderRole: "user", readAt: null },
        data: { readAt: new Date() },
      }),
      this.prisma.supportMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      this.prisma.supportConversation.updateMany({
        where: { id: conversationId, adminUnreadCount: { gt: 0 } },
        data: { adminUnreadCount: 0 },
      }),
    ]);
    return { conversation, messages: messages.reverse() };
  }

  async sendAdminMessage(
    adminId: string,
    conversationId: string,
    content: string,
  ) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("客服会话不存在");
    return this.createMessage(conversationId, adminId, "admin", {
      content: this.normalizeContent(content),
      messageType: "text",
    });
  }

  async sendAdminAttachment(
    adminId: string,
    conversationId: string,
    file: UploadedFile,
  ) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("客服会话不存在");
    const attachment = this.uploadService.uploadSupportAttachment(file);
    return this.createAttachmentMessage(
      conversationId,
      adminId,
      "admin",
      attachment,
    );
  }

  async updateConversationStatus(
    conversationId: string,
    status: "open" | "closed",
  ) {
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("客服会话不存在");
    return this.prisma.supportConversation.update({
      where: { id: conversationId },
      data: { status },
    });
  }
}
