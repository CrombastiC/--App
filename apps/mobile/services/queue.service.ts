import request from "@/request";

export interface QueueStore {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  businessHours: string;
  averageWaitMinutes: number;
  canTakeout: boolean;
  waitingCount: number;
}

export interface QueueTicket {
  id: string;
  queueDate: string;
  queueType: "small" | "large";
  number: number;
  ticketCode: string;
  partySize: number;
  status: "waiting" | "called" | "completed" | "cancelled";
  aheadCount: number;
  estimatedWaitMinutes: number;
  createdAt: string;
  calledAt: string | null;
  store: QueueStore;
}

export const queueService = {
  getStores(city?: string, search?: string) {
    return request.get<QueueStore[]>("/api/queue/stores", {
      city: city || undefined,
      search: search || undefined,
    });
  },

  getCurrentTicket() {
    return request.get<QueueTicket | null>("/api/queue/tickets/current");
  },

  createTicket(storeId: string, partySize: number) {
    return request.post<QueueTicket>("/api/queue/tickets", {
      storeId,
      partySize,
    });
  },

  cancelTicket(id: string) {
    return request.patch<QueueTicket>(`/api/queue/tickets/${id}/cancel`);
  },
};
