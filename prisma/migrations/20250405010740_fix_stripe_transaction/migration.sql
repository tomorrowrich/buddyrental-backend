/*
  Warnings:

  - The values [SUCCESS] on the enum `TrasactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[payment_id]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TrasactionStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'VOIDED');
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TrasactionStatus_new" USING ("status"::text::"TrasactionStatus_new");
ALTER TYPE "TrasactionStatus" RENAME TO "TrasactionStatus_old";
ALTER TYPE "TrasactionStatus_new" RENAME TO "TrasactionStatus";
DROP TYPE "TrasactionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "payment_id" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_payment_id_key" ON "Transaction"("payment_id");

-- CreateIndex
CREATE INDEX "Transaction_payment_id_idx" ON "Transaction"("payment_id");
