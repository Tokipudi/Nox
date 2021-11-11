/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Achievements` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "cardsExchanged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsGiven" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsStolen" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_name_key" ON "Achievements"("name");
