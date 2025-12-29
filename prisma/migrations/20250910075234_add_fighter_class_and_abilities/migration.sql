-- AlterEnum
ALTER TYPE "public"."AbilityCategory" ADD VALUE 'Fighter';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AbilityType" ADD VALUE 'VictoryGold';
ALTER TYPE "public"."AbilityType" ADD VALUE 'VictoryMana';
ALTER TYPE "public"."AbilityType" ADD VALUE 'Crit';

-- AlterEnum
ALTER TYPE "public"."Class" ADD VALUE 'Fighter';
