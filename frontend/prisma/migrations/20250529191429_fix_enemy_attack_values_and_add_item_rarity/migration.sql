/*
  Warnings:

  - Changed the type of `attack` on the `Enemy` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary');

-- AlterTable
ALTER TABLE "Enemy" DROP COLUMN "attack",
ADD COLUMN     "attack" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShopItem" ADD COLUMN     "rarity" "Rarity" NOT NULL DEFAULT 'Common';
