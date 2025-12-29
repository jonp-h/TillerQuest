-- CreateEnum
CREATE TYPE "Access" AS ENUM ('Shop', 'Arena', 'DiceCorner', 'GuildLeader');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AbilityType" ADD VALUE 'Access';
ALTER TYPE "AbilityType" ADD VALUE 'LastStand';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "access" "Access"[];
