-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "averageWaitMinutes" INTEGER NOT NULL DEFAULT 8,
    "canTakeout" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_queue_counters" (
    "storeId" TEXT NOT NULL,
    "queueDate" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "store_queue_counters_pkey" PRIMARY KEY ("storeId", "queueDate")
);

-- CreateTable
CREATE TABLE "queue_tickets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "queueDate" TEXT NOT NULL,
    "queueType" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "partySize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "calledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastMessagePreview" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "userUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "adminUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stores_city_isActive_idx" ON "stores"("city", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "queue_tickets_storeId_queueDate_queueType_number_key" ON "queue_tickets"("storeId", "queueDate", "queueType", "number");

-- CreateIndex
CREATE INDEX "queue_tickets_userId_status_idx" ON "queue_tickets"("userId", "status");

-- CreateIndex
CREATE INDEX "queue_tickets_storeId_queueDate_queueType_status_number_idx" ON "queue_tickets"("storeId", "queueDate", "queueType", "status", "number");

-- CreateIndex
CREATE UNIQUE INDEX "support_conversations_userId_key" ON "support_conversations"("userId");

-- CreateIndex
CREATE INDEX "support_conversations_status_lastMessageAt_idx" ON "support_conversations"("status", "lastMessageAt");

-- CreateIndex
CREATE INDEX "support_messages_conversationId_createdAt_idx" ON "support_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "support_messages_conversationId_senderRole_readAt_idx" ON "support_messages"("conversationId", "senderRole", "readAt");

-- AddForeignKey
ALTER TABLE "store_queue_counters" ADD CONSTRAINT "store_queue_counters_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SeedData
INSERT INTO "stores" ("id", "name", "city", "address", "phone", "businessHours", "averageWaitMinutes", "canTakeout", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('store-shanghai-zhonghai', '黛西餐厅（中海大厦店）', '上海市', '静安区江场三路134号', '18339658260', '10:00-22:00', 8, true, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store-shanghai-jingan', '黛西餐厅（静安大悦城店）', '上海市', '静安区西藏北路166号', '18878006788', '10:00-22:00', 7, true, true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store-shanghai-pudong', '黛西餐厅（浦东世纪汇店）', '上海市', '浦东新区世纪大道1192号', '18878006789', '10:30-21:30', 10, true, true, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('store-hangzhou-hubin', '黛西餐厅（杭州湖滨店）', '杭州市', '上城区湖滨路28号', '18878006790', '10:00-22:00', 8, true, true, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
