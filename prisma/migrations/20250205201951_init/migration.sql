-- CreateTable
CREATE TABLE "Credential" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "description" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "profile_picture" TEXT,
    "address" TEXT,
    "phone_number" TEXT,
    "citizen_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_email_key" ON "Credential"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Credential"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
