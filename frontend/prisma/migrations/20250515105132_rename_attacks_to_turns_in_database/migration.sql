/*
  Warnings:

  - You are about to drop the column `attacks` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "attacks",
ADD COLUMN     "turns" INTEGER DEFAULT 0;
