-- AlterTable
ALTER TABLE "Players" ADD COLUMN     "claimedCards" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PlayersSeasonsArchive" ADD COLUMN     "cardsExchanged" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsGiven" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cardsStolen" INTEGER NOT NULL DEFAULT 0;
