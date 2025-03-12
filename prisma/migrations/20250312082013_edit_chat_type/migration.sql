/*
  Warnings:

  - Added the required column `status` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatMessageStatus" AS ENUM ('WAITING', 'SENT', 'READ');

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "status" "ChatMessageStatus" NOT NULL;
