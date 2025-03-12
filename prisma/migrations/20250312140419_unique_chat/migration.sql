/*
  Warnings:

  - A unique constraint covering the columns `[buddy_id,customer_id]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chat_buddy_id_customer_id_key" ON "Chat"("buddy_id", "customer_id");
