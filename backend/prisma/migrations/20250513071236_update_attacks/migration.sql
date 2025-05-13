/*
  Warnings:

  - You are about to drop the column `turnFinished` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "turnFinished",
ADD COLUMN     "attacks" INTEGER DEFAULT 0;
