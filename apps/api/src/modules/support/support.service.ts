import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { SupportConversationsQueryDto } from "./dto/support.dto";

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

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
    const normalized = this.normalizeContent(content);
    const conversation = await this.getOrCreateConversation(userId);
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          senderRole: "user",
          content: normalized,
        },
      });
      await tx.supportConversation.update({
        where: { id: conversation.id },
        data: {
          status: "open",
          lastMessagePreview: normalized,
          lastMessageAt: message.createdAt,
          adminUnreadCount: { increment: 1 },
        },
      });
      return message;
    });
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
    const normalized = this.normalizeContent(content);
    const conversation = await this.prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException("客服会话不存在");
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.supportMessage.create({
        data: {
          conversationId,
          senderId: adminId,
          senderRole: "admin",
          content: normalized,
        },
      });
      await tx.supportConversation.update({
        where: { id: conversationId },
        data: {
          status: "open",
          lastMessagePreview: normalized,
          lastMessageAt: message.createdAt,
          userUnreadCount: { increment: 1 },
        },
      });
      return message;
    });
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
