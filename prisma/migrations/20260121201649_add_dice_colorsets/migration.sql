-- CreateEnum
CREATE TYPE "ShopItemCurrency" AS ENUM ('GOLD', 'GEMSTONES');

-- AlterEnum
ALTER TYPE "ShopItemType" ADD VALUE 'DiceColorset';

-- AlterTable
ALTER TABLE "ShopItem" ADD COLUMN     "currency" "ShopItemCurrency" NOT NULL DEFAULT 'GOLD',
ADD COLUMN     "gemstonesSpentReq" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "diceColorset" TEXT;
