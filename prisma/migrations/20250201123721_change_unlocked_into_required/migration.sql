/*
  Warnings:

  - Made the column `unlocked` on table `MemberFlower` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MemberFlower" ALTER COLUMN "unlocked" SET NOT NULL;
