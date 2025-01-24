/*
  Warnings:

  - You are about to drop the `member_friends` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[kakaoUserId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "member_friends" DROP CONSTRAINT "member_friends_friendId_fkey";

-- DropForeignKey
ALTER TABLE "member_friends" DROP CONSTRAINT "member_friends_memberId_fkey";

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "kakaoUserId" TEXT;

-- DropTable
DROP TABLE "member_friends";

-- DropEnum
DROP TYPE "FriendState";

-- CreateTable
CREATE TABLE "MemberFriend" (
    "memberId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,

    CONSTRAINT "MemberFriend_pkey" PRIMARY KEY ("memberId","friendId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_kakaoUserId_key" ON "Member"("kakaoUserId");

-- AddForeignKey
ALTER TABLE "MemberFriend" ADD CONSTRAINT "MemberFriend_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFriend" ADD CONSTRAINT "MemberFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
