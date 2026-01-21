-- AlterTable
ALTER TABLE "ShopItem" ADD COLUMN     "questId" INTEGER;

-- CreateTable
CREATE TABLE "Quest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rewardXp" INTEGER,
    "rewardGold" INTEGER,
    "rewardItemId" INTEGER,
    "questGiver" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quest_name_key" ON "Quest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_rewardItemId_key" ON "Quest"("rewardItemId");

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_rewardItemId_fkey" FOREIGN KEY ("rewardItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
