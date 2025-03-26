/*
  Warnings:

  - A unique constraint covering the columns `[schedule_id]` on the table `ReservationRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schedule_id` to the `ReservationRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('AVAILABLE', 'UNCONFIRMED', 'BUSY');

-- AlterTable
ALTER TABLE "ReservationRecord" ADD COLUMN     "schedule_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Schedule" (
    "schedule_id" UUID NOT NULL,
    "buddyId" UUID NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "ScheduleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_schedule_id_key" ON "Schedule"("schedule_id");

-- CreateIndex
CREATE INDEX "Schedule_buddyId_idx" ON "Schedule"("buddyId");

-- CreateIndex
CREATE INDEX "Schedule_status_idx" ON "Schedule"("status");

-- CreateIndex
CREATE INDEX "Schedule_start_end_idx" ON "Schedule"("start", "end");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRecord_schedule_id_key" ON "ReservationRecord"("schedule_id");

-- CreateIndex
CREATE INDEX "ReservationRecord_schedule_id_idx" ON "ReservationRecord"("schedule_id");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_buddyId_fkey" FOREIGN KEY ("buddyId") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("schedule_id") ON DELETE RESTRICT ON UPDATE CASCADE;
