-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('ADMIN', 'CLIENT', 'PROVIDER');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('HOURLY', 'FIXED', 'CUSTOM', 'PER_UNIT');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN     "quantity" INTEGER DEFAULT 1,
ADD COLUMN     "unitType" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "acceptsCustomQuotes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "acceptsFixedPrice" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultHourlyRate" DOUBLE PRECISION,
ADD COLUMN     "defaultPricingType" "PricingType" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN     "minimumJobPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "fixedPrice" DOUBLE PRECISION,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "priceMax" DOUBLE PRECISION,
ADD COLUMN     "priceMin" DOUBLE PRECISION,
ADD COLUMN     "pricingType" "PricingType" NOT NULL DEFAULT 'HOURLY';

-- CreateTable
CREATE TABLE "admin_conversations" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "ConversationType" NOT NULL,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "ConversationType" NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_conversations_adminId_idx" ON "admin_conversations"("adminId");

-- CreateIndex
CREATE INDEX "admin_conversations_userId_idx" ON "admin_conversations"("userId");

-- CreateIndex
CREATE INDEX "admin_conversations_lastMessageAt_idx" ON "admin_conversations"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_conversations_adminId_userId_userType_key" ON "admin_conversations"("adminId", "userId", "userType");

-- CreateIndex
CREATE INDEX "admin_messages_conversationId_idx" ON "admin_messages"("conversationId");

-- CreateIndex
CREATE INDEX "admin_messages_senderId_idx" ON "admin_messages"("senderId");

-- CreateIndex
CREATE INDEX "admin_messages_createdAt_idx" ON "admin_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "admin_conversations" ADD CONSTRAINT "admin_conversations_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_conversations" ADD CONSTRAINT "admin_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_messages" ADD CONSTRAINT "admin_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "admin_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_messages" ADD CONSTRAINT "admin_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
