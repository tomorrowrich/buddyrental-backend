-- AlterTable
ALTER TABLE "Reports" ALTER COLUMN "buddy_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;
