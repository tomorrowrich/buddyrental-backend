/*
  Warnings:

  - You are about to drop the column `user_id` on the `Admin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_user_id_fkey";

-- DropIndex
DROP INDEX "Admin_user_id_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "admin_id" UUID;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
