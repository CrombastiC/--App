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
  messageType: "text" | "image" | "file";
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSize: number | null;
  attachmentMime: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SupportUploadFile {
  uri: string;
  name: string;
  type: string;
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

  uploadAttachment(file: SupportUploadFile) {
    return request.upload<SupportMessage>("/api/support/attachments", file, {
      timeout: 30000,
    });
  },
};
