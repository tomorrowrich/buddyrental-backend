-- CreateTable
CREATE TABLE "Buddy" (
    "buddy_id" UUID NOT NULL,
    "withdrawable_coin_amount" DOUBLE PRECISION NOT NULL,
    "average_rating" DOUBLE PRECISION,
    "min_price" DOUBLE PRECISION NOT NULL,
    "max_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Buddy_pkey" PRIMARY KEY ("buddy_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_buddy_id_key" ON "Buddy"("buddy_id");

-- AddForeignKey
ALTER TABLE "Buddy" ADD CONSTRAINT "Buddy_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
