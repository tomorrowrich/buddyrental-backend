-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(64) NOT NULL,
    "last_name" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(64) NOT NULL,
    "last_name" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "citizen_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "display_name" VARCHAR(255),
    "gender" "UserGender" NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(64) NOT NULL,
    "postalCode" VARCHAR(16) NOT NULL,
    "profile_picture" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Buddy" (
    "buddy_id" UUID NOT NULL,
    "balance_withdrawable" DOUBLE PRECISION NOT NULL,
    "rating_avg" DOUBLE PRECISION,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "price_min" DOUBLE PRECISION NOT NULL,
    "price_max" DOUBLE PRECISION,
    "tags_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Buddy_pkey" PRIMARY KEY ("buddy_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "BuddyTag" (
    "buddy_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "BuddyTag_pkey" PRIMARY KEY ("buddy_id","tag_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewId" SERIAL NOT NULL,
    "commenterId" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewId")
);

-- CreateTable
CREATE TABLE "ReservationRecord" (
    "reservation_id" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "reservation_start" TIMESTAMP NOT NULL,
    "reservation_end" TIMESTAMP NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "user_id" UUID NOT NULL,
    "buddy_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ReservationRecord_pkey" PRIMARY KEY ("reservation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_admin_id_key" ON "Admin"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_user_id_key" ON "Admin"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_citizen_id_key" ON "User"("citizen_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_phone_number_key" ON "User"("email", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_buddy_id_key" ON "Buddy"("buddy_id");

-- CreateIndex
CREATE UNIQUE INDEX "Buddy_user_id_key" ON "Buddy"("user_id");

-- CreateIndex
CREATE INDEX "Buddy_rating_avg_price_min_price_max_idx" ON "Buddy"("rating_avg", "price_min", "price_max");

-- CreateIndex
CREATE INDEX "Buddy_tags_count_idx" ON "Buddy"("tags_count");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_id_key" ON "Tag"("tag_id");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "BuddyTag_buddy_id_idx" ON "BuddyTag"("buddy_id");

-- CreateIndex
CREATE INDEX "BuddyTag_tag_id_idx" ON "BuddyTag"("tag_id");

-- CreateIndex
CREATE INDEX "Review_commenterId_idx" ON "Review"("commenterId");

-- CreateIndex
CREATE INDEX "Review_profileId_idx" ON "Review"("profileId");

-- CreateIndex
CREATE INDEX "Review_profileId_created_at_idx" ON "Review"("profileId", "created_at");

-- CreateIndex
CREATE INDEX "Review_deleted_at_idx" ON "Review"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationRecord_reservation_id_key" ON "ReservationRecord"("reservation_id");

-- CreateIndex
CREATE INDEX "ReservationRecord_user_id_idx" ON "ReservationRecord"("user_id");

-- CreateIndex
CREATE INDEX "ReservationRecord_buddy_id_idx" ON "ReservationRecord"("buddy_id");

-- CreateIndex
CREATE INDEX "ReservationRecord_reservation_start_idx" ON "ReservationRecord"("reservation_start");

-- CreateIndex
CREATE INDEX "ReservationRecord_status_idx" ON "ReservationRecord"("status");

-- CreateIndex
CREATE INDEX "ReservationRecord_deleted_at_idx" ON "ReservationRecord"("deleted_at");

-- CreateIndex
CREATE INDEX "ReservationRecord_user_id_reservation_start_idx" ON "ReservationRecord"("user_id", "reservation_start");

-- CreateIndex
CREATE INDEX "ReservationRecord_buddy_id_reservation_start_idx" ON "ReservationRecord"("buddy_id", "reservation_start");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Buddy" ADD CONSTRAINT "Buddy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyTag" ADD CONSTRAINT "BuddyTag_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyTag" ADD CONSTRAINT "BuddyTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("tag_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_commenterId_fkey" FOREIGN KEY ("commenterId") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_buddy_id_fkey" FOREIGN KEY ("buddy_id") REFERENCES "Buddy"("buddy_id") ON DELETE CASCADE ON UPDATE CASCADE;
