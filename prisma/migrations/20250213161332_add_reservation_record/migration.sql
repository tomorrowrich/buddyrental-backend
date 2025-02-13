-- CreateTable
CREATE TABLE "ReservationRecord" (
    "reservation_id" UUID NOT NULL,
    "price_coin" DOUBLE PRECISION NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "create_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "buddy_id" UUID NOT NULL,

    CONSTRAINT "ReservationRecord_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRecord_reservation_id_key" ON "ReservationRecord"("reservation_id");

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;
