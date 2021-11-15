/*
  Warnings:

  - You are about to drop the column `lastClaimDate` on the `Players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Players" DROP COLUMN "lastClaimDate",
ADD COLUMN     "lastClaimChangeDate" TIMESTAMP(3);
