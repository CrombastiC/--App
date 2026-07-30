import request from "@/request";

export interface SupportConversationSummary {
  id: string;
  status: "open" | "closed";
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  userUnreadCount: number;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: "user" | "admin";
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface SupportMessagesResult {
  conversationId: string;
  status: "open" | "closed";
  messages: SupportMessage[];
}

export const supportService = {
  getConversation() {
    return request.get<SupportConversationSummary | null>(
      "/api/support/conversation",
    );
  },

  getMessages() {
    return request.get<SupportMessagesResult>("/api/support/messages");
  },

  sendMessage(content: string) {
    return request.post<SupportMessage>("/api/support/messages", { content });
  },
};
