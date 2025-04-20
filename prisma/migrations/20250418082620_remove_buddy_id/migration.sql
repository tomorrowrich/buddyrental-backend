-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "buddy_id" UUID;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
