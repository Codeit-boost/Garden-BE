/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendState" AS ENUM ('PENDING', 'FRIEND');

-- CreateEnum
CREATE TYPE "FocusCategory" AS ENUM ('STUDY', 'WORK', 'ETC');

-- CreateEnum
CREATE TYPE "FocusState" AS ENUM ('IN_PROGRESS', 'WILTED', 'BLOOMED');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "alarm" BOOLEAN DEFAULT false,
    "mode" TEXT,
    "sound" TEXT,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_friends" (
    "memberId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" "FriendState" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "member_friends_pkey" PRIMARY KEY ("memberId","friendId")
);

-- CreateTable
CREATE TABLE "Flower" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "growthImg1" TEXT,
    "growthImg2" TEXT,
    "growthImg3" TEXT,
    "bloomImg" TEXT,
    "witherImg" TEXT,

    CONSTRAINT "Flower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberFlower" (
    "memberId" INTEGER NOT NULL,
    "flowerId" INTEGER NOT NULL,
    "unlocked" BOOLEAN DEFAULT false,

    CONSTRAINT "MemberFlower_pkey" PRIMARY KEY ("memberId","flowerId")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "flowerId" INTEGER,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Floriography" (
    "id" SERIAL NOT NULL,
    "flower" TEXT NOT NULL,
    "languageText" TEXT NOT NULL,

    CONSTRAINT "Floriography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusTime" (
    "id" SERIAL NOT NULL,
    "category" "FocusCategory" NOT NULL,
    "targetTime" INTEGER NOT NULL DEFAULT 0,
    "time" INTEGER NOT NULL,
    "flowerId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "state" "FocusState" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "FocusTime_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member_friends" ADD CONSTRAINT "member_friends_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_friends" ADD CONSTRAINT "member_friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFlower" ADD CONSTRAINT "MemberFlower_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFlower" ADD CONSTRAINT "MemberFlower_flowerId_fkey" FOREIGN KEY ("flowerId") REFERENCES "Flower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_flowerId_fkey" FOREIGN KEY ("flowerId") REFERENCES "Flower"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTime" ADD CONSTRAINT "FocusTime_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTime" ADD CONSTRAINT "FocusTime_flowerId_fkey" FOREIGN KEY ("flowerId") REFERENCES "Flower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
