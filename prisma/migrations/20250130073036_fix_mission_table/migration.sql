/*
  Warnings:

  - You are about to drop the column `memberId` on the `Mission` table. All the data in the column will be lost.
  - Added the required column `tagetValue` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('CONSECUTIVE_PLANTING', 'TOTAL_FLOWERS', 'FOCUS_TIME');

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_memberId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "memberId",
ADD COLUMN     "tagetValue" INTEGER NOT NULL,
ADD COLUMN     "type" "MissionType" NOT NULL;

-- CreateTable
CREATE TABLE "MemberMission" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "missionId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MemberMission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberMission_memberId_missionId_key" ON "MemberMission"("memberId", "missionId");

-- AddForeignKey
ALTER TABLE "MemberMission" ADD CONSTRAINT "MemberMission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberMission" ADD CONSTRAINT "MemberMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
