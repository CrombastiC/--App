-- AlterTable
ALTER TABLE "support_messages"
ADD COLUMN "messageType" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN "attachmentUrl" TEXT,
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentSize" INTEGER,
ADD COLUMN "attachmentMime" TEXT;
