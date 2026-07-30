import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateQueueTicketDto } from "./dto/queue.dto";

const ACTIVE_STATUSES = ["waiting", "called"];

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  private getQueueDate() {
    const chinaTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    return chinaTime.toISOString().slice(0, 10);
  }

  private async toTicketResult(ticket: {
    id: string;
    storeId: string;
    queueDate: string;
    queueType: string;
    number: number;
    partySize: number;
    status: string;
    createdAt: Date;
    calledAt: Date | null;
    store: {
      id: string;
      name: string;
      city: string;
      address: string;
      phone: string;
      businessHours: string;
      averageWaitMinutes: number;
    };
  }) {
    const aheadCount =
      ticket.status === "waiting"
        ? await this.prisma.queueTicket.count({
            where: {
              storeId: ticket.storeId,
              queueDate: ticket.queueDate,
              queueType: ticket.queueType,
              status: "waiting",
              number: { lt: ticket.number },
            },
          })
        : 0;

    return {
      ...ticket,
      ticketCode: `${ticket.queueType === "small" ? "A" : "B"}${String(ticket.number).padStart(3, "0")}`,
      aheadCount,
      estimatedWaitMinutes: aheadCount * ticket.store.averageWaitMinutes,
    };
  }

  async getStores(city?: string, search?: string) {
    const queueDate = this.getQueueDate();
    const stores = await this.prisma.store.findMany({
      where: {
        isActive: true,
        ...(city ? { city } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return Promise.all(
      stores.map(async (store) => ({
        ...store,
        waitingCount: await this.prisma.queueTicket.count({
          where: { storeId: store.id, queueDate, status: "waiting" },
        }),
      })),
    );
  }

  async getCurrentTicket(userId: string) {
    const queueDate = this.getQueueDate();
    const ticket = await this.prisma.queueTicket.findFirst({
      where: { userId, queueDate, status: { in: ACTIVE_STATUSES } },
      include: { store: true },
      orderBy: { createdAt: "desc" },
    });
    return ticket ? this.toTicketResult(ticket) : null;
  }

  async createTicket(userId: string, dto: CreateQueueTicketDto) {
    const queueDate = this.getQueueDate();
    const existing = await this.prisma.queueTicket.findFirst({
      where: { userId, queueDate, status: { in: ACTIVE_STATUSES } },
    });
    if (existing) {
      throw new BadRequestException("你已有进行中的排队号码，请先取消后再取号");
    }

    const store = await this.prisma.store.findFirst({
      where: { id: dto.storeId, isActive: true },
    });
    if (!store) throw new NotFoundException("门店不存在或暂不支持排队");

    const queueType = dto.partySize <= 4 ? "small" : "large";
    const ticket = await this.prisma.$transaction(async (tx) => {
      const counter = await tx.storeQueueCounter.upsert({
        where: { storeId_queueDate: { storeId: store.id, queueDate } },
        create: { storeId: store.id, queueDate, lastNumber: 1 },
        update: { lastNumber: { increment: 1 } },
      });
      return tx.queueTicket.create({
        data: {
          userId,
          storeId: store.id,
          queueDate,
          queueType,
          number: counter.lastNumber,
          partySize: dto.partySize,
        },
        include: { store: true },
      });
    });

    return this.toTicketResult(ticket);
  }

  async cancelTicket(userId: string, id: string) {
    const ticket = await this.prisma.queueTicket.findFirst({
      where: { id, userId },
    });
    if (!ticket) throw new NotFoundException("排队号码不存在");
    if (!ACTIVE_STATUSES.includes(ticket.status)) {
      throw new BadRequestException("当前排队号码不能取消");
    }
    return this.prisma.queueTicket.update({
      where: { id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
  }
}
