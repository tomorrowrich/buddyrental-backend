-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "Reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
