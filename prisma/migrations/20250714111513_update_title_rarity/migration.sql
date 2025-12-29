-- AlterEnum
ALTER TYPE "Rarity" ADD VALUE 'Mythic';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "titleRarity" "Rarity" DEFAULT 'Common';
