/*
  Warnings:

  - The `turnFinished` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `icon` on table `Enemy` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Enemy" ALTER COLUMN "icon" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "turnFinished",
ADD COLUMN     "turnFinished" INTEGER DEFAULT 0;
