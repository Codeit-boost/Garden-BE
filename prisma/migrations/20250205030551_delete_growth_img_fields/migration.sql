/*
  Warnings:

  - You are about to drop the column `growthImg1` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `growthImg2` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `growthImg3` on the `Flower` table. All the data in the column will be lost.
  - You are about to drop the column `witherImg` on the `Flower` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Flower" DROP COLUMN "growthImg1",
DROP COLUMN "growthImg2",
DROP COLUMN "growthImg3",
DROP COLUMN "witherImg";
