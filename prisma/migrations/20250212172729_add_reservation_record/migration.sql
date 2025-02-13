-- CreateTable
CREATE TABLE "Credential" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "citizen_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "display_name" VARCHAR(255),
    "gender" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "profile_picture" TEXT,
    "description" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Buddy" (
    "buddy_id" UUID NOT NULL,
    "withdrawable_coin_amount" DOUBLE PRECISION NOT NULL,
    "average_rating" DOUBLE PRECISION,
    "min_price" DOUBLE PRECISION NOT NULL,
    "max_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Buddy_pkey" PRIMARY KEY ("buddy_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewId" SERIAL NOT NULL,
    "commenterId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewId")
);

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
CREATE UNIQUE INDEX "Credential_user_id_key" ON "Credential"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_email_key" ON "Credential"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_buddy_id_key" ON "Buddy"("buddy_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRecord_reservation_id_key" ON "ReservationRecord"("reservation_id");

-- AddForeignKey
ALTER TABLE "Buddy" ADD CONSTRAINT "Buddy_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;
