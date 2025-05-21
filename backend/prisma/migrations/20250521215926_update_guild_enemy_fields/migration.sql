/*
  Warnings:

  - The primary key for the `GuildEnemy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `GuildEnemy` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `turns` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GuildEnemy" DROP CONSTRAINT "GuildEnemy_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "GuildEnemy_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "turns" SET NOT NULL;
