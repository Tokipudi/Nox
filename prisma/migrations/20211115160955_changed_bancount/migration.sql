/*
  Warnings:

  - Made the column `banCount` on table `Players` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Players" ALTER COLUMN "banCount" SET NOT NULL;
