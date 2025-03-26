/*
  Warnings:

  - You are about to alter the column `name` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED');

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "name" SET DATA TYPE VARCHAR(24);

-- CreateTable
CREATE TABLE "ReportsCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,

    CONSTRAINT "ReportsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "buddy_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "details" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reports_deleted_at_idx" ON "Reports"("deleted_at");

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ReportsCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
