/*
  Warnings:

  - You are about to drop the column `tagetValue` on the `Mission` table. All the data in the column will be lost.
  - Added the required column `targetValue` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "tagetValue",
ADD COLUMN     "targetValue" INTEGER NOT NULL;
