/*
  Warnings:

  - A unique constraint covering the columns `[stripe_account_id]` on the table `Buddy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Buddy" ADD COLUMN     "stripe_account_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_stripe_account_id_key" ON "Buddy"("stripe_account_id");
