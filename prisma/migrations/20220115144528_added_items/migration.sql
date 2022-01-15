-- CreateTable
CREATE TABLE "Items" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rootItemId" INTEGER NOT NULL,
    "childItemId" INTEGER NOT NULL,
    "itemTier" INTEGER NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "itemDescription" JSONB NOT NULL,
    "startingItem" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL,
    "restrictedRoles" TEXT NOT NULL,
    "itemIconUrl" TEXT NOT NULL,
    "iconId" INTEGER NOT NULL,
    "activeFlag" BOOLEAN NOT NULL,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);
