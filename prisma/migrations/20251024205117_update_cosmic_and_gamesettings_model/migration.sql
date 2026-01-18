/*
  Warnings:

  - You are about to drop the column `selected` on the `CosmicEvent` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `WishVote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ApplicationSettings" ADD COLUMN     "description" TEXT;

-- AlterTable: Rename occurrences to occurrencesVg2 and copy selected to selectedForVg2
ALTER TABLE "public"."CosmicEvent" 
RENAME COLUMN "occurrences" TO "occurrencesVg2";

ALTER TABLE "public"."CosmicEvent" 
RENAME COLUMN "selected" TO "selectedForVg2";

-- AlterTable: Add new columns for Vg1
ALTER TABLE "public"."CosmicEvent" 
ADD COLUMN "occurrencesVg1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "selectedForVg1" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."WishVote" DROP COLUMN "username",
ADD COLUMN     "anonymous" BOOLEAN NOT NULL DEFAULT false;
