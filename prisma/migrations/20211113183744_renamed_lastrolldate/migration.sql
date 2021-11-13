/*
  Warnings:

  - You are about to drop the column `lastRollDate` on the `Players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Players" DROP COLUMN "lastRollDate",
ADD COLUMN     "lastRollChangeDate" TIMESTAMP(3);
