/*
  Warnings:

  - You are about to drop the column `receiver_id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `buddy_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `meta` on the `ChatMessage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_sender_id_fkey";

-- DropIndex
DROP INDEX "Chat_receiver_id_idx";

-- DropIndex
DROP INDEX "Chat_sender_id_idx";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "receiver_id",
DROP COLUMN "sender_id",
ADD COLUMN     "buddy_id" UUID NOT NULL,
ADD COLUMN     "customer_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "read_at" TIMESTAMP(3),
DROP COLUMN "meta",
ADD COLUMN     "meta" JSON NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_buddy_id_idx" ON "Chat"("buddy_id");

-- CreateIndex
CREATE INDEX "Chat_customer_id_idx" ON "Chat"("customer_id");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
